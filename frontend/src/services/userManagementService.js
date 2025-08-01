import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';

const COLLECTION_NAME = 'usuarios';

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    // Verificar si el email ya existe
    const q = query(collection(db, COLLECTION_NAME), where('email', '==', userData.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Ya existe un usuario con ese email');
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...userData,
      estado: 'activo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Usuario creado exitosamente:', docRef.id);
    return { id: docRef.id, ...userData };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por nombre
    users.sort((a, b) => a.name.localeCompare(b.name));
    
    return users;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    
    // Si se está cambiando el email, verificar que no exista
    if (userData.email) {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('email', '==', userData.email)
      );
      const querySnapshot = await getDocs(q);
      
      // Verificar que el email no pertenezca a otro usuario
      const otherUser = querySnapshot.docs.find(doc => doc.id !== userId);
      if (otherUser) {
        throw new Error('Ya existe otro usuario con ese email');
      }
    }

    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Usuario actualizado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, userId));
    console.log('Usuario eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

// Suscribirse a cambios en tiempo real de usuarios
export const subscribeToUsers = (callback) => {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log('Snapshot de usuarios recibido:', snapshot.size, 'documentos');
      
      if (snapshot.empty) {
        console.log('No hay usuarios en la base de datos, inicializando usuarios por defecto...');
        // Si no hay usuarios, crear los usuarios por defecto
        await initializeDefaultUsers();
        // No llamar callback aquí, esperamos que el listener se active de nuevo
        return;
      }
      
      const users = [];
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        console.log('Usuario encontrado:', userData.email);
        users.push({ id: doc.id, ...userData });
      });
      
      // Ordenar por nombre
      users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      callback(users);
    }, (error) => {
      console.error('Error en subscribeToUsers:', error);
      // En caso de error, intentar inicializar usuarios por defecto
      initializeDefaultUsers().then(() => {
        console.log('Usuarios por defecto creados después de error');
      }).catch(err => {
        console.error('Error al crear usuarios por defecto:', err);
        callback([]); // Devolver array vacío si todo falla
      });
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error general en subscribeToUsers:', error);
    return () => {};
  }
};

// Inicializar usuarios por defecto
export const initializeDefaultUsers = async () => {
  const defaultUsers = [
    {
      name: 'Juan Pablo Rúa',
      email: 'juan.pablo@esm.com.ar',
      role: 'admin_principal',
      password: 'admin123'
    },
    {
      name: 'Luis Tello',
      email: 'luis.tello@esm.com.ar',
      role: 'socio_operador',
      password: 'socio123'
    },
    {
      name: 'Eugenio Cavallaro',
      email: 'eugenio.cavallaro@esm.com.ar',
      role: 'socio_operador',
      password: 'socio123'
    },
    {
      name: 'Noelia',
      email: 'noelia@esm.com.ar',
      role: 'contadora',
      password: 'conta123'
    }
  ];

  console.log('Inicializando usuarios por defecto...');
  
  for (const user of defaultUsers) {
    try {
      // Verificar si el usuario ya existe
      const q = query(collection(db, COLLECTION_NAME), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await addDoc(collection(db, COLLECTION_NAME), {
          ...user,
          estado: 'activo',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`Usuario ${user.name} creado exitosamente`);
      } else {
        console.log(`Usuario ${user.email} ya existe`);
      }
    } catch (error) {
      console.error(`Error al crear usuario ${user.name}:`, error);
    }
  }
};

// Obtener permisos por rol
export const getPermissionsByRole = (role) => {
  const permissions = {
    admin_principal: {
      canCreateUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canApproveExpenses: true,
      canViewAllExpenses: true,
      canManageFunds: true,
      canExportReports: true
    },
    socio_operador: {
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canApproveExpenses: false,
      canViewAllExpenses: false,
      canManageFunds: false,
      canExportReports: false
    },
    contadora: {
      canCreateUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canApproveExpenses: false,
      canViewAllExpenses: true,
      canManageFunds: true,
      canExportReports: true
    }
  };

  return permissions[role] || permissions.socio_operador;
};
