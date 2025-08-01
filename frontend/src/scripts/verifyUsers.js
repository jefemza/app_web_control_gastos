import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  getDocs
} from 'firebase/firestore';

// Usuarios que deberían existir
const USUARIOS_SISTEMA = [
  {
    email: 'eugenio@esm.com.ar',
    password: 'esm2025',
    nombre: 'Eugenio',
    rol: 'admin_principal',
    activo: true
  },
  {
    email: 'noelia@esm.com.ar',
    password: 'noelia2025',
    nombre: 'Noelia',
    rol: 'contadora',
    activo: true
  }
];

export const verificarYCrearUsuarios = async () => {
  console.log('=== VERIFICACIÓN DE USUARIOS ===');
  
  for (const usuario of USUARIOS_SISTEMA) {
    console.log(`\nVerificando ${usuario.email}...`);
    
    try {
      // Intentar hacer login
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        usuario.email, 
        usuario.password
      );
      
      console.log('✅ Usuario existe en Auth');
      
      // Verificar en Firestore
      const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        console.log('❌ No existe en Firestore, creando...');
        
        // Crear documento en Firestore
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          activo: usuario.activo,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log('✅ Usuario creado en Firestore');
      } else {
        console.log('✅ Usuario existe en Firestore');
        console.log('Datos:', userDoc.data());
      }
      
      // Cerrar sesión para probar el siguiente
      await signOut(auth);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Usuario no existe en Auth, creando...');
        
        try {
          // Crear usuario en Auth
          const newUserCredential = await createUserWithEmailAndPassword(
            auth,
            usuario.email,
            usuario.password
          );
          
          // Crear en Firestore
          await setDoc(doc(db, 'usuarios', newUserCredential.user.uid), {
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol,
            activo: usuario.activo,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log('✅ Usuario creado en Auth y Firestore');
          
          // Cerrar sesión
          await signOut(auth);
          
        } catch (createError) {
          console.error('Error al crear usuario:', createError);
        }
      } else {
        console.error('Error:', error);
      }
    }
  }
  
  // Listar todos los usuarios en Firestore
  console.log('\n=== USUARIOS EN FIRESTORE ===');
  const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
  usuariosSnapshot.forEach(doc => {
    console.log(`${doc.id}:`, doc.data());
  });
  
  console.log('\n=== VERIFICACIÓN COMPLETADA ===');
};

// Ejecutar si se llama directamente
if (typeof window !== 'undefined') {
  window.verificarUsuarios = verificarYCrearUsuarios;
} 