import { auth, db } from '../config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const debugFirebase = async () => {
  console.log('=== DEBUG FIREBASE ===');
  
  // 1. Verificar usuario actual
  const currentUser = auth.currentUser;
  console.log('Usuario autenticado:', currentUser ? {
    email: currentUser.email,
    uid: currentUser.uid
  } : 'No hay usuario autenticado');
  
  // 2. Verificar datos del usuario en Firestore
  if (currentUser) {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
      if (userDoc.exists()) {
        console.log('Datos del usuario en Firestore:', userDoc.data());
      } else {
        console.log('❌ No se encontró el documento del usuario en Firestore');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  }
  
  // 3. Verificar colecciones
  const collections = ['usuarios', 'gastos', 'fondos'];
  
  for (const collName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collName));
      console.log(`Colección ${collName}: ${snapshot.size} documentos`);
    } catch (error) {
      console.error(`Error al acceder a ${collName}:`, error.message);
    }
  }
  
  // 4. Verificar localStorage
  const userData = localStorage.getItem('user');
  console.log('Datos en localStorage:', userData ? JSON.parse(userData) : 'No hay datos');
  
  console.log('=== FIN DEBUG ===');
};

// Función para verificar permisos de escritura
export const testWritePermissions = async () => {
  console.log('=== TEST PERMISOS DE ESCRITURA ===');
  
  try {
    // Intentar crear un documento de prueba en gastos
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      usuario: auth.currentUser?.email
    };
    
    console.log('Intentando escribir en gastos...');
    const { addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'gastos'), testData);
    console.log('✅ Escritura exitosa, ID:', docRef.id);
    
    // Limpiar documento de prueba
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'gastos', docRef.id));
    console.log('✅ Documento de prueba eliminado');
    
  } catch (error) {
    console.error('❌ Error de permisos:', error);
  }
  
  console.log('=== FIN TEST ===');
}; 