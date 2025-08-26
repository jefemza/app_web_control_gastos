// Sistema de roles y permisos - ESM Argentina
export const ROLES = {
  SUPERADMIN: 'superadmin', // Luis Tello - Control total + desarrollo
  ADMIN: 'admin',           // Noelia Albornoz - Control total (Contadora)
  SOCIO: 'socio',           // Juan Pablo Rúa, Eugenio Cavallaro - Solo visualización
  USER: 'user'              // Empleados - Operación básica
};

export const PERMISOS = {
  // Permisos de gestión total
  GESTIONAR_USUARIOS: 'gestionar_usuarios',
  GESTIONAR_FONDOS: 'gestionar_fondos',
  APROBAR_GASTOS: 'aprobar_gastos',
  RECHAZAR_GASTOS: 'rechazar_gastos',
  MODIFICAR_GASTOS: 'modificar_gastos',
  ELIMINAR_GASTOS: 'eliminar_gastos',
  
  // Permisos de visualización
  VER_TODOS_GASTOS: 'ver_todos_gastos',
  VER_REPORTES_COMPLETOS: 'ver_reportes_completos',
  VER_DASHBOARD_COMPLETO: 'ver_dashboard_completo',
  
  // Permisos de operación
  CREAR_GASTOS: 'crear_gastos',
  VER_GASTOS_PROPIOS: 'ver_gastos_propios',
  EXPORTAR_DATOS: 'exportar_datos',
  
  // Permisos de auditoría
  VER_LOG_AUDITORIA: 'ver_log_auditoria',
  EXPORTAR_LOG: 'exportar_log'
};

// Definir permisos por rol
export const PERMISOS_POR_ROL = {
  [ROLES.SUPERADMIN]: [
    // TODOS los permisos + extras de desarrollo
    PERMISOS.GESTIONAR_USUARIOS,
    PERMISOS.GESTIONAR_FONDOS,
    PERMISOS.APROBAR_GASTOS,
    PERMISOS.RECHAZAR_GASTOS,
    PERMISOS.MODIFICAR_GASTOS,
    PERMISOS.ELIMINAR_GASTOS,
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS,
    PERMISOS.VER_LOG_AUDITORIA,
    PERMISOS.EXPORTAR_LOG
  ],
  
  [ROLES.ADMIN]: [
    // Control total de la aplicación (Contadora)
    PERMISOS.GESTIONAR_FONDOS,
    PERMISOS.APROBAR_GASTOS,
    PERMISOS.RECHAZAR_GASTOS,
    PERMISOS.MODIFICAR_GASTOS,
    PERMISOS.ELIMINAR_GASTOS,
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS,
    PERMISOS.VER_LOG_AUDITORIA,
    PERMISOS.EXPORTAR_LOG
  ],
  
  [ROLES.SOCIO]: [
    // Solo visualización y carga propia (Socios)
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS
  ],
  
  [ROLES.USER]: [
    // Operación básica (Empleados)
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS
  ]
};

// Función para verificar permisos
export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISOS_POR_ROL[userRole] || [];
  return rolePermissions.includes(permission);
};

// Función para obtener descripción del rol
export const getRoleDescription = (role) => {
  const descriptions = {
    [ROLES.SUPERADMIN]: 'SuperAdmin - Control total del sistema (Luis Tello)',
    [ROLES.ADMIN]: 'Administrador - Control total de la aplicación (Noelia Albornoz - Contadora)',
    [ROLES.SOCIO]: 'Socio - Visualización completa, carga de gastos (Juan Pablo Rúa, Eugenio Cavallaro)',
    [ROLES.USER]: 'Usuario - Carga de gastos propios únicamente'
  };
  return descriptions[role] || 'Rol no definido';
};

// Función para obtener privilegios del rol
export const getRolePrivileges = (role) => {
  const privileges = {
    [ROLES.SUPERADMIN]: [
      '👑 CONTROL TOTAL DEL SISTEMA',
      '✅ Gestión completa de usuarios',
      '✅ Administración de fondos y presupuestos',
      '✅ Aprobar y rechazar gastos',
      '✅ Modificar y eliminar gastos',
      '✅ Ver todos los gastos y reportes',
      '✅ Exportar datos completos',
      '✅ Acceso a logs de auditoría',
      '🛠️ Herramientas de desarrollo',
      '⚙️ Configuración del sistema'
    ],
    [ROLES.ADMIN]: [
      '👩‍💼 CONTROL TOTAL DE LA APLICACIÓN',
      '✅ Administración de fondos y presupuestos',
      '✅ Aprobar y rechazar gastos',
      '✅ Modificar y eliminar gastos',
      '✅ Ver todos los gastos y reportes',
      '✅ Exportar datos completos',
      '✅ Acceso a logs de auditoría',
      '📊 Responsable del proceso interno'
    ],
    [ROLES.SOCIO]: [
      '👥 ACCESO DE SOCIO',
      '✅ Cargar gastos propios',
      '👁️ Ver todos los gastos (solo lectura)',
      '👁️ Acceso completo al dashboard',
      '📊 Exportar datos y estadísticas',
      '❌ No puede aprobar/rechazar gastos',
      '❌ No puede modificar gastos de otros',
      '❌ Sin acceso a gestión interna'
    ],
    [ROLES.USER]: [
      '👤 ACCESO BÁSICO',
      '✅ Cargar gastos propios',
      '👁️ Ver solo sus gastos',
      '❌ No ve gastos de otros usuarios',
      '❌ No puede aprobar/rechazar',
      '❌ Sin acceso a gestión'
    ]
  };
  return privileges[role] || ['Sin privilegios definidos'];
};

// Mapeo de usuarios específicos
export const USER_ROLES = {
  'luis.tello@esm.com.ar': ROLES.SUPERADMIN,
  'noelia@esm.com.ar': ROLES.ADMIN,
  'juan.pablo@esm.com.ar': ROLES.SOCIO,
  'eugenio.cavallaro@esm.com.ar': ROLES.SOCIO
};