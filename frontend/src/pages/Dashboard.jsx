import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Users, TrendingUp, PlusCircle, Eye, Shield, RefreshCw, BarChart2, Wallet, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import TestDataButton from '../components/TestDataButton';
import NotificationSummary from '../components/notifications/NotificationSummary';
import PieChartGastos from '../components/charts/PieChartGastos';
import BarChartMensual from '../components/charts/BarChartMensual';
import LineChartTendencia from '../components/charts/LineChartTendencia';
import ResumenEstadisticas from '../components/charts/ResumenEstadisticas';
import FiltroPeriodo from '../components/charts/FiltroPeriodo';
import { 
  subscribeToGastos, 
  obtenerGastosPorCategoria,
  obtenerGastosPorMes,
  obtenerTendenciaGastos,
  obtenerEstadisticasResumen,
  procesarDatosParaGraficos
} from '../services/gastosService';
import { getResumenFondos, subscribeToFondos } from '../services/fondosService';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/formatters';
import { debugFirebase, testWritePermissions } from '../utils/debugFirebase';
import RolePermissionsTest from '../components/RolePermissionsTest';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGastos: 0,
    totalMonto: 0,
    pendientes: 0,
    aprobados: 0
  });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  const [mostrarGraficos, setMostrarGraficos] = useState(true);
  const [datosGraficos, setDatosGraficos] = useState({
    porCategoria: {},
    porMes: [],
    tendencia: [],
    resumen: {}
  });
  const [fondosInfo, setFondosInfo] = useState({
    totalDisponible: 0,
    totalGastado: 0,
    porcentajeUsado: 0
  });

  useEffect(() => {
    // Suscribirse a cambios en tiempo real
    let unsubscribeGastos;
    let unsubscribeFondos;
    
    const procesarGastos = (gastos) => {
      // Estadísticas básicas
      const totalMonto = gastos.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
      const pendientes = gastos.filter(g => g.estado === 'pendiente').length;
      const aprobados = gastos.filter(g => g.estado === 'aprobado').length;
      
      setStats({
        totalGastos: gastos.length,
        totalMonto,
        pendientes,
        aprobados
      });

      // Datos para gráficos
      const gastosFiltrados = procesarDatosParaGraficos(gastos, periodo);
      setDatosGraficos({
        porCategoria: obtenerGastosPorCategoria(gastosFiltrados),
        porMes: obtenerGastosPorMes(gastos),
        tendencia: obtenerTendenciaGastos(gastos),
        resumen: obtenerEstadisticasResumen(gastos)
      });
      
      setLoading(false);
    };
    
    // Todos los usuarios ven todas las estadísticas
    unsubscribeGastos = subscribeToGastos(procesarGastos);

    // Todos los usuarios pueden ver la información de fondos
    unsubscribeFondos = subscribeToFondos(async () => {
      const resumen = await getResumenFondos();
      setFondosInfo({
        totalDisponible: resumen.totalDisponible,
        totalGastado: resumen.totalGastado,
        porcentajeUsado: resumen.porcentajeUsado
      });
    });

    return () => {
      unsubscribeGastos();
      unsubscribeFondos();
    };
  }, [user, periodo]);

  // Todos los usuarios tienen acceso a todas las opciones
  const menuItems = [
    { icon: PlusCircle, label: 'Registrar Gasto', path: '/registro-gastos', color: 'from-green-500 to-emerald-600' },
    { icon: Shield, label: 'Panel de Control', path: '/panel-control', color: 'from-purple-500 to-indigo-600' },
    { icon: Eye, label: 'Ver Todos los Gastos', path: '/vista-gastos', color: 'from-blue-500 to-cyan-600' },
    { icon: Wallet, label: 'Gestión de Fondos', path: '/fondos', color: 'from-yellow-500 to-amber-600' },
    { icon: Users, label: 'Gestión de Usuarios', path: '/usuarios', color: 'from-orange-500 to-red-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-esm-darker">
        <Header user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-esm-gold animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-esm-darker">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Título y bienvenida */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-white mb-2">
              Bienvenido, {user.name}
            </h1>
            <p className="text-gray-400">
              {user.role === 'admin_principal' && 'Panel de Administración Principal'}
              {user.role === 'socio_operador' && 'Panel de Socio Operador'}
              {user.role === 'contadora' && 'Panel de Contadora'}
            </p>
          </div>
        </div>

        {/* Menú de opciones - MOVIDO ARRIBA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-90`} />
                <div className="relative z-10">
                  <Icon className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">{item.label}</h3>
                  <p className="text-white/80 text-sm">
                    {item.label === 'Registrar Gasto' && 'Registre un nuevo gasto de caja chica'}
                    {item.label === 'Panel de Control' && 'Gestione y apruebe gastos pendientes'}
                    {item.label === 'Ver Todos los Gastos' && 'Consulte el historial completo'}
                    {item.label === 'Ver Mis Gastos' && 'Consulte sus gastos registrados'}
                    {item.label === 'Gestión de Fondos' && 'Administre los ingresos de caja'}
                    {item.label === 'Gestión de Usuarios' && 'Administre usuarios del sistema'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Botón para mostrar/ocultar métricas */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Métricas y Análisis</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMostrarGraficos(!mostrarGraficos)}
              className="flex items-center space-x-2 px-4 py-2 bg-esm-gray border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <BarChart2 className="w-5 h-5 text-esm-gold" />
              <span className="text-white">
                {mostrarGraficos ? 'Ocultar' : 'Mostrar'} Métricas
              </span>
            </button>
            
            {/* Botones de debug temporales - SOLO PARA ADMIN */}
            {user?.role === 'admin_principal' && (
              <>
                <button
                  onClick={() => debugFirebase()}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  title="Debug Firebase"
                >
                  Debug
                </button>
                <button
                  onClick={() => testWritePermissions()}
                  className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                  title="Test Permisos"
                >
                  Test
                </button>
              </>
            )}
          </div>
        </div>

        {mostrarGraficos && (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{stats.totalGastos}</span>
                </div>
                <p className="text-blue-100">Total Gastos</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{formatCurrency(stats.totalMonto)}</span>
                </div>
                <p className="text-green-100">Monto Total</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{stats.pendientes}</span>
                </div>
                <p className="text-yellow-100">Pendientes</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 opacity-80" />
                  <span className="text-2xl font-bold">{stats.aprobados}</span>
                </div>
                <p className="text-purple-100">Aprobados</p>
              </div>
            </div>

            {/* Información de Fondos - Solo para admin y contadora */}
            {(user.role === 'admin_principal' || user.role === 'contadora') && (
              <div className="bg-esm-gray rounded-xl p-6 border border-gray-700 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-esm-gold" />
                    Control de Fondos
                  </h3>
                  <button
                    onClick={() => navigate('/fondos')}
                    className="text-sm text-esm-gold hover:text-yellow-400 transition-colors"
                  >
                    Ver detalles →
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Saldo Disponible</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(fondosInfo.totalDisponible)}
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Total Gastado</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(fondosInfo.totalGastado)}
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Porcentaje Usado</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-esm-gold">
                        {fondosInfo.porcentajeUsado}%
                      </p>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-esm-gold h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, fondosInfo.porcentajeUsado)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {fondosInfo.totalDisponible < 1000 && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Fondos bajos. Considere registrar un nuevo ingreso.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notificaciones pendientes para admin */}
            {user.role === 'admin_principal' && (
              <NotificationSummary user={user} />
            )}

            {/* Gráficos y análisis */}
            {(user.role === 'admin_principal' || user.role === 'contadora') && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <BarChart2 className="h-6 w-6 text-esm-gold" />
                    <h2 className="text-xl font-semibold text-white">Análisis de Gastos</h2>
                  </div>
                  <FiltroPeriodo periodo={periodo} onChange={setPeriodo} />
                </div>

                {/* Resumen de estadísticas */}
                <ResumenEstadisticas estadisticas={datosGraficos.resumen} />

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico de torta - Gastos por categoría */}
                  <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Gastos por Categoría</h3>
                    <PieChartGastos data={datosGraficos.porCategoria} />
                  </div>

                  {/* Gráfico de barras - Gastos por mes */}
                  <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-medium text-white mb-4">Comparativa Mensual</h3>
                    <BarChartMensual data={datosGraficos.porMes} />
                  </div>

                  {/* Gráfico de línea - Tendencia */}
                  <div className="bg-esm-gray rounded-xl p-6 border border-gray-700 lg:col-span-2">
                    <h3 className="text-lg font-medium text-white mb-4">Tendencia de Gastos (Últimos 30 días)</h3>
                    <LineChartTendencia data={datosGraficos.tendencia} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Botón de Test Data - Solo en desarrollo */}
        <TestDataButton user={user} />
        
        {/* Componente de prueba de permisos - Solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="container mx-auto px-4 mt-8">
            <RolePermissionsTest user={user} />
          </div>
        )}
      </main>
    </div>
  );
}

Dashboard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    uid: PropTypes.string,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }).isRequired,
  onLogout: PropTypes.func.isRequired
};