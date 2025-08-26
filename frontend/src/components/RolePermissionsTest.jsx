import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const RolePermissionsTest = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Mapeo de roles correctos
  const ROLE_MAPPING = {
    'admin_principal': 'superadmin',
    'contadora': 'admin',
    'socio_operador': 'socio',
    'user': 'user'
  };

  // Usuarios específicos y sus roles correctos - ESM Argentina
  const USER_ROLES = {
    'luis.tello@esm.com.ar': 'superadmin',      // Luis Tello - Control total
    'noelia@esm.com.ar': 'admin',               // Noelia Albornoz - Contadora
    'juan.pablo@esm.com.ar': 'socio',           // Juan Pablo Rúa - Socio
    'eugenio.cavallaro@esm.com.ar': 'socio'     // Eugenio Cavallaro - Socio
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'usuarios'));
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setMessage(`Cargados ${usersData.length} usuarios`);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'usuarios', userId), {
        role: newRole,
        fechaActualizacion: new Date(),
        roleActualizado: true
      });
      setMessage(`Rol actualizado para usuario ${userId} a ${newRole}`);
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error actualizando rol:', error);
      setMessage(`Error actualizando rol: ${error.message}`);
    }
  };

  const createLuisUser = async () => {
    try {
      const luisId = 'luis_superadmin_' + Date.now();
      await setDoc(doc(db, 'usuarios', luisId), {
        name: 'Luis Tello',
        email: 'luis.tello@esm.com.ar',
        role: 'superadmin',
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: 'system',
        descripcion: 'SuperAdmin - Acceso total al sistema'
      });
      setMessage('Usuario Luis creado con rol SUPERADMIN');
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error creando usuario Luis:', error);
      setMessage(`Error creando usuario: ${error.message}`);
    }
  };

  const getCurrentUserInfo = () => {
    if (!user) return null;
    
    const currentUser = users.find(u => u.email === user.email);
    return currentUser;
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const currentUserInfo = getCurrentUserInfo();

  return (
    <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-medium text-white mb-6">🔧 Debug - Roles y Permisos</h2>
      
      {/* Información del usuario actual */}
      <div className="mb-6 p-4 bg-black/20 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">👤 Usuario Actual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Nombre:</span>
            <span className="text-white ml-2">{user?.name}</span>
          </div>
          <div>
            <span className="text-gray-400">Rol en Auth:</span>
            <span className="text-white ml-2">{user?.role || 'No definido'}</span>
          </div>
          <div>
            <span className="text-gray-400">Rol en Firestore:</span>
            <span className={`ml-2 ${currentUserInfo?.role === 'superadmin' ? 'text-green-400' : 'text-yellow-400'}`}>
              {currentUserInfo?.role || 'No encontrado'}
            </span>
          </div>
        </div>
        
        {currentUserInfo && currentUserInfo.role !== 'superadmin' && (
          <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ Tu rol actual ({currentUserInfo.role}) no es SUPERADMIN. 
              Esto puede causar problemas de acceso.
            </p>
            <button
              onClick={() => fixUserRole(currentUserInfo.id, 'superadmin')}
              className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
            >
              Corregir a SUPERADMIN
            </button>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={loadUsers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : '🔄 Recargar Usuarios'}
        </button>
        
        <button
          onClick={createLuisUser}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ➕ Crear Usuario Luis
        </button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded">
          <p className="text-blue-400 text-sm">{message}</p>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">📋 Todos los Usuarios ({users.length})</h3>
        
        {users.map(user => (
          <div key={user.id} className="p-4 bg-black/20 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-white font-medium">{user.name || 'Sin nombre'}</span>
                <span className="text-gray-400 ml-2">({user.email})</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' :
                user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                user.role === 'socio' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {user.role || 'Sin rol'}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 mb-2">
              ID: {user.id} | Estado: {user.estado || 'activo'}
            </div>
            
            {/* Botones de corrección */}
            <div className="flex flex-wrap gap-2">
              {USER_ROLES[user.email] && user.role !== USER_ROLES[user.email] && (
                <button
                  onClick={() => fixUserRole(user.id, USER_ROLES[user.email])}
                  className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Corregir a {USER_ROLES[user.email]}
                </button>
              )}
              
              {ROLE_MAPPING[user.role] && user.role !== ROLE_MAPPING[user.role] && (
                <button
                  onClick={() => fixUserRole(user.id, ROLE_MAPPING[user.role])}
                  className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Mapear a {ROLE_MAPPING[user.role]}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No hay usuarios en la base de datos
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// 🔧 Debug Component - Roles y Permisos
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

export default RolePermissionsTest;