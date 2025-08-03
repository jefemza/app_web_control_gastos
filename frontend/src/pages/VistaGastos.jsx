import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, CheckCircle, XCircle, Clock, Filter, AlertCircle, RefreshCw, Paperclip } from 'lucide-react';
import Header from '../components/Header';
import FilePreview from '../components/FilePreview';
import { subscribeToGastos } from '../services/gastosService';
import { formatCurrency } from '../utils/formatters';
import PropTypes from 'prop-types';

const VistaGastos = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [gastosOriginales, setGastosOriginales] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedGasto, setExpandedGasto] = useState(null);

  useEffect(() => {
    // Suscribirse a cambios en tiempo real
    let unsubscribe;
    
    // Todos los usuarios ven todos los gastos
    unsubscribe = subscribeToGastos((gastosData) => {
      setGastos(gastosData);
      setGastosOriginales(gastosData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Aplicar filtro
  useEffect(() => {
    if (filtroEstado) {
      setGastos(gastosOriginales.filter(g => g.estado === filtroEstado));
    } else {
      setGastos(gastosOriginales);
    }
  }, [filtroEstado, gastosOriginales]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'aprobado':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'rechazado':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-4 h-4" />;
      case 'aprobado':
        return <CheckCircle className="w-4 h-4" />;
      case 'rechazado':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getMedioPagoIcon = (medio) => {
    const iconClass = "w-4 h-4 mr-2";
    switch (medio) {
      case 'efectivo':
        return <DollarSign className={iconClass} />;
      case 'transferencia':
        return <ArrowLeft className={iconClass} />;
      case 'billetera':
        return <Calendar className={iconClass} />;
      case 'tarjeta':
        return <Calendar className={iconClass} />;
      default:
        return <DollarSign className={iconClass} />;
    }
  };

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

  // Calcular totales
  const totalGastos = gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
  const totalAprobados = gastos
    .filter(g => g.estado === 'aprobado')
    .reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
  const totalPendientes = gastos
    .filter(g => g.estado === 'pendiente')
    .reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);

  return (
    <div className="min-h-screen bg-esm-darker">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
          <h1 className="text-3xl font-light text-white mb-2">
            {user.role === 'admin_principal' || user.role === 'contadora' 
              ? 'Todos los Gastos' 
              : 'Mis Gastos'}
          </h1>
          <p className="text-gray-400">
            {user.role === 'admin_principal' || user.role === 'contadora'
              ? 'Vista completa de todos los gastos registrados'
              : 'Historial de tus gastos registrados'}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-esm-gray/50 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total General</p>
            <p className="text-3xl font-bold text-white">${totalGastos.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{gastos.length} gastos registrados</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
            <p className="text-green-400 text-sm mb-2">Total Aprobado</p>
            <p className="text-3xl font-bold text-green-400">${totalAprobados.toLocaleString()}</p>
            <p className="text-xs text-green-400/70 mt-1">
              {gastos.filter(g => g.estado === 'aprobado').length} gastos
            </p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
            <p className="text-yellow-400 text-sm mb-2">Total Pendiente</p>
            <p className="text-3xl font-bold text-yellow-400">${totalPendientes.toLocaleString()}</p>
            <p className="text-xs text-yellow-400/70 mt-1">
              {gastos.filter(g => g.estado === 'pendiente').length} gastos
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Filtrar por estado:</span>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="bg-esm-gray border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-esm-gold transition-colors"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
          <p className="text-gray-400 text-sm">
            Mostrando {gastos.length} de {gastosOriginales.length} gastos
          </p>
        </div>

        {/* Lista de gastos */}
        {gastos.length === 0 ? (
          <div className="bg-esm-gray/50 rounded-lg p-12 border border-gray-700 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hay gastos que mostrar</p>
            <p className="text-gray-500 text-sm mt-2">
              {filtroEstado ? 'Prueba cambiando el filtro' : 'Los gastos aparecerán aquí cuando se registren'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {gastos.map((gasto) => (
              <div
                key={gasto.id}
                className="bg-esm-gray/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{gasto.categoria}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center space-x-1 ${getEstadoColor(gasto.estado)}`}>
                        {getEstadoIcon(gasto.estado)}
                        <span>{gasto.estado}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(gasto.fecha).toLocaleDateString('es-AR')}
                      {(user.role === 'admin_principal' || user.role === 'contadora') && (
                        <span className="ml-4">Por: {gasto.usuario}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-esm-gold">
                      {formatCurrency(gasto.monto)}
                    </p>
                    <p className="text-sm text-gray-400">{gasto.medioPago}</p>
                  </div>
                </div>

                {gasto.descripcion && (
                  <div className="mb-4">
                    <p className="text-gray-300">{gasto.descripcion}</p>
                  </div>
                )}

                {gasto.comentarioAdmin && (
                  <div className={`mt-4 p-3 rounded-lg border ${
                    gasto.estado === 'aprobado' 
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <p className={`text-sm ${
                      gasto.estado === 'aprobado' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <strong>Comentario Admin:</strong> {gasto.comentarioAdmin}
                    </p>
                  </div>
                )}

                {gasto.archivos && gasto.archivos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => setExpandedGasto(expandedGasto === gasto.id ? null : gasto.id)}
                      className="flex items-center space-x-2 text-sm text-gray-400 hover:text-esm-gold transition-colors mb-3"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span>{gasto.archivos.length} archivo(s) adjunto(s)</span>
                      <span className="text-xs">
                        {expandedGasto === gasto.id ? '(click para ocultar)' : '(click para ver)'}
                      </span>
                    </button>
                    
                    {expandedGasto === gasto.id && (
                      <div className="bg-gray-800/30 rounded-lg p-4">
                        <FilePreview archivos={gasto.archivos} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

VistaGastos.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default VistaGastos;