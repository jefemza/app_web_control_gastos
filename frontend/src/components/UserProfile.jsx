import { User, Shield, CheckCircle } from 'lucide-react';
import { getRoleDescription, getRolePrivileges } from '../constants/roles';
import PropTypes from 'prop-types';

export default function UserProfile({ user, onClose }) {
  const roleDescription = getRoleDescription(user.role);
  const privileges = getRolePrivileges(user.role);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400/20 rounded-full p-2">
              <User className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Perfil de Usuario</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Información del usuario */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <p className="text-white font-medium">{user.name || user.displayName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <p className="text-white">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded text-sm font-medium">
                {user.role?.toUpperCase() || 'SIN ROL'}
              </span>
            </div>
            <p className="text-gray-300 text-sm mt-1">{roleDescription}</p>
          </div>
        </div>

        {/* Privilegios */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-yellow-400" />
            <span>Privilegios del Sistema</span>
          </h3>
          
          <div className="space-y-2">
            {privileges.map((privilege, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="mt-0.5">
                  {privilege.startsWith('✅') && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {privilege.startsWith('👁️') && (
                    <div className="w-4 h-4 text-blue-400 text-center">👁️</div>
                  )}
                  {privilege.startsWith('📊') && (
                    <div className="w-4 h-4 text-purple-400 text-center">📊</div>
                  )}
                  {privilege.startsWith('❌') && (
                    <div className="w-4 h-4 text-red-400 text-center">❌</div>
                  )}
                </div>
                <span className={`text-sm ${
                  privilege.startsWith('✅') ? 'text-green-300' :
                  privilege.startsWith('👁️') ? 'text-blue-300' :
                  privilege.startsWith('📊') ? 'text-purple-300' :
                  privilege.startsWith('❌') ? 'text-red-300' :
                  'text-gray-300'
                }`}>
                  {privilege.substring(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string.isRequired,
    role: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired
};