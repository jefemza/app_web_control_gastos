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
  runTransaction
} from 'firebase/firestore';
import { getFondoActivo, actualizarSaldoFondo } from './fondosService';
import { 
  notificarAprobacionGasto, 
  notificarRechazoGasto, 
  notificarGastoPendiente 
} from './notificationService';

const COLLECTION_NAME = 'gastos';

// Crear un nuevo gasto
export const createGasto = async (gastoData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...gastoData,
      estado: 'pendiente',
      comentarioAdmin: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const nuevoGasto = { id: docRef.id, ...gastoData };
    
    // Notificar a los admins sobre el nuevo gasto pendiente
    try {
      await notificarGastoPendiente(nuevoGasto);
    } catch (notifError) {
      console.error('Error al enviar notificación:', notifError);
      // No lanzamos el error para no interrumpir la creación del gasto
    }
    
    return nuevoGasto;
  } catch (error) {
    console.error('Error al crear gasto:', error);
    throw error;
  }
};

// Obtener todos los gastos (para admin)
export const getAllGastos = async () => {
  try {
    // Primero intentamos con orderBy
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('fecha', 'desc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const gastos = [];
      
      querySnapshot.forEach((doc) => {
        gastos.push({ id: doc.id, ...doc.data() });
      });
      
      return gastos;
    } catch (error) {
      // Si falla, intentamos sin orderBy y ordenamos manualmente
      console.warn('Índice no configurado, obteniendo sin ordenar:', error);
      q = query(collection(db, COLLECTION_NAME));
      
      const querySnapshot = await getDocs(q);
      const gastos = [];
      
      querySnapshot.forEach((doc) => {
        gastos.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar manualmente por fecha
      gastos.sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        return fechaB - fechaA; // Orden descendente
      });
      
      return gastos;
    }
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    throw error;
  }
};

// Obtener gastos por usuario
export const getGastosByUser = async (userId) => {
  try {
    // Solo usar where sin orderBy para evitar problemas de índices
    const q = query(
      collection(db, COLLECTION_NAME),
      where('usuarioId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const gastos = [];
    
    querySnapshot.forEach((doc) => {
      gastos.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar manualmente por fecha
    gastos.sort((a, b) => {
      const fechaA = new Date(a.fecha || 0);
      const fechaB = new Date(b.fecha || 0);
      return fechaB - fechaA; // Orden descendente
    });
    
    return gastos;
  } catch (error) {
    console.error('Error al obtener gastos del usuario:', error);
    throw error;
  }
};

// Suscribirse a cambios en tiempo real
export const subscribeToGastos = (callback, userId = null) => {
  let q;
  
  try {
    if (userId) {
      // Solo usar where sin orderBy
      q = query(
        collection(db, COLLECTION_NAME),
        where('usuarioId', '==', userId)
      );
    } else {
      // Intentar con orderBy
      q = query(
        collection(db, COLLECTION_NAME),
        orderBy('fecha', 'desc')
      );
    }
    
    return onSnapshot(q, 
      (querySnapshot) => {
        const gastos = [];
        querySnapshot.forEach((doc) => {
          gastos.push({ id: doc.id, ...doc.data() });
        });
        
        // Si usamos where sin orderBy, ordenar manualmente
        if (userId) {
          gastos.sort((a, b) => {
            const fechaA = new Date(a.fecha || 0);
            const fechaB = new Date(b.fecha || 0);
            return fechaB - fechaA;
          });
        }
        
        callback(gastos);
      },
      (error) => {
        console.error('Error en suscripción:', error);
        // Si falla, intentar sin orderBy
        if (!userId) {
          const fallbackQuery = query(collection(db, COLLECTION_NAME));
          
          return onSnapshot(fallbackQuery, (querySnapshot) => {
            const gastos = [];
            querySnapshot.forEach((doc) => {
              gastos.push({ id: doc.id, ...doc.data() });
            });
            
            // Ordenar manualmente
            gastos.sort((a, b) => {
              const fechaA = new Date(a.fecha || 0);
              const fechaB = new Date(b.fecha || 0);
              return fechaB - fechaA;
            });
            
            callback(gastos);
          });
        }
      }
    );
  } catch (error) {
    console.error('Error al configurar suscripción:', error);
    // Fallback sin orderBy
    const fallbackQuery = userId 
      ? query(collection(db, COLLECTION_NAME), where('usuarioId', '==', userId))
      : query(collection(db, COLLECTION_NAME));
      
    return onSnapshot(fallbackQuery, (querySnapshot) => {
      const gastos = [];
      querySnapshot.forEach((doc) => {
        gastos.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar manualmente
      gastos.sort((a, b) => {
        const fechaA = new Date(a.fecha || 0);
        const fechaB = new Date(b.fecha || 0);
        return fechaB - fechaA;
      });
      
      callback(gastos);
    });
  }
};

// Aprobar gasto
export const aprobarGasto = async (gastoId, comentario = '') => {
  try {
    return await runTransaction(db, async (transaction) => {
      // Obtener el gasto
      const gastoRef = doc(db, COLLECTION_NAME, gastoId);
      const gastoDoc = await transaction.get(gastoRef);
      
      if (!gastoDoc.exists()) {
        throw new Error('Gasto no encontrado');
      }
      
      const gastoData = gastoDoc.data();
      const montoGasto = parseFloat(gastoData.monto);
      
      // Obtener fondo activo
      const fondoActivo = await getFondoActivo();
      
      if (!fondoActivo) {
        throw new Error('No hay fondos disponibles. Por favor, registre un ingreso de fondos primero.');
      }
      
      if (fondoActivo.saldoDisponible < montoGasto) {
        throw new Error(`Saldo insuficiente. Disponible: ${fondoActivo.saldoDisponible.toLocaleString()}, Requerido: ${montoGasto.toLocaleString()}`);
      }
      
      // Actualizar el gasto
      transaction.update(gastoRef, {
        estado: 'aprobado',
        comentarioAdmin: comentario,
        fechaAprobacion: serverTimestamp(),
        fondoId: fondoActivo.id,
        updatedAt: serverTimestamp()
      });
      
      // Actualizar el saldo del fondo
      await actualizarSaldoFondo(fondoActivo.id, montoGasto);
      
      // Notificar al usuario sobre la aprobación
      try {
        await notificarAprobacionGasto({ id: gastoId, ...gastoData }, comentario);
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
      }
      
      return { success: true, fondoActualizado: true };
    });
  } catch (error) {
    console.error('Error al aprobar gasto:', error);
    throw error;
  }
};

// Rechazar gasto
export const rechazarGasto = async (gastoId, motivo) => {
  try {
    const gastoRef = doc(db, COLLECTION_NAME, gastoId);
    
    // Primero obtenemos los datos del gasto para la notificación
    const gastoDoc = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', gastoId)));
    const gastoData = gastoDoc.docs[0]?.data();
    
    await updateDoc(gastoRef, {
      estado: 'rechazado',
      comentarioAdmin: motivo,
      fechaRechazo: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Notificar al usuario sobre el rechazo
    if (gastoData) {
      try {
        await notificarRechazoGasto({ id: gastoId, ...gastoData }, motivo);
      } catch (notifError) {
        console.error('Error al enviar notificación:', notifError);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error al rechazar gasto:', error);
    throw error;
  }
};

// Actualizar gasto
export const updateGasto = async (gastoId, updates) => {
  try {
    const gastoRef = doc(db, COLLECTION_NAME, gastoId);
    await updateDoc(gastoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    throw error;
  }
};

// Funciones de análisis para gráficos
export const procesarDatosParaGraficos = (gastos, periodo) => {
  const ahora = new Date();
  let fechaInicio;
  
  switch(periodo) {
    case 'mes':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      break;
    case 'trimestre':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
      break;
    case 'semestre':
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);
      break;
    case 'año':
      fechaInicio = new Date(ahora.getFullYear(), 0, 1);
      break;
    default:
      fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  }
  
  return gastos.filter(gasto => {
    const fechaGasto = new Date(gasto.fecha);
    return fechaGasto >= fechaInicio && fechaGasto <= ahora;
  });
};

// Obtener gastos agrupados por categoría
export const obtenerGastosPorCategoria = (gastos) => {
  const gastosAprobados = gastos.filter(g => g.estado === 'aprobado');
  const porCategoria = {};
  
  gastosAprobados.forEach(gasto => {
    if (!porCategoria[gasto.categoria]) {
      porCategoria[gasto.categoria] = {
        nombre: gasto.categoria,
        total: 0,
        cantidad: 0
      };
    }
    porCategoria[gasto.categoria].total += gasto.monto;
    porCategoria[gasto.categoria].cantidad += 1;
  });
  
  return Object.values(porCategoria).map(cat => ({
    name: cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1),
    value: cat.total,
    cantidad: cat.cantidad
  }));
};

// Obtener gastos agrupados por mes
export const obtenerGastosPorMes = (gastos) => {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const porMes = {};
  const ahora = new Date();
  
  // Inicializar últimos 6 meses
  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    porMes[key] = {
      mes: meses[fecha.getMonth()],
      año: fecha.getFullYear(),
      pendiente: 0,
      aprobado: 0,
      rechazado: 0,
      total: 0
    };
  }
  
  gastos.forEach(gasto => {
    const fecha = new Date(gasto.fecha);
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    
    if (porMes[key]) {
      porMes[key][gasto.estado] += gasto.monto;
      porMes[key].total += gasto.monto;
    }
  });
  
  return Object.values(porMes).map(item => ({
    name: `${item.mes} ${item.año}`,
    pendiente: item.pendiente,
    aprobado: item.aprobado,
    rechazado: item.rechazado,
    total: item.total
  }));
};

// Obtener tendencia de gastos diarios
export const obtenerTendenciaGastos = (gastos, dias = 30) => {
  const ahora = new Date();
  const fechaInicio = new Date(ahora);
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  
  const gastosAprobados = gastos.filter(g => 
    g.estado === 'aprobado' && new Date(g.fecha) >= fechaInicio
  );
  
  const porDia = {};
  
  // Inicializar todos los días
  for (let i = 0; i < dias; i++) {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + i);
    const key = fecha.toISOString().split('T')[0];
    porDia[key] = 0;
  }
  
  // Sumar gastos por día
  gastosAprobados.forEach(gasto => {
    const key = new Date(gasto.fecha).toISOString().split('T')[0];
    if (key in porDia) {
      porDia[key] += gasto.monto;
    }
  });
  
  // Convertir a array y calcular promedio móvil
  const datos = Object.entries(porDia).map(([fecha, monto]) => ({
    fecha,
    monto,
    dia: new Date(fecha).getDate()
  }));
  
  // Calcular promedio móvil de 7 días
  const datosConPromedio = datos.map((item, index) => {
    let suma = 0;
    let count = 0;
    
    for (let i = Math.max(0, index - 6); i <= index; i++) {
      suma += datos[i].monto;
      count++;
    }
    
    return {
      ...item,
      promedio: suma / count
    };
  });
  
  return datosConPromedio;
};

// Obtener estadísticas de resumen
export const obtenerEstadisticasResumen = (gastos) => {
  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
  const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
  
  const gastosMesActual = gastos.filter(g => 
    new Date(g.fecha) >= inicioMesActual && g.estado === 'aprobado'
  );
  
  const gastosMesAnterior = gastos.filter(g => 
    new Date(g.fecha) >= inicioMesAnterior && 
    new Date(g.fecha) <= finMesAnterior && 
    g.estado === 'aprobado'
  );
  
  const totalMesActual = gastosMesActual.reduce((sum, g) => sum + g.monto, 0);
  const totalMesAnterior = gastosMesAnterior.reduce((sum, g) => sum + g.monto, 0);
  
  const porcentajeCambio = totalMesAnterior > 0 
    ? ((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100 
    : 0;
  
  // Categoría más gastada
  const porCategoria = {};
  gastosMesActual.forEach(gasto => {
    porCategoria[gasto.categoria] = (porCategoria[gasto.categoria] || 0) + gasto.monto;
  });
  
  const categoriaMaxima = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
  
  return {
    totalMesActual,
    totalMesAnterior,
    porcentajeCambio,
    cantidadGastosMes: gastosMesActual.length,
    promedioGasto: gastosMesActual.length > 0 ? totalMesActual / gastosMesActual.length : 0,
    categoriaMaxima: categoriaMaxima ? categoriaMaxima[0] : 'N/A',
    montoMaximoCategoria: categoriaMaxima ? categoriaMaxima[1] : 0
  };
};