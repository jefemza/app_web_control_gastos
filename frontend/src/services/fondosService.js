import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  getDoc,
  limit
} from 'firebase/firestore';

const COLLECTION_NAME = 'fondos';

// Crear un nuevo ingreso de fondos
export const createFondo = async (fondoData) => {
  try {
    // Primero, desactivar cualquier fondo activo anterior
    const q = query(
      collection(db, COLLECTION_NAME),
      where('activo', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Desactivar fondos activos anteriores
    const updatePromises = [];
    querySnapshot.forEach((docSnapshot) => {
      const fondoRef = doc(db, COLLECTION_NAME, docSnapshot.id);
      updatePromises.push(
        updateDoc(fondoRef, {
          activo: false,
          updatedAt: serverTimestamp()
        })
      );
    });
    
    await Promise.all(updatePromises);

    // Crear el nuevo fondo
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...fondoData,
      montoInicial: fondoData.monto,
      saldoActual: fondoData.monto,
      activo: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Fondo creado exitosamente:', docRef.id);
    return { id: docRef.id, ...fondoData };
  } catch (error) {
    console.error('Error al crear fondo:', error);
    throw error;
  }
};

// Obtener todos los fondos
export const getAllFondos = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('fecha', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const fondos = [];
    
    querySnapshot.forEach((doc) => {
      fondos.push({ id: doc.id, ...doc.data() });
    });
    
    return fondos;
  } catch (error) {
    console.error('Error al obtener fondos:', error);
    // Si falla por índice, intentar sin orderBy
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const fondos = [];
    
    querySnapshot.forEach((doc) => {
      fondos.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar manualmente
    fondos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    return fondos;
  }
};

// Obtener fondo activo (el más reciente con saldo disponible)
export const getFondoActivo = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('activo', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Error al obtener fondo activo:', error);
    // Si falla por índice, intentar de otra forma
    const fondos = await getAllFondos();
    return fondos.find(f => f.activo === true) || null;
  }
};

// Actualizar saldo del fondo al aprobar un gasto
export const actualizarSaldoFondo = async (fondoId, montoGasto) => {
  try {
    const fondoRef = doc(db, COLLECTION_NAME, fondoId);
    const fondoDoc = await getDoc(fondoRef);
    
    if (!fondoDoc.exists()) {
      throw new Error('Fondo no encontrado');
    }
    
    const fondoData = fondoDoc.data();
    const nuevoSaldo = (fondoData.saldoActual || 0) - montoGasto;
    
    if (nuevoSaldo < 0) {
      throw new Error('Saldo insuficiente en el fondo');
    }
    
    await updateDoc(fondoRef, {
      saldoActual: nuevoSaldo,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error al actualizar saldo del fondo:', error);
    throw error;
  }
};

// Revertir saldo del fondo al rechazar un gasto previamente aprobado
export const revertirSaldoFondo = async (fondoId, montoGasto) => {
  try {
    const fondoRef = doc(db, COLLECTION_NAME, fondoId);
    const fondoDoc = await getDoc(fondoRef);
    
    if (!fondoDoc.exists()) {
      throw new Error('Fondo no encontrado');
    }
    
    const fondoData = fondoDoc.data();
    const nuevoSaldoDisponible = fondoData.saldoDisponible + montoGasto;
    const nuevoMontoGastado = Math.max(0, fondoData.montoGastado - montoGasto);
    
    await updateDoc(fondoRef, {
      saldoDisponible: nuevoSaldoDisponible,
      montoGastado: nuevoMontoGastado,
      estado: 'activo',
      updatedAt: serverTimestamp()
    });
    
    return { 
      success: true, 
      saldoDisponible: nuevoSaldoDisponible,
      montoGastado: nuevoMontoGastado 
    };
  } catch (error) {
    console.error('Error al revertir saldo del fondo:', error);
    throw error;
  }
};

// Suscribirse a cambios en tiempo real de fondos
export const subscribeToFondos = (callback) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('fecha', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fondos = [];
      let totalIngresado = 0;
      let totalGastado = 0;
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const fondoConId = { id: doc.id, ...data };
        
        // Calcular el saldo disponible basado en los gastos
        const gastosQuery = query(
          collection(db, 'gastos'),
          where('estado', '==', 'aprobado')
        );
        const gastosSnapshot = await getDocs(gastosQuery);
        
        let gastosDelFondo = 0;
        gastosSnapshot.forEach((gastoDoc) => {
          const gasto = gastoDoc.data();
          // Solo contar gastos después de la fecha del fondo
          if (new Date(gasto.fecha) >= new Date(data.fecha)) {
            gastosDelFondo += gasto.monto;
          }
        });
        
        // Calcular saldo disponible
        const saldoDisponible = Math.max(0, data.monto - gastosDelFondo);
        const estado = saldoDisponible > 0 ? 'activo' : 'agotado';
        
        fondos.push({
          ...fondoConId,
          saldoDisponible,
          montoGastado: gastosDelFondo,
          estado,
          numeroRecibo: `RC-${doc.id.slice(-6).toUpperCase()}`
        });
        
        totalIngresado += data.monto;
        totalGastado += gastosDelFondo;
      }
      
      callback(fondos);
    }, (error) => {
      console.error('Error en subscribeToFondos:', error);
      // Fallback sin orderBy
      const q = query(collection(db, COLLECTION_NAME));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fondos = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          fondos.push({ id: doc.id, ...data });
        }
        
        // Ordenar manualmente
        fondos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        callback(fondos);
      });
      
      return unsubscribe;
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error general en subscribeToFondos:', error);
    return () => {};
  }
};

// Obtener resumen de fondos para el dashboard
export const getResumenFondos = async () => {
  try {
    // Obtener todos los fondos
    const fondosQuery = query(collection(db, COLLECTION_NAME));
    const fondosSnapshot = await getDocs(fondosQuery);
    
    let totalIngresado = 0;
    let totalGastado = 0;
    
    // Sumar todos los ingresos
    fondosSnapshot.forEach((doc) => {
      const fondo = doc.data();
      totalIngresado += fondo.monto || 0;
    });
    
    // Obtener todos los gastos aprobados
    const gastosQuery = query(
      collection(db, 'gastos'),
      where('estado', '==', 'aprobado')
    );
    const gastosSnapshot = await getDocs(gastosQuery);
    
    gastosSnapshot.forEach((doc) => {
      const gasto = doc.data();
      totalGastado += gasto.monto || 0;
    });
    
    const totalDisponible = Math.max(0, totalIngresado - totalGastado);
    
    return {
      totalIngresado,
      totalGastado,
      totalDisponible
    };
  } catch (error) {
    console.error('Error al obtener resumen de fondos:', error);
    return {
      totalIngresado: 0,
      totalGastado: 0,
      totalDisponible: 0
    };
  }
};