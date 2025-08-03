import { CheckCircle, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';

export default function RolePermissionsTest({ user }) {
  const permissions = {
    admin_principal: {
      label: 'Administrador Principal',
      color: 'text-red-500',
      permisos: {
        'Ver Dashboard': true,
        'Registrar Gastos': true,
        'Ver todos los Gastos': true,
        'Panel de Control': true,
        'Gestión de Usuarios': true,
        'Gestión de Fondos': true,
        'Aprobar Gastos': true,
        'Exportar Reportes': true
      }
    },
    contadora: {
      label: 'Contadora',
      color: 'text-blue-500',
      permisos: {
        'Ver Dashboard': true,
        'Registrar Gastos': true,
        'Ver todos los Gastos': true,
        'Panel de Control': false,
        'Gestión de Usuarios': false,
        'Gestión de Fondos': true,
        'Aprobar Gastos': false,
        'Exportar Reportes': true
      }
    },
    socio_operador: {
      label: 'Socio Operador',
      color: 'text-green-500',
      permisos: {
        'Ver Dashboard': true,
        'Registrar Gastos': true,
        'Ver todos los Gastos': false,
        'Panel de Control': true,
        'Gestión de Usuarios': true,
        'Gestión de Fondos': false,
        'Aprobar Gastos': false,
        'Exportar Reportes': false
      }
    }
  };

  const userPermissions = permissions[user?.role] || permissions.socio_operador;

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Permisos del Usuario: <span className={userPermissions.color}>{userPermissions.label}</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(userPermissions.permisos).map(([permiso, tiene]) => (
          <div key={permiso} className="flex items-center space-x-2">
            {tiene ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm ${tiene ? 'text-gray-300' : 'text-gray-500'}`}>
              {permiso}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/30">
        <p className="text-yellow-400 text-sm">
          <strong>Nota:</strong> Los permisos se aplican automáticamente según tu rol. 
          Si intentas acceder a una sección sin permisos, serás redirigido al Dashboard.
        </p>
      </div>
    </div>
  );
}

RolePermissionsTest.propTypes = {
  user: PropTypes.object.isRequired
};