// Script para corregir los roles de usuarios y verificar el sistema
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  setDoc,
  getDoc 
} from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoIj7d4p9RDsObUzKaAcEXWEWcCmISOXA",
  authDomain: "sage-archway-464312-b5.firebaseapp.com",
  projectId: "sage-archway-464312-b5",
  storageBucket: "sage-archway-464312-b5.firebasestorage.app",
  messagingSenderId: "38415501213",
  appId: "1:38415501213:web:26f14fbe5b2825b78b43b2",
  measurementId: "G-LXLM3SVL4K"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Mapeo de roles correctos
const ROLE_MAPPING = {
  'admin_principal': 'superadmin',
  'contadora': 'admin',
  'socio_operador': 'socio',
  'user': 'user'
};

// Usuarios específicos y sus roles correctos
const USER_ROLES = {
  'luis.tello@esm.com.ar': 'superadmin',
  'noelia@esm.com.ar': 'admin',
  'esmargentina.7466@gmail.com': 'admin'
};

async function fixUserRoles() {
  console.log('🔧 Iniciando corrección de roles de usuarios...\n');
  
  try {
    // Obtener todos los usuarios
    const usuariosRef = collection(db, 'usuarios');
    const querySnapshot = await getDocs(usuariosRef);
    
    console.log(`📊 Total de usuarios encontrados: ${querySnapshot.size}\n`);
    
    const updates = [];
    
    for (const docSnap of querySnapshot.docs) {
      const userData = docSnap.data();
      const userId = docSnap.id;
      const userEmail = userData.email;
      
      console.log(`\n👤 Usuario: ${userData.name || 'Sin nombre'}`);
      console.log(`   Email: ${userEmail}`);
      console.log(`   ID: ${userId}`);
      console.log(`   Rol actual: ${userData.role || 'Sin rol'}`);
      
      // Determinar el rol correcto
      let newRole = userData.role;
      
      // Primero verificar si el usuario tiene un rol específico asignado
      if (USER_ROLES[userEmail]) {
        newRole = USER_ROLES[userEmail];
        console.log(`   ✅ Rol específico asignado: ${newRole}`);
      } 
      // Si no, verificar si necesita mapeo de rol antiguo
      else if (ROLE_MAPPING[userData.role]) {
        newRole = ROLE_MAPPING[userData.role];
        console.log(`   🔄 Mapeando rol: ${userData.role} → ${newRole}`);
      }
      
      // Si el rol necesita actualización
      if (newRole !== userData.role) {
        updates.push({
          id: userId,
          email: userEmail,
          oldRole: userData.role,
          newRole: newRole,
          name: userData.name
        });
        
        // Actualizar el documento
        await updateDoc(doc(db, 'usuarios', userId), {
          role: newRole,
          fechaActualizacion: new Date(),
          roleActualizado: true
        });
        
        console.log(`   ✨ Rol actualizado a: ${newRole}`);
      } else {
        console.log(`   ℹ️ Rol correcto, no requiere cambios`);
      }
    }
    
    // Resumen de cambios
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN DE CAMBIOS:');
    console.log('='.repeat(50));
    
    if (updates.length > 0) {
      console.log(`\n✅ Se actualizaron ${updates.length} usuarios:\n`);
      updates.forEach(update => {
        console.log(`   • ${update.name || update.email}`);
        console.log(`     ${update.oldRole || 'sin rol'} → ${update.newRole}`);
      });
    } else {
      console.log('\n✅ Todos los usuarios tienen roles correctos.');
    }
    
    // Verificar usuario Luis específicamente
    console.log('\n' + '='.repeat(50));
    console.log('🔍 VERIFICACIÓN ESPECIAL - Luis Tello:');
    console.log('='.repeat(50));
    
    const luisQuery = querySnapshot.docs.find(doc => 
      doc.data().email === 'luis.tello@esm.com.ar'
    );
    
    if (luisQuery) {
      const luisData = luisQuery.data();
      console.log('\n✅ Usuario Luis encontrado:');
      console.log(`   • Nombre: ${luisData.name}`);
      console.log(`   • Email: ${luisData.email}`);
      console.log(`   • Rol: ${luisData.role}`);
      console.log(`   • Estado: ${luisData.estado || 'activo'}`);
      console.log(`   • ID: ${luisQuery.id}`);
      
      if (luisData.role === 'superadmin') {
        console.log('\n   ✨ Luis tiene el rol SUPERADMIN correcto');
      }
    } else {
      console.log('\n⚠️ Usuario Luis no encontrado. Creando...');
      
      // Crear usuario Luis si no existe
      const luisId = 'luis_superadmin_' + Date.now();
      await setDoc(doc(db, 'usuarios', luisId), {
        name: 'Luis Tello',
        email: 'luis.tello@esm.com.ar',
        role: 'superadmin',
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: 'system',
        descripcion: 'SuperAdmin - Acceso total al sistema'
      });
      
      console.log('   ✅ Usuario Luis creado con rol SUPERADMIN');
    }
    
    console.log('\n✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Detalles:', error.message);
  }
}

// Ejecutar el script
console.log('🚀 Script de Corrección de Roles de Usuarios');
console.log('='.repeat(50));
fixUserRoles();
