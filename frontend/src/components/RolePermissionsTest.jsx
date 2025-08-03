import { CheckCircle, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export default function RolePermissionsTest({ user }) {
  // Todos los usuarios tienen acceso total
  const allPermissions = {
    'Ver Dashboard': true,
    'Registrar Gastos': true,
    'Ver todos los Gastos': true,
    'Panel de Control': true,
    'Gestión de Usuarios': true,
    'Gestión de Fondos': true,
    'Aprobar Gastos': true,
    'Exportar Reportes': true
  };

  const roleColors = {
    admin_principal: { label: 'Administrador Principal', color: 'text-red-500' },
    contadora: { label: 'Contadora', color: 'text-blue-500' },
    socio_operador: { label: 'Socio Operador', color: 'text-green-500' }
  };

  const userRole = roleColors[user?.role] || { label: 'Usuario', color: 'text-gray-500' };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Permisos del Usuario: <span className={userRole.color}>{userRole.label}</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(allPermissions).map(([permiso, tiene]) => (
          <div key={permiso} className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-300">
              {permiso}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/30">
        <p className="text-green-400 text-sm">
          <strong>✅ Acceso Total:</strong> Todos los usuarios tienen acceso completo a todas las funcionalidades del sistema.
        </p>
      </div>
    </div>
  );
}

RolePermissionsTest.propTypes = {
  user: PropTypes.object.isRequired
};