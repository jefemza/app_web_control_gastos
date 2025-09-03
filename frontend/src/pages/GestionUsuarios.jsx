import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserPlus, Edit2, Trash2, Shield, Mail, RefreshCw, Search } from 'lucide-react';
import Header from '../components/Header';
import { useToast } from '../components/ui/Toast';
import { ROLES } from '../constants/roles';
import { userService } from '../services/userService';
import { auditService } from '../services/auditService';

export default function GestionUsuarios({ user, onLogout }) {
  const navigate = useNavigate();
  const { success, error, ToastContainer } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    estado: 'activo'
  });

  // Verificar permisos de acceso
  useEffect(() => {
    if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
      error('No tienes permisos para acceder a esta sección');
      navigate('/dashboard');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      error('Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios según criterios de búsqueda
  const filteredUsers = () => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter) {
      result = result.filter(u => u.estado === statusFilter);
    }
    
    return result;
  };

  // Verificar si el usuario actual puede realizar una acción
  const canPerformAction = (action, targetUser = null) => {
    if (user.role === 'superadmin') return true;
    
    if (user.role === 'admin') {
      switch (action) {
        case 'create_user':
          return true; // Solo puede crear usuarios 'user'
        case 'edit_user':
          return targetUser?.role === 'user'; // Solo puede editar usuarios 'user'
        case 'delete_user':
          return false; // No puede eliminar usuarios
        case 'change_role':
          return false; // No puede cambiar roles
        default:
          return false;
      }
    }
    
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setProcesando(true);

      // Validaciones
      if (!formData.name.trim()) {
        error('El nombre es obligatorio');
        return;
      }
      if (!formData.email.trim()) {
        error('El email es obligatorio');
        return;
      }
      if (!formData.role) {
        error('El rol es obligatorio');
        return;
      }
      if (!usuarioEditando && !formData.password) {
        error('La contraseña es obligatoria para nuevos usuarios');
        return;
      }

      // Verificar permisos
      if (usuarioEditando) {
        if (!canPerformAction('edit_user', usuarioEditando)) {
          error('No tienes permisos para editar este usuario');
          return;
        }
      } else {
        if (!canPerformAction('create_user')) {
          error('No tienes permisos para crear usuarios');
          return;
        }
        // ADMIN solo puede crear usuarios 'user'
        if (user.role === 'admin' && formData.role !== 'user') {
          error('Solo puedes crear usuarios con rol "user"');
          return;
        }
      }

      if (usuarioEditando) {
        // Editar usuario existente
        const datosActualizacion = {
          name: formData.name,
          estado: formData.estado
        };

        // Solo SUPERADMIN puede cambiar roles
        if (user.role === 'superadmin' && formData.role !== usuarioEditando.role) {
          datosActualizacion.role = formData.role;
        }

        // Solo incluir email si cambió
        if (formData.email !== usuarioEditando.email) {
          datosActualizacion.email = formData.email;
        }

        await userService.updateUser(usuarioEditando.id, datosActualizacion);
        
        // Auditoría
        await auditService.logAction({
          usuarioId: user.id || user.uid,
          usuarioEmail: user.email,
          usuarioNombre: user.name,
          accion: 'EDITAR_USUARIO',
          entidad: 'usuarios',
          entidadId: usuarioEditando.id,
          detalles: `Usuario editado: ${formData.name} (${formData.email})`,
          valorAnterior: usuarioEditando,
          valorNuevo: { ...usuarioEditando, ...datosActualizacion }
        });

        success('Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        const newUser = await userService.createUser(formData);
        
        // Auditoría
        await auditService.logAction({
          usuarioId: user.id || user.uid,
          usuarioEmail: user.email,
          usuarioNombre: user.name,
          accion: 'CREAR_USUARIO',
          entidad: 'usuarios',
          entidadId: newUser.id,
          detalles: `Nuevo usuario creado: ${formData.name} (${formData.email}) - Rol: ${formData.role}`,
          valorNuevo: newUser
        });

        success('Usuario creado correctamente');
      }

      // Resetear formulario
      resetFormulario();
      loadUsers();

    } catch (err) {
      error('Error: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleEditar = (usuario) => {
    if (!canPerformAction('edit_user', usuario)) {
      error('No tienes permisos para editar este usuario');
      return;
    }

    setUsuarioEditando(usuario);
    setFormData({
      name: usuario.name || '',
      email: usuario.email || '',
      role: usuario.role || '',
      password: '',
      estado: usuario.estado || 'activo'
    });
    setMostrarFormulario(true);
  };

  const handleEliminar = async (usuario) => {
    if (!canPerformAction('delete_user', usuario)) {
      error('No tienes permisos para eliminar usuarios');
      return;
    }

    if (!confirm(`¿Está seguro de eliminar permanentemente al usuario "${usuario.name}"?\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      setProcesando(true);
      await userService.deleteUser(usuario.id);
      
      // Auditoría
      await auditService.logAction({
        usuarioId: user.id || user.uid,
        usuarioEmail: user.email,
        usuarioNombre: user.name,
        accion: 'ELIMINAR_USUARIO',
        entidad: 'usuarios',
        entidadId: usuario.id,
        detalles: `Usuario eliminado: ${usuario.name} (${usuario.email})`,
        valorAnterior: usuario
      });

      success('Usuario eliminado correctamente');
      loadUsers();
    } catch (err) {
      error('Error al eliminar usuario: ' + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const resetFormulario = () => {
    setFormData({ name: '', email: '', role: '', password: '', estado: 'activo' });
    setUsuarioEditando(null);
    setMostrarFormulario(false);
  };

  const getRoleBadge = (role) => {
    const estilos = {
      superadmin: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      admin: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      socio: 'bg-green-500/20 text-green-400 border-green-500/50',
      user: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    };
    const nombres = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      socio: 'Socio',
      user: 'Usuario'
    };
    return { estilo: estilos[role] || '', nombre: nombres[role] || role };
  };

  const getStatusColor = (estado) => {
    return estado === 'activo' 
      ? 'bg-green-500/20 text-green-400 border-green-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-esm-darker">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-3 text-white">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Cargando usuarios...</span>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  const stats = {
    total: users.length,
    activos: users.filter(u => u.estado === 'activo').length,
    inactivos: users.filter(u => u.estado === 'inactivo').length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    socio: users.filter(u => u.role === 'socio').length,
    user: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="min-h-screen bg-esm-darker">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navegación */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-esm-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </button>

        {/* Título y estadísticas */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-light text-white mb-2 flex items-center space-x-3">
              <Users className="w-8 h-8 text-esm-gold" />
              <span>Gestión de Usuarios</span>
            </h1>
            <p className="text-gray-400">Administre los usuarios del sistema</p>
            
            {/* Estadísticas rápidas */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-esm-gray/30 rounded-lg p-3 border border-gray-700">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Total</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">{stats.activos}</div>
                <div className="text-sm text-green-400">Activos</div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                <div className="text-2xl font-bold text-purple-400">{stats.superadmin + stats.admin}</div>
                <div className="text-sm text-purple-400">Administradores</div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                <div className="text-2xl font-bold text-blue-400">{stats.user}</div>
                <div className="text-sm text-blue-400">Usuarios</div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={loadUsers}
              disabled={procesando}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${procesando ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
            
            {canPerformAction('create_user') && (
              <button
                onClick={() => {
                  setMostrarFormulario(true);
                  setUsuarioEditando(null);
                  resetFormulario();
                }}
                disabled={procesando}
                className="bg-esm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-6 bg-esm-gray/30 rounded-lg p-4 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-esm-darker border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
            >
              <option value="">Todos los roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="socio">Socio</option>
              <option value="user">Usuario</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('');
                setStatusFilter('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Formulario de usuario */}
        {mostrarFormulario && (
          <div className="bg-esm-gray/50 rounded-lg p-8 border border-gray-700 mb-8 animate-slide-up">
            <h3 className="text-xl font-medium text-white mb-6">
              {usuarioEditando ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={procesando}
                  className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-esm-gold transition-colors disabled:opacity-50"
                  placeholder="Ej: Juan Pablo Rúa"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={procesando}
                  className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-esm-gold transition-colors disabled:opacity-50"
                  placeholder="Ej: juan.pablo@esm.com.ar"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={procesando || (user.role === 'admin' && !usuarioEditando)}
                  className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-esm-gold transition-colors disabled:opacity-50"
                >
                  <option value="">Seleccionar rol...</option>
                  {user.role === 'superadmin' && (
                    <>
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="socio">Socio</option>
                      <option value="user">Usuario</option>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <option value="user">Usuario</option>
                  )}
                </select>
                {user.role === 'admin' && !usuarioEditando && (
                  <p className="text-sm text-gray-400 mt-1">Solo puedes crear usuarios con rol "Usuario"</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  {usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!usuarioEditando}
                  disabled={procesando}
                  minLength="6"
                  className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-esm-gold transition-colors disabled:opacity-50"
                  placeholder={usuarioEditando ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                />
              </div>

              {usuarioEditando && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    disabled={procesando}
                    className="w-full bg-esm-darker border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-esm-gold transition-colors disabled:opacity-50"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetFormulario}
                  disabled={procesando}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={procesando}
                  className="bg-esm-gold text-black font-medium px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {procesando && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{usuarioEditando ? 'Actualizar' : 'Crear Usuario'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de usuarios */}
        <div className="bg-esm-gray/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-esm-gray border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers().map((usuario) => {
                  const { estilo, nombre } = getRoleBadge(usuario.role);
                  const estadoBadge = getStatusColor(usuario.estado);
                  const isCurrentUser = usuario.id === user.id;
                  
                  return (
                    <tr key={usuario.id} className={`hover:bg-esm-gray/50 transition-colors ${isCurrentUser ? 'bg-esm-gold/5' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-esm-gold to-yellow-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-black font-bold text-sm">
                              {getInitials(usuario.name)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {usuario.name || 'Sin nombre'}
                              {isCurrentUser && <span className="ml-2 text-xs text-esm-gold">(Tú)</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="w-4 h-4 mr-2 text-gray-500" />
                          {usuario.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-gray-500" />
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${estilo}`}>
                            {nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${estadoBadge}`}>
                          {usuario.estado || 'activo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {canPerformAction('edit_user', usuario) && (
                            <button
                              onClick={() => handleEditar(usuario)}
                              disabled={procesando}
                              className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          
                          {!isCurrentUser && canPerformAction('delete_user', usuario) && (
                            <button
                              onClick={() => handleEliminar(usuario)}
                              disabled={procesando}
                              className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                              title="Eliminar permanentemente"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers().length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || roleFilter || statusFilter ? 'No se encontraron usuarios con los filtros aplicados' : 'No hay usuarios registrados'}
              </p>
            </div>
          )}
        </div>

        {/* Información de permisos */}
        <div className="mt-8 bg-esm-gray/30 rounded-lg p-6 border border-gray-700">
          <h4 className="text-lg font-medium text-white mb-4">Permisos por Rol</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h5 className="text-purple-400 font-medium mb-2">Super Admin</h5>
              <ul className="text-gray-400 space-y-1">
                <li>• Control total del sistema</li>
                <li>• Gestionar todos los usuarios</li>
                <li>• Ver auditoría completa</li>
                <li>• Reset total de aplicación</li>
              </ul>
            </div>
            <div>
              <h5 className="text-blue-400 font-medium mb-2">Admin</h5>
              <ul className="text-gray-400 space-y-1">
                <li>• Crear usuarios "user"</li>
                <li>• Editar usuarios "user"</li>
                <li>• Gestionar fondos</li>
                <li>• Importar/exportar gastos</li>
              </ul>
            </div>
            <div>
              <h5 className="text-green-400 font-medium mb-2">Socio</h5>
              <ul className="text-gray-400 space-y-1">
                <li>• Registrar gastos</li>
                <li>• Ver todos los gastos</li>
                <li>• Acceso limitado</li>
              </ul>
            </div>
            <div>
              <h5 className="text-gray-400 font-medium mb-2">Usuario</h5>
              <ul className="text-gray-400 space-y-1">
                <li>• Registrar gastos</li>
                <li>• Ver sus propios gastos</li>
                <li>• Acceso básico</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      <ToastContainer />
    </div>
  );
}