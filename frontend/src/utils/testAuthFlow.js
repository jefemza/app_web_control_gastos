// Script para probar el flujo de autenticación y persistencia de roles

export const testAuthFlow = () => {
  console.log('=== TEST DE FLUJO DE AUTENTICACIÓN ===');
  
  // 1. Verificar si hay usuario en localStorage
  const savedUser = localStorage.getItem('user');
  
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      console.log('✅ Usuario encontrado en localStorage:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        estado: user.estado
      });
      
      // Verificar que tenga todos los campos necesarios
      const requiredFields = ['id', 'email', 'name', 'role'];
      const missingFields = requiredFields.filter(field => !user[field]);
      
      if (missingFields.length > 0) {
        console.error('❌ Campos faltantes en el usuario:', missingFields);
      } else {
        console.log('✅ Todos los campos requeridos están presentes');
      }
      
      // Verificar el rol
      const validRoles = ['admin_principal', 'socio_operador', 'contadora'];
      if (validRoles.includes(user.role)) {
        console.log('✅ Rol válido:', user.role);
      } else {
        console.error('❌ Rol inválido:', user.role);
      }
      
    } catch (error) {
      console.error('❌ Error al parsear usuario de localStorage:', error);
    }
  } else {
    console.log('ℹ️ No hay usuario en localStorage');
  }
  
  // 2. Verificar rutas protegidas según rol
  console.log('\n=== VERIFICACIÓN DE RUTAS PROTEGIDAS ===');
  
  const rutasProtegidas = {
    '/panel-control': ['admin_principal', 'socio_operador'],
    '/usuarios': ['admin_principal', 'socio_operador'],
    '/fondos': ['admin_principal', 'contadora']
  };
  
  if (savedUser) {
    const user = JSON.parse(savedUser);
    
    Object.entries(rutasProtegidas).forEach(([ruta, rolesPermitidos]) => {
      if (rolesPermitidos.includes(user.role)) {
        console.log(`✅ ${user.role} tiene acceso a ${ruta}`);
      } else {
        console.log(`❌ ${user.role} NO tiene acceso a ${ruta}`);
      }
    });
  }
  
  console.log('\n=== FIN DEL TEST ===');
};

// Función para simular login con diferentes roles
export const simulateLogin = (role) => {
  const testUsers = {
    admin_principal: {
      id: 'test-admin-123',
      uid: 'test-admin-123',
      email: 'admin@test.com',
      name: 'Admin Test',
      role: 'admin_principal',
      estado: 'activo'
    },
    contadora: {
      id: 'test-conta-123',
      uid: 'test-conta-123',
      email: 'contadora@test.com',
      name: 'Contadora Test',
      role: 'contadora',
      estado: 'activo'
    },
    socio_operador: {
      id: 'test-socio-123',
      uid: 'test-socio-123',
      email: 'socio@test.com',
      name: 'Socio Test',
      role: 'socio_operador',
      estado: 'activo'
    }
  };
  
  const user = testUsers[role];
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    console.log(`✅ Usuario ${role} guardado en localStorage`);
    console.log('Recarga la página para ver los cambios');
  } else {
    console.error('❌ Rol no válido');
  }
};

// Función para limpiar la sesión
export const clearSession = () => {
  localStorage.removeItem('user');
  console.log('✅ Sesión limpiada');
};