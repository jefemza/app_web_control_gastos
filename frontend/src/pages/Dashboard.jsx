import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, Users, TrendingUp, PlusCircle, Eye, Shield, RefreshCw, BarChart2, Wallet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import TestDataButton from '../components/TestDataButton';
import NotificationSummary from '../components/notifications/NotificationSummary';
import PieChartGastos from '../components/charts/PieChartGastos';
import BarChartMensual from '../components/charts/BarChartMensual';
import LineChartTendencia from '../components/charts/LineChartTendencia';
import ResumenEstadisticas from '../components/charts/ResumenEstadisticas';
import FiltroPeriodo from '../components/charts/FiltroPeriodo';
import TutorialInteractivo from '../components/TutorialInteractivo';
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
import { deleteAllGastos } from '../services/gastosService';
import ImportExportGastos from '../components/ImportExportGastos';
import { maintenanceService } from '../services/maintenanceService';
import UserCleanupButton from '../components/UserCleanupButton';
import EmailReportManager from '../components/EmailReportManager';
import VerificadorCuentas from '../components/VerificadorCuentas';


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
  
  // Verificar si es la primera vez del usuario
  const isFirstTime = !localStorage.getItem('tutorialCompleted');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 nav-menu">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 dashboard-stats">
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

        {/* Sección Especial de Gestión de Fondos para Noelia */}
        {user.role === 'admin' && (
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl p-8 border-2 border-blue-500/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Wallet className="w-8 h-8 mr-3 text-blue-400" />
                  💰 Gestión de Fondos - Resumen Ejecutivo
                </h2>
                <p className="text-blue-300 text-sm mt-1">
                  Control total de caja chica - Información en tiempo real
                </p>
              </div>
              <button
                onClick={() => navigate('/fondos')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <span>Gestionar Fondos</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </button>
            </div>
            
            {/* Cards principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Total Ingresado */}
              <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-green-400 text-sm font-medium">TOTAL</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(fondosInfo.totalDisponible + fondosInfo.totalGastado)}
                </p>
                <p className="text-green-300 text-sm">Total Ingresado</p>
              </div>

              {/* Saldo Disponible */}
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-blue-400 text-sm font-medium">DISPONIBLE</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(fondosInfo.totalDisponible)}
                </p>
                <p className="text-blue-300 text-sm">Saldo Actual</p>
              </div>

              {/* Total Gastado */}
              <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 rounded-xl p-6 border border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-red-400 text-sm font-medium">GASTADO</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {formatCurrency(fondosInfo.totalGastado)}
                </p>
                <p className="text-red-300 text-sm">Total Utilizado</p>
              </div>

              {/* Porcentaje de Uso */}
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-xl p-6 border border-yellow-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <BarChart2 className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-yellow-400 text-sm font-medium">USO</span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {fondosInfo.porcentajeUsado}%
                </p>
                <p className="text-yellow-300 text-sm">Porcentaje Utilizado</p>
              </div>
            </div>

            {/* Barra de progreso y alertas */}
            <div className="space-y-4">
              {/* Barra de progreso detallada */}
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Estado de Fondos</span>
                  <span className="text-gray-400 text-sm">
                    {fondosInfo.totalDisponible} / {fondosInfo.totalDisponible + fondosInfo.totalGastado}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, fondosInfo.porcentajeUsado)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Alertas y recomendaciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fondosInfo.totalDisponible < 1000 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium">⚠️ Fondos Bajos</p>
                        <p className="text-red-300 text-sm mt-1">
                          El saldo disponible es menor a $1,000. Considere registrar un nuevo ingreso de fondos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {fondosInfo.porcentajeUsado > 80 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium">📊 Alto Uso de Fondos</p>
                        <p className="text-yellow-300 text-sm mt-1">
                          Se ha utilizado más del 80% de los fondos. Planifique el próximo ingreso.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {fondosInfo.totalDisponible >= 1000 && fondosInfo.porcentajeUsado <= 80 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-green-400 font-medium">✅ Estado Óptimo</p>
                        <p className="text-green-300 text-sm mt-1">
                          Los fondos están en buen estado. Saldo suficiente y uso controlado.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

        {/* Herramientas de Administración - Solo para SUPERADMIN */}
        {user.role === 'superadmin' && (
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-esm-gray rounded-xl p-6 border border-gray-700 admin-tools">
              <h3 className="text-lg font-medium text-white flex items-center mb-4">
                <span className="text-2xl mr-3">⚙️</span>
                Herramientas de Administración
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auditoría */}
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">📋 Auditoría del Sistema</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Control total de todas las acciones realizadas en el sistema.
                  </p>
                  <button
                    onClick={() => navigate('/auditoria')}
                    className="px-4 py-2 bg-esm-gold text-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Ver Auditoría Completa
                  </button>
                </div>

                {/* Reset total de aplicación */}
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">♻️ Restaurar Aplicación</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Elimina todos los gastos e ingresos (fondos) y deja el sistema en cero.
                  </p>
                  <button
                    onClick={async () => {
                      if (window.confirm('⚠️ Esta acción eliminará TODOS los gastos e ingresos (fondos). ¿Confirmás el RESET TOTAL?')) {
                        try {
                          const result = await maintenanceService.resetApp(user);
                          alert(`Reset completado. Gastos eliminados: ${result.gastos}. Fondos eliminados: ${result.fondos}.`);
                          window.location.reload();
                        } catch (error) {
                          alert('Error en reset: ' + error.message);
                        }
                      }
                    }}
                    className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Restaurar Aplicación (Reset Total)
                  </button>
                </div>

                {/* Limpiar usuarios */}
                <UserCleanupButton user={user} />

                {/* Verificador de Consistencia de Cuentas */}
                <div className="bg-black/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">🔍 Verificar Cuentas</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Analiza la consistencia entre fondos y gastos para detectar inconsistencias.
                  </p>
                  <button
                    onClick={() => {
                      const verificador = document.getElementById('verificador-cuentas');
                      if (verificador) {
                        verificador.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Verificar Consistencia
                  </button>
                </div>

                
              </div>
            </div>
          </div>
        )}

        {/* Verificador de Consistencia de Cuentas - Solo para SUPERADMIN */}
        {user.role === 'superadmin' && (
          <div className="container mx-auto px-4 mt-8" id="verificador-cuentas">
            <VerificadorCuentas user={user} />
          </div>
        )}

        {/* Importación/Exportación Masiva - Solo para ADMIN y SUPERADMIN */}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <div className="container mx-auto px-4 mt-8">
            <ImportExportGastos user={user} />
          </div>
        )}

        {/* Gestión de Reportes por Email - Solo para ADMIN y SUPERADMIN */}
        {(user.role === 'admin' || user.role === 'superadmin') && (
          <div className="container mx-auto px-4 mt-8">
            <EmailReportManager user={user} />
          </div>
        )}
  
        {/* Botón de Test Data - Solo en desarrollo */}
        <TestDataButton user={user} />
        
        {/* Componente de prueba de permisos - Temporalmente habilitado para debug */}
        {user.role === 'superadmin' && (
          <div className="container mx-auto px-4 mt-8">
            <RolePermissionsTest user={user} />
          </div>
        )}

        {/* Tutorial Interactivo */}
        <TutorialInteractivo user={user} isFirstTime={isFirstTime} />
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