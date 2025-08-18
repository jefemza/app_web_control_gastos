// Sistema de roles y permisos
export const ROLES = {
  SUPERADMIN: 'superadmin', // Luis - Acceso total + desarrollo
  ADMIN: 'admin',           // Noelia - Control total
  SOCIO: 'socio',           // Otros socios - Solo visualización
  USER: 'user'              // Empleados - Operación básica
};

export const PERMISOS = {
  // Permisos de gestión
  APROBAR_GASTOS: 'aprobar_gastos',
  RECHAZAR_GASTOS: 'rechazar_gastos',
  GESTIONAR_USUARIOS: 'gestionar_usuarios',
  GESTIONAR_FONDOS: 'gestionar_fondos',
  
  // Permisos de visualización
  VER_TODOS_GASTOS: 'ver_todos_gastos',
  VER_REPORTES_COMPLETOS: 'ver_reportes_completos',
  VER_DASHBOARD_COMPLETO: 'ver_dashboard_completo',
  
  // Permisos de operación
  CREAR_GASTOS: 'crear_gastos',
  VER_GASTOS_PROPIOS: 'ver_gastos_propios',
  EXPORTAR_DATOS: 'exportar_datos'
};

// Definir permisos por rol
export const PERMISOS_POR_ROL = {
  [ROLES.SUPERADMIN]: [
    // TODOS los permisos + extras de desarrollo
    PERMISOS.APROBAR_GASTOS,
    PERMISOS.RECHAZAR_GASTOS,
    PERMISOS.GESTIONAR_USUARIOS,
    PERMISOS.GESTIONAR_FONDOS,
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS
  ],
  
  [ROLES.ADMIN]: [
    // Todos los permisos
    PERMISOS.APROBAR_GASTOS,
    PERMISOS.RECHAZAR_GASTOS,
    PERMISOS.GESTIONAR_USUARIOS,
    PERMISOS.GESTIONAR_FONDOS,
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS
  ],
  
  [ROLES.SOCIO]: [
    // Solo visualización y carga propia
    PERMISOS.VER_TODOS_GASTOS,
    PERMISOS.VER_REPORTES_COMPLETOS,
    PERMISOS.VER_DASHBOARD_COMPLETO,
    PERMISOS.CREAR_GASTOS,
    PERMISOS.VER_GASTOS_PROPIOS,
    PERMISOS.EXPORTAR_DATOS
  ],
  
  [ROLES.USER]: [
    // Operación básica
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
    [ROLES.SUPERADMIN]: 'SuperAdmin - Acceso total + desarrollo del sistema',
    [ROLES.ADMIN]: 'Administrador - Control total del sistema',
    [ROLES.SOCIO]: 'Socio - Visualización completa, sin modificaciones',
    [ROLES.USER]: 'Usuario - Carga de gastos propios únicamente'
  };
  return descriptions[role] || 'Rol no definido';
};

// Función para obtener privilegios del rol
export const getRolePrivileges = (role) => {
  const privileges = {
    [ROLES.SUPERADMIN]: [
      '👑 ACCESO TOTAL AL SISTEMA',
      '✅ Aprobar y rechazar gastos',
      '✅ Gestionar usuarios del sistema', 
      '✅ Administrar fondos y presupuestos',
      '✅ Ver todos los gastos y reportes',
      '✅ Exportar datos completos',
      '✅ Cargar gastos propios',
      '🛠️ Acceso a herramientas de desarrollo',
      '⚙️ Configuración completa del sistema'
    ],
    [ROLES.ADMIN]: [
      '✅ Aprobar y rechazar gastos',
      '✅ Gestionar usuarios del sistema', 
      '✅ Administrar fondos y presupuestos',
      '✅ Ver todos los gastos y reportes',
      '✅ Exportar datos completos',
      '✅ Cargar gastos propios'
    ],
    [ROLES.SOCIO]: [
      '👁️ Ver todos los gastos y reportes',
      '👁️ Acceso completo al dashboard',
      '📊 Exportar datos y estadísticas',
      '✅ Cargar gastos propios',
      '❌ No puede aprobar/rechazar gastos',
      '❌ No puede gestionar usuarios ni configuraciones'
    ],
    [ROLES.USER]: [
      '✅ Cargar gastos propios',
      '👁️ Ver solo sus gastos',
      '❌ No ve gastos de otros usuarios',
      '❌ No puede aprobar/rechazar',
      '❌ Sin acceso a gestión'
    ]
  };
  return privileges[role] || ['Sin privilegios definidos'];
};