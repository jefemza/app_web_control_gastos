import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  writeBatch,
  limit
} from 'firebase/firestore';

const COLLECTION_NAME = 'notificaciones';

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  GASTO_APROBADO: 'gasto_aprobado',
  GASTO_RECHAZADO: 'gasto_rechazado',
  GASTO_PENDIENTE: 'gasto_pendiente',
  NUEVA_ASIGNACION: 'nueva_asignacion',
  SISTEMA: 'sistema'
};

// Crear una nueva notificación
export const createNotification = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...notificationData,
      leida: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: docRef.id, ...notificationData };
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Notificar aprobación de gasto
export const notificarAprobacionGasto = async (gasto, comentarioAdmin = '') => {
  try {
    const notification = {
      tipo: NOTIFICATION_TYPES.GASTO_APROBADO,
      titulo: 'Gasto Aprobado',
      mensaje: `Tu gasto de $${gasto.monto} para "${gasto.descripcion}" ha sido aprobado.${comentarioAdmin ? ` Comentario: ${comentarioAdmin}` : ''}`,
      usuarioId: gasto.usuarioId,
      gastoId: gasto.id,
      prioridad: 'normal',
      datos: {
        monto: gasto.monto,
        categoria: gasto.categoria,
        comentarioAdmin
      }
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error('Error al notificar aprobación:', error);
    throw error;
  }
};

// Notificar rechazo de gasto
export const notificarRechazoGasto = async (gasto, motivoRechazo) => {
  try {
    const notification = {
      tipo: NOTIFICATION_TYPES.GASTO_RECHAZADO,
      titulo: 'Gasto Rechazado',
      mensaje: `Tu gasto de $${gasto.monto} para "${gasto.descripcion}" ha sido rechazado. Motivo: ${motivoRechazo}`,
      usuarioId: gasto.usuarioId,
      gastoId: gasto.id,
      prioridad: 'alta',
      datos: {
        monto: gasto.monto,
        categoria: gasto.categoria,
        motivoRechazo
      }
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error('Error al notificar rechazo:', error);
    throw error;
  }
};

// Notificar nuevo gasto pendiente a administradores
export const notificarGastoPendiente = async (gasto) => {
  try {
    // Obtener todos los administradores
    const usuariosQuery = query(
      collection(db, 'usuarios'),
      where('rol', 'in', ['admin_principal', 'socio_operador'])
    );
    
    const usuariosSnapshot = await getDocs(usuariosQuery);
    const notificationPromises = [];
    
    usuariosSnapshot.forEach((userDoc) => {
      const notification = {
        tipo: NOTIFICATION_TYPES.GASTO_PENDIENTE,
        titulo: 'Nuevo Gasto Pendiente',
        mensaje: `${gasto.nombreUsuario} ha registrado un gasto de $${gasto.monto} para "${gasto.descripcion}"`,
        usuarioId: userDoc.id,
        gastoId: gasto.id,
        prioridad: 'normal',
        datos: {
          monto: gasto.monto,
          categoria: gasto.categoria,
          usuarioSolicitante: gasto.nombreUsuario
        }
      };
      
      notificationPromises.push(createNotification(notification));
    });
    
    await Promise.all(notificationPromises);
    return true;
  } catch (error) {
    console.error('Error al notificar gasto pendiente:', error);
    throw error;
  }
};

// Obtener notificaciones de un usuario
export const getUserNotifications = async (userId, limite = 100) => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('usuarioId', '==', userId),
      limit(limite)
    );
    
    // Intentar con orderBy, si falla usar sin ordenamiento
    try {
      q = query(
        collection(db, COLLECTION_NAME),
        where('usuarioId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limite)
      );
    } catch (error) {
      console.warn('Índice no disponible, obteniendo sin ordenamiento');
    }
    
    const snapshot = await getDocs(q);
    const notifications = [];
    
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Ordenar manualmente si no se pudo hacer en la query
    notifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    return notifications;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

// Suscribirse a notificaciones en tiempo real
export const subscribeToNotifications = (userId, callback) => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('usuarioId', '==', userId)
    );
    
    // Intentar con orderBy
    try {
      q = query(
        collection(db, COLLECTION_NAME),
        where('usuarioId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } catch (error) {
      console.warn('Usando query sin ordenamiento');
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar manualmente
      notifications.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      callback(notifications);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error al suscribirse a notificaciones:', error);
    throw error;
  }
};

// Marcar notificación como leída
export const marcarNotificacionLeida = async (notificationId) => {
  try {
    const notifRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(notifRef, {
      leida: true,
      fechaLectura: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasLeidas = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('usuarioId', '==', userId),
      where('leida', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        leida: true,
        fechaLectura: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

// Obtener conteo de notificaciones no leídas
export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('usuarioId', '==', userId),
      where('leida', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error al obtener conteo de no leídas:', error);
    return 0;
  }
};

// Crear notificación del sistema
export const createSystemNotification = async (titulo, mensaje, usuarioIds = [], prioridad = 'normal') => {
  try {
    const notificationPromises = usuarioIds.map(userId => 
      createNotification({
        tipo: NOTIFICATION_TYPES.SISTEMA,
        titulo,
        mensaje,
        usuarioId: userId,
        prioridad,
        datos: {}
      })
    );
    
    await Promise.all(notificationPromises);
    return true;
  } catch (error) {
    console.error('Error al crear notificación del sistema:', error);
    throw error;
  }
};

// Eliminar notificaciones antiguas (más de 30 días y leídas)
export const cleanOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('leida', '==', true),
      where('createdAt', '<', thirtyDaysAgo)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    return snapshot.size;
  } catch (error) {
    console.error('Error al limpiar notificaciones antiguas:', error);
    throw error;
  }
};