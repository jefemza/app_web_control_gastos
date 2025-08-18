import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import UserProfile from './UserProfile';
import { getRoleDescription } from '../constants/roles';
import PropTypes from 'prop-types';

export default function Header({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo_ESM Argentina.png" 
                alt="ESM Argentina" 
                className="h-10 w-auto"
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
};