import { db } from '../config/firebase.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const clearAllGastos = async () => {
  try {
    console.log('🔥 Iniciando limpieza de gastos...');
    
    const gastosRef = collection(db, 'gastos');
    const snapshot = await getDocs(gastosRef);
    
    console.log(`📊 Encontrados ${snapshot.docs.length} gastos para eliminar`);
    
    const deletePromises = snapshot.docs.map(document => 
      deleteDoc(doc(db, 'gastos', document.id))
    );
    
    await Promise.all(deletePromises);
    
    console.log('✅ Todos los gastos han sido eliminados exitosamente');
    console.log(`🗑️ Total eliminados: ${snapshot.docs.length}`);
    
    return { success: true, deleted: snapshot.docs.length };
    
  } catch (error) {
    console.error('❌ Error al limpiar gastos:', error);
    return { success: false, error: error.message };
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllGastos().then(result => {
    if (result.success) {
      console.log(`✅ Operación completada. ${result.deleted} gastos eliminados.`);
    } else {
      console.error('❌ Operación fallida:', result.error);
    }
  });
}

export { clearAllGastos };