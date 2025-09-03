import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import UserProfile from './UserProfile';
import { getRoleDescription } from '../constants/roles';
import PropTypes from 'prop-types';
import { subscribeAnnouncement, updateAnnouncement } from '../services/configService';

export default function Header({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [announcement, setAnnouncement] = useState({ active: false, message: '' });
  const [editing, setEditing] = useState(false);
  const [draftMsg, setDraftMsg] = useState('');

  useEffect(() => {
    const unsub = subscribeAnnouncement(setAnnouncement);
    return () => unsub && unsub();
  }, []);
  
  const roleDisplayName = {
    'superadmin': 'CEO',
    'admin': 'Administrador',
    'socio': 'Socio', 
    'user': 'Usuario',
    'admin_principal': 'Administrador',
    'socio_operador': 'Socio',
    'contadora': 'Contadora'
  };

  return (
    <>
      <header className="bg-esm-dark border-b border-gray-700">
        {announcement.active && announcement.message && (
          <div className="bg-black border-b border-blue-500/30">
            <div className="container mx-auto px-4 py-2 animate-slide-in-right">
              <p className="text-blue-neon text-sm text-center">{announcement.message}</p>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo_ESM Argentina.png" 
                alt="ESM Argentina" 
                className="h-10 w-auto logo-glow logo-scale"
              />
              <div>
                <h2 className="text-white font-medium">Control de Caja Chica</h2>
                <p className="text-gray-400 text-sm">Bienvenido, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">
                  {roleDisplayName[user.role] || 'Usuario'}
                </span>
              </button>
              
              <NotificationBell user={user} />
              
              {user?.role === 'superadmin' && (
                <button
                  onClick={() => { setEditing(true); setDraftMsg(announcement.message || ''); }}
                  className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                  title="Editar anuncio"
                >
                  <span>✎ Aviso</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Modal de edición de anuncio (solo superadmin) */}
      {editing && user?.role === 'superadmin' && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-esm-gray border border-gray-700 rounded-xl p-6 w-full max-w-lg animate-slide-up">
            <h3 className="text-white text-lg mb-4">Editar aviso del encabezado</h3>
            <textarea
              value={draftMsg}
              onChange={(e) => setDraftMsg(e.target.value)}
              rows={4}
              className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-esm-gold"
              placeholder="Escribe aquí el mensaje del aviso"
            />
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={Boolean(announcement.active)}
                  onChange={async (e) => {
                    await updateAnnouncement({ active: e.target.checked });
                  }}
                />
                Mostrar aviso
              </label>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-esm-gold text-black rounded hover:brightness-110"
                  onClick={async () => {
                    await updateAnnouncement({ message: draftMsg, active: true });
                    setEditing(false);
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de perfil */}
      {showProfile && (
        <UserProfile 
          user={user} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </>
  );
}

Header.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired
}