// ========================================
// 📋 Página de Auditoría - ESM Argentina
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../services/auditService';
import { exportToCSV } from '../utils/csvExport';

const Auditoria = ({ user }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    usuario: '',
    accion: '',
    entidad: '',
    limit: 50
  });

  // Verificar acceso - Solo SUPERADMIN
  useEffect(() => {
    if (!user || user.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const auditFilters = {};
      
      if (filters.fechaDesde) {
        auditFilters.fechaDesde = new Date(filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        auditFilters.fechaHasta = new Date(filters.fechaHasta);
      }
      if (filters.usuario) {
        auditFilters.usuarioId = filters.usuario;
      }
      if (filters.accion) {
        auditFilters.accion = filters.accion;
      }
      if (filters.entidad) {
        auditFilters.entidad = filters.entidad;
      }
      if (filters.limit) {
        auditFilters.limit = parseInt(filters.limit);
      }

      const [logsData, statsData] = await Promise.all([
        auditService.getAuditLogs(auditFilters),
        auditService.getAuditStats(auditFilters)
      ]);

      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando logs de auditoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const csvData = await auditService.exportAuditLogs(filters);
      const filename = `auditoria_esm_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Crear blob y descargar
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando logs:', error);
    }
  };

  const getActionColor = (accion) => {
    const colors = {
      'CREAR_GASTO': 'bg-green-500/20 text-green-400',
      'MODIFICAR_GASTO': 'bg-yellow-500/20 text-yellow-400',
      'ELIMINAR_GASTO': 'bg-red-500/20 text-red-400',
      'APROBAR_GASTO': 'bg-blue-500/20 text-blue-400',
      'RECHAZAR_GASTO': 'bg-orange-500/20 text-orange-400',
      'GESTIONAR_FONDOS': 'bg-purple-500/20 text-purple-400',
      'GESTIONAR_USUARIOS': 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[accion] || 'bg-gray-500/20 text-gray-400';
  };

  const getEntityIcon = (entidad) => {
    const icons = {
      'gastos': '💰',
      'fondos': '🏦',
      'usuarios': '👥',
      'auditoria': '📋'
    };
    return icons[entidad] || '📄';
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadAuditLogs();
    }
  }, [user, filters]);

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-esm-gray p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📋 Auditoría del Sistema</h1>
          <p className="text-gray-400">Control total de todas las acciones realizadas en el sistema</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/20 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Acciones</p>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Últimas 24h</p>
                <p className="text-2xl font-bold text-white">{stats.ultimas24h || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Esta Semana</p>
                <p className="text-2xl font-bold text-white">{stats.ultimaSemana || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Usuarios Activos</p>
                <p className="text-2xl font-bold text-white">{Object.keys(stats.porUsuario || {}).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-black/20 rounded-lg p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">🔍 Filtros de Búsqueda</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Desde</label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Fecha Hasta</label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Usuario</label>
              <input
                type="text"
                placeholder="Email del usuario"
                value={filters.usuario}
                onChange={(e) => setFilters({...filters, usuario: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Acción</label>
              <select
                value={filters.accion}
                onChange={(e) => setFilters({...filters, accion: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              >
                <option value="">Todas las acciones</option>
                <option value="CREAR_GASTO">Crear Gasto</option>
                <option value="MODIFICAR_GASTO">Modificar Gasto</option>
                <option value="ELIMINAR_GASTO">Eliminar Gasto</option>
                <option value="APROBAR_GASTO">Aprobar Gasto</option>
                <option value="RECHAZAR_GASTO">Rechazar Gasto</option>
                <option value="GESTIONAR_FONDOS">Gestión de Fondos</option>
                <option value="GESTIONAR_USUARIOS">Gestión de Usuarios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Entidad</label>
              <select
                value={filters.entidad}
                onChange={(e) => setFilters({...filters, entidad: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              >
                <option value="">Todas las entidades</option>
                <option value="gastos">Gastos</option>
                <option value="fondos">Fondos</option>
                <option value="usuarios">Usuarios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Límite</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-esm-gold"
              >
                <option value="25">25 registros</option>
                <option value="50">50 registros</option>
                <option value="100">100 registros</option>
                <option value="200">200 registros</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={loadAuditLogs}
              disabled={loading}
              className="px-6 py-2 bg-esm-gold text-black font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-50"
            >
              {loading ? '🔄 Cargando...' : '🔍 Aplicar Filtros'}
            </button>

            <button
              onClick={() => setFilters({
                fechaDesde: '',
                fechaHasta: '',
                usuario: '',
                accion: '',
                entidad: '',
                limit: 50
              })}
              className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
            >
              🗑️ Limpiar Filtros
            </button>

            <button
              onClick={exportAuditLogs}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
            >
              📄 Exportar CSV
            </button>
          </div>
        </div>

        {/* Lista de Logs */}
        <div className="bg-black/20 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white">
              📋 Registro de Auditoría ({logs.length} registros)
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-esm-gold mx-auto"></div>
                <p className="text-gray-400 mt-2">Cargando registros de auditoría...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No se encontraron registros de auditoría con los filtros aplicados
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {logs.map((log) => (
                  <div key={log.id} className="p-6 hover:bg-black/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEntityIcon(log.entidad)}</span>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.accion)}`}>
                            {log.accion}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {log.timestamp?.toLocaleString('es-AR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {log.entidadId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-400">Usuario</p>
                        <p className="text-white font-medium">{log.usuarioNombre} ({log.usuarioEmail})</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Entidad</p>
                        <p className="text-white">{log.entidad}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-400">Detalles</p>
                      <p className="text-white">{log.detalles}</p>
                    </div>

                    {log.valorAnterior && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-400">Valor Anterior</p>
                        <pre className="text-xs bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.valorAnterior), null, 2)}
                        </pre>
                      </div>
                    )}

                    {log.valorNuevo && (
                      <div>
                        <p className="text-sm text-gray-400">Valor Nuevo</p>
                        <pre className="text-xs bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.valorNuevo), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
