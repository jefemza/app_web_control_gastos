import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { subscribeToNotifications, marcarNotificacionLeida, marcarTodasLeidas, getUnreadCount } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    // Obtener conteo inicial
    getUnreadCount(user.id).then(setUnreadCount);

    // Suscribirse a notificaciones
    const unsubscribe = subscribeToNotifications(user.id, (notifs) => {
      setNotifications(notifs.slice(0, 5)); // Solo mostrar las 5 más recientes
      const unread = notifs.filter(n => !n.leida).length;
      setUnreadCount(unread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await marcarNotificacionLeida(notificationId);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await marcarTodasLeidas(user.id);
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
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-80 bg-esm-dark border border-gray-700 rounded-lg shadow-xl z-50">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-esm-gold hover:text-esm-gold/80 mt-2"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Cargando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No tienes notificaciones
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-700 hover:bg-esm-gray cursor-pointer transition-colors ${
                      !notif.leida ? 'bg-esm-gray/50' : ''
                    }`}
                    onClick={() => {
                      if (!notif.leida) {
                        handleMarkAsRead(notif.id, { stopPropagation: () => {} });
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notif.tipo)}
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">
                          {notif.titulo}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.mensaje}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.leida && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-gray-700">
              <button
                onClick={() => {
                  navigate('/notificaciones');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-esm-gold hover:text-esm-gold/80"
              >
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

NotificationBell.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};