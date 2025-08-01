import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Filter, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Header from '../components/Header';
import { getUserNotifications, marcarNotificacionLeida, marcarTodasLeidas } from '../services/notificationService';
import PropTypes from 'prop-types';

export default function Notificaciones({ user, onLogout }) {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter]);

  const loadNotifications = async () => {
    try {
      const notifs = await getUserNotifications(user.id);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    switch (filter) {
      case 'no-leidas':
        setFilteredNotifications(notifications.filter(n => !n.leida));
        break;
      case 'leidas':
        setFilteredNotifications(notifications.filter(n => n.leida));
        break;
      default:
        setFilteredNotifications(notifications);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await marcarNotificacionLeida(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await marcarTodasLeidas(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'gasto_aprobado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'gasto_rechazado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'gasto_pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    if (hours < 24) return `Hace ${hours} horas`;
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <div className="min-h-screen gradient-bg">
      <Header user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-esm-gray rounded-xl shadow-xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-esm-dark p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-esm-gold" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
                  <p className="text-sm text-gray-400 mt-1">
                    Tienes {unreadCount} notificaciones sin leer
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-esm-gold text-black rounded-lg hover:bg-esm-gold/80 transition-colors"
                >
                  <CheckCheck className="h-4 w-4" />
                  Marcar todas como leídas
                </button>
              )}
            </div>
          </div>

          {/* Filtros */}
          <div className="p-4 border-b border-gray-700 bg-esm-dark/50">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('todas')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'todas' 
                      ? 'bg-esm-gold text-black' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('no-leidas')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'no-leidas' 
                      ? 'bg-esm-gold text-black' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  No leídas ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('leidas')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'leidas' 
                      ? 'bg-esm-gold text-black' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Leídas ({notifications.length - unreadCount})
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse text-gray-400">Cargando notificaciones...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">
                  {filter === 'no-leidas' 
                    ? 'No tienes notificaciones sin leer' 
                    : filter === 'leidas'
                    ? 'No tienes notificaciones leídas'
                    : 'No tienes notificaciones'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-esm-gray/30 transition-colors ${
                    !notification.leida ? 'bg-esm-gray/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.tipo)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${
                            !notification.leida ? 'text-white' : 'text-gray-300'
                          }`}>
                            {notification.titulo}
                          </h3>
                          <p className="text-gray-400 mt-1">
                            {notification.mensaje}
                          </p>
                          {notification.datos?.comentarioAdmin && (
                            <div className="mt-3 p-3 bg-esm-dark rounded-lg border border-gray-700">
                              <p className="text-sm text-gray-300">
                                <span className="text-gray-500">Comentario del administrador:</span>
                              </p>
                              <p className="text-sm text-white mt-1">
                                &ldquo;{notification.datos.comentarioAdmin}&rdquo;
                              </p>
                            </div>
                          )}
                          {notification.datos?.motivoRechazo && (
                            <div className="mt-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <p className="text-sm text-gray-300">
                                <span className="text-gray-500">Motivo del rechazo:</span>
                              </p>
                              <p className="text-sm text-white mt-1">
                                &ldquo;{notification.datos.motivoRechazo}&rdquo;
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-3">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.leida && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex-shrink-0 ml-4 p-2 text-gray-400 hover:text-white transition-colors"
                            title="Marcar como leída"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Notificaciones.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired
};