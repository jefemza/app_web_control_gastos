import { LogOut } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import PropTypes from 'prop-types';

export default function Header({ user, onLogout }) {
  return (
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
            <span className="text-gray-400 text-sm">
              {user.role === 'admin_principal' ? 'Administrador' : 
               user.role === 'socio_operador' ? 'Socio' : 
               user.role === 'contadora' ? 'Contadora' : 'Usuario'}
            </span>
            
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
  );
}

Header.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired
};