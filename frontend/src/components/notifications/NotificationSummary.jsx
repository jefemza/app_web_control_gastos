import { useState, useEffect } from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { getUserNotifications } from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function NotificationSummary({ user }) {
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const loadNotifications = async () => {
      try {
        const notifications = await getUserNotifications(user.id, 3);
        setRecentNotifications(notifications.filter(n => !n.leida));
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-esm-gray rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-20"></div>
      </div>
    );
  }

  if (recentNotifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-esm-gray rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-esm-gold" />
          <h3 className="text-lg font-semibold text-white">Notificaciones Pendientes</h3>
        </div>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {recentNotifications.length}
        </span>
      </div>

      <div className="space-y-3">
        {recentNotifications.map((notif) => (
          <div 
            key={notif.id}
            className="flex items-start gap-3 p-3 bg-esm-dark rounded-lg cursor-pointer hover:bg-esm-dark/80 transition-colors"
            onClick={() => navigate('/notificaciones')}
          >
            <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{notif.titulo}</p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.mensaje}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/notificaciones')}
        className="w-full mt-4 text-center text-sm text-esm-gold hover:text-esm-gold/80 transition-colors"
      >
        Ver todas las notificaciones →
      </button>
    </div>
  );
}

NotificationSummary.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired
  }).isRequired
};