import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Wallet, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import { createFondo, subscribeToFondos, getResumenFondos } from '../services/fondosService';
import { getUserByEmail } from '../services/usersService';
import { formatCurrency } from '../utils/formatters';

const GestionFondos = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fondos, setFondos] = useState([]);
  const [resumen, setResumen] = useState({
    totalIngresado: 0,
    totalGastado: 0,
    totalDisponible: 0
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    entregadoPor: '',
    recibidoPor: 'noelia@esm.com.ar',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ''
  });

  useEffect(() => {
    // Suscribirse a cambios en fondos
    const unsubscribe = subscribeToFondos(async (fondosData) => {
      setFondos(fondosData);
      
      // Calcular resumen
      const resumenData = await getResumenFondos();
      setResumen(resumenData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.monto || !formData.entregadoPor) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      console.log('Iniciando registro de fondo con datos:', formData);
      
      // Obtener información del usuario que recibe (Noelia)
      const receptorData = await getUserByEmail(formData.recibidoPor);
      console.log('Receptor data:', receptorData);
      
      const fondoData = {
        ...formData,
        monto: parseFloat(formData.monto),
        receptorId: receptorData?.id || 'noelia',
        receptorNombre: receptorData?.name || 'Noelia (Contadora)',
        registradoPor: user.name,
        registradoPorId: user.uid || user.id
      };
      
      console.log('Datos del fondo a crear:', fondoData);
      const result = await createFondo(fondoData);
      console.log('Fondo creado:', result);

      // Limpiar formulario
      setFormData({
        monto: '',
        entregadoPor: '',
        recibidoPor: 'noelia@esm.com.ar',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: ''
      });
      
      setShowForm(false);
      alert('Ingreso de fondos registrado exitosamente');
    } catch (error) {
      console.error('Error detallado al registrar fondos:', error);
      alert(`Error al registrar el ingreso de fondos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Solo admin y contadora pueden gestionar fondos
  if (user.role !== 'admin_principal' && user.role !== 'contadora') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-esm-darker">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-esm-gray border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-white">Gestión de Fondos</h1>
              <p className="text-gray-400 text-sm">Control de ingresos de caja chica</p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-esm-gold text-black rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Registrar Ingreso</span>
          </button>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Wallet className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-green-100 text-sm mb-1">Total Ingresado</p>
            <p className="text-3xl font-bold">${formatCurrency(resumen.totalIngresado)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-8 h-8 opacity-80" />
              <DollarSign className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-red-100 text-sm mb-1">Total Gastado</p>
            <p className="text-3xl font-bold">${formatCurrency(resumen.totalGastado)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 opacity-80" />
              <span className="text-sm bg-white/20 px-2 py-1 rounded">
                {((resumen.totalDisponible / resumen.totalIngresado) * 100 || 0).toFixed(0)}%
              </span>
            </div>
            <p className="text-blue-100 text-sm mb-1">Saldo Disponible</p>
            <p className="text-3xl font-bold">${formatCurrency(resumen.totalDisponible)}</p>
          </div>
        </div>

        {/* Formulario de nuevo ingreso */}
        {showForm && (
          <div className="bg-esm-gray rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-medium text-white mb-6">Registrar Nuevo Ingreso</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-esm-gold focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-esm-gold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entregado por <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.entregadoPor}
                  onChange={(e) => setFormData({ ...formData, entregadoPor: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-esm-gold focus:outline-none"
                  placeholder="Nombre de quien entrega los fondos"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recibido por
                </label>
                <input
                  type="text"
                  value="Noelia (Contadora)"
                  disabled
                  className="w-full px-4 py-3 bg-black/20 border border-gray-700 rounded-lg text-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción / Concepto
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white focus:border-esm-gold focus:outline-none"
                  rows="3"
                  placeholder="Ej: Reposición de caja chica para gastos operativos"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-esm-gold text-black rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Historial de ingresos */}
        <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-medium text-white mb-6">Historial de Ingresos</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Monto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Entregado por</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Recibo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Saldo Disponible</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {fondos.map((fondo) => (
                  <tr key={fondo.id} className="border-b border-gray-700/50 hover:bg-black/20">
                    <td className="py-4 px-4 text-white">
                      {new Date(fondo.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-green-400 font-medium">
                        +${formatCurrency(fondo.monto)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{fondo.entregadoPor}</td>
                    <td className="py-4 px-4 text-gray-400">
                      {fondo.numeroRecibo || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <span className="text-white font-medium">
                          ${formatCurrency(fondo.saldoDisponible)}
                        </span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({((fondo.saldoDisponible / fondo.monto) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        fondo.estado === 'activo' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {fondo.estado === 'activo' ? 'Activo' : 'Agotado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {fondos.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No hay ingresos registrados
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

GestionFondos.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default GestionFondos;