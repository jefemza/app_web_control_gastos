import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import Header from '../components/Header';
import { exportToCSV, formatGastosForCSV, gastosCSVHeaders } from '../utils/csvExport';
import { subscribeToGastos, aprobarGasto, rechazarGasto } from '../services/gastosService';
import { showToast } from '../components/notifications/ToastContainer';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIAS_GASTOS } from '../constants/categorias';
import PropTypes from 'prop-types';

export default function PanelControl({ user, onLogout }) {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [gastosOriginales, setGastosOriginales] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    usuario: '',
    categoria: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToGastos((gastosData) => {
      setGastos(gastosData);
      setGastosOriginales(gastosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let gastosFiltrados = [...gastosOriginales];

    if (filtros.usuario) {
      gastosFiltrados = gastosFiltrados.filter(g => g.usuario === filtros.usuario);
    }
    if (filtros.categoria) {
      gastosFiltrados = gastosFiltrados.filter(g => g.categoria === filtros.categoria);
    }
    if (filtros.estado) {
      gastosFiltrados = gastosFiltrados.filter(g => g.estado === filtros.estado);
    }
    if (filtros.fechaInicio) {
      gastosFiltrados = gastosFiltrados.filter(g => g.fecha >= filtros.fechaInicio);
    }
    if (filtros.fechaFin) {
      gastosFiltrados = gastosFiltrados.filter(g => g.fecha <= filtros.fechaFin);
    }

    setGastos(gastosFiltrados);
  }, [filtros, gastosOriginales]);

  const handleAprobar = async (gastoId) => {
    if (procesando) return;
    
    const comentario = prompt('Comentario (opcional):') || '';
    
    setProcesando(true);
    try {
      await aprobarGasto(gastoId, comentario);
      showToast('success', 'El gasto ha sido aprobado exitosamente');
    } catch (error) {
      console.error('Error al aprobar:', error);
      showToast('error', error.message || 'Error al aprobar el gasto');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazar = async (gastoId) => {
    if (procesando) return;
    
    const motivo = prompt('Motivo del rechazo:');
    if (!motivo) return;

    setProcesando(true);
    try {
      await rechazarGasto(gastoId, motivo);
      showToast('success', 'El gasto ha sido rechazado');
    } catch (error) {
      console.error('Error al rechazar:', error);
      showToast('error', 'Error al rechazar el gasto');
    } finally {
      setProcesando(false);
    }
  };

  const exportarCSV = async () => {
    setExportando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const datosFormateados = formatGastosForCSV(gastos);
      const fechaHoy = new Date().toISOString().split('T')[0];
      const filename = `gastos_caja_chica_${fechaHoy}.csv`;
      
      const exportado = exportToCSV(datosFormateados, gastosCSVHeaders, filename);
      
      if (exportado) {
        alert(`✅ CSV exportado con ${gastos.length} registros`);
      }
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('❌ Error al exportar el archivo CSV');
    } finally {
      setExportando(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      aprobado: 'bg-green-500/20 text-green-400 border-green-500/50',
      rechazado: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return estilos[estado] || '';
  };

  // Obtener usuarios únicos
  const usuariosUnicos = [...new Set(gastosOriginales.map(g => g.usuario))];

  if (loading) {
    return (
      <div className="min-h-screen bg-esm-darker">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-esm-gold animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando gastos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-esm-darker">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Navegación */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-400 hover:text-esm-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver al Dashboard</span>
        </button>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Panel de Control</h1>
          <p className="text-gray-400">Gestione y apruebe los gastos de caja chica</p>
        </div>

        {/* Filtros */}
        <div className="bg-esm-gray/50 rounded-lg p-6 border border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </h3>
            <button
              onClick={exportarCSV}
              disabled={exportando || gastos.length === 0}
              className={`font-medium px-4 py-2 rounded-lg transition-all flex items-center space-x-2 text-sm ${
                exportando || gastos.length === 0
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-esm-gold text-black hover:bg-yellow-400'
              }`}
            >
              <Download className={`w-4 h-4 ${exportando ? 'animate-pulse' : ''}`} />
              <span>{exportando ? 'Exportando...' : 'Exportar CSV'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              className="bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              value={filtros.usuario}
              onChange={(e) => setFiltros({ ...filtros, usuario: e.target.value })}
            >
              <option value="">Todos los usuarios</option>
              {usuariosUnicos.map(usuario => (
                <option key={usuario} value={usuario}>{usuario}</option>
              ))}
            </select>

            <select 
              className="bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              value={filtros.categoria}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS_GASTOS.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            <select 
              className="bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>

            <input 
              type="date"
              className="bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />

            <input 
              type="date"
              className="bg-esm-darker border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>
        </div>

        {/* Tabla de gastos */}
        <div className="bg-esm-gray/50 rounded-lg border border-gray-700 overflow-hidden">
          {gastos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No hay gastos que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-esm-gray border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descripción</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {gastos.map((gasto) => (
                    <tr key={gasto.id} className="hover:bg-esm-gray/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(gasto.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{gasto.usuario}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {formatCurrency(parseFloat(gasto.monto))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{gasto.categoria}</td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate" title={gasto.descripcion}>
                        {gasto.descripcion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getEstadoBadge(gasto.estado)}`}>
                          {gasto.estado}
                        </span>
                        {gasto.comentarioAdmin && (
                          <p className="text-xs text-gray-500 mt-1" title={gasto.comentarioAdmin}>
                            {gasto.comentarioAdmin.substring(0, 30)}...
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          {gasto.estado === 'pendiente' && (
                            <>
                              <button
                                onClick={() => handleAprobar(gasto.id)}
                                disabled={procesando}
                                className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                                title="Aprobar"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRechazar(gasto.id)}
                                disabled={procesando}
                                className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                                title="Rechazar"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-esm-gray/50 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Gastos</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0))}
            </p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <p className="text-yellow-400 text-sm">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-400">
              {gastos.filter(g => g.estado === 'pendiente').length}
            </p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <p className="text-green-400 text-sm">Aprobados</p>
            <p className="text-2xl font-bold text-green-400">
              {gastos.filter(g => g.estado === 'aprobado').length}
            </p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
            <p className="text-red-400 text-sm">Rechazados</p>
            <p className="text-2xl font-bold text-red-400">
              {gastos.filter(g => g.estado === 'rechazado').length}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

PanelControl.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired
  }).isRequired,
  onLogout: PropTypes.func.isRequired
};