import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  deleteUser as deleteAuthUser,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

class UserService {
  constructor() {
    this.usersCollection = 'usuarios';
  }

  /**
   * Crear nuevo usuario con Firebase Auth + Firestore
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  async createUser(userData) {
    try {
      const { email, password, name, role } = userData;

      // Validaciones
      if (!email || !password || !name || !role) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (!this.isValidRole(role)) {
        throw new Error('Rol inválido');
      }

      // Verificar si el email ya existe
      const existingUser = await this.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Actualizar perfil en Auth
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Crear documento en Firestore
      const userDoc = {
        uid,
        name,
        email,
        role,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: auth.currentUser?.uid || 'system'
      };

      await setDoc(doc(db, this.usersCollection, uid), userDoc);

      return {
        id: uid,
        ...userDoc
      };

    } catch (error) {
      console.error('Error creando usuario:', error);
      
      // Mensajes de error específicos
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Este email ya está registrado');
        case 'auth/weak-password':
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        case 'auth/invalid-email':
          throw new Error('Email inválido');
        default:
          throw error;
      }
    }
  }

  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} - Lista de usuarios
   */
  async getAllUsers() {
    try {
      const q = query(
        collection(db, this.usersCollection),
        orderBy('fechaCreacion', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return users;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw new Error('Error al cargar los usuarios');
    }
  }

  /**
   * Obtener usuario por ID
   * @param {string} uid - ID del usuario
   * @returns {Promise<Object|null>} - Datos del usuario
   */
  async getUserById(uid) {
    try {
      const docRef = doc(db, this.usersCollection, uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario por ID:', error);
      throw new Error('Error al obtener el usuario');
    }
  }

  /**
   * Obtener usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} - Datos del usuario
   */
  async getUserByEmail(email) {
    try {
      const q = query(
        collection(db, this.usersCollection),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario por email:', error);
      return null;
    }
  }

  /**
   * Actualizar usuario
   * @param {string} uid - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Usuario actualizado
   */
  async updateUser(uid, updateData) {
    try {
      const { name, role, email, estado } = updateData;

      // Validaciones
      if (role && !this.isValidRole(role)) {
        throw new Error('Rol inválido');
      }

      // Verificar que el usuario existe
      const existingUser = await this.getUserById(uid);
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }

      // Si se cambia el email, verificar que no exista otro usuario con ese email
      if (email && email !== existingUser.email) {
        const userWithEmail = await this.getUserByEmail(email);
        if (userWithEmail && userWithEmail.id !== uid) {
          throw new Error('Ya existe un usuario con este email');
        }
      }

      // Preparar datos para actualizar
      const dataToUpdate = {
        ...updateData,
        fechaActualizacion: new Date(),
        actualizadoPor: auth.currentUser?.uid || 'system'
      };

      // Actualizar en Firestore
      const docRef = doc(db, this.usersCollection, uid);
      await updateDoc(docRef, dataToUpdate);

      // Actualizar perfil en Auth si es necesario
      const authUser = auth.currentUser;
      if (authUser && authUser.uid === uid && name) {
        await updateProfile(authUser, {
          displayName: name
        });
      }

      // Retornar usuario actualizado
      return await this.getUserById(uid);

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de usuario
   * @param {string} uid - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<void>}
   */
  async changeUserPassword(uid, newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Solo el usuario actual puede cambiar su propia contraseña
      // O un admin puede cambiarla (implementar lógica adicional si es necesario)
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        throw new Error('No tienes permisos para cambiar esta contraseña');
      }

      await updatePassword(currentUser, newPassword);

      // Actualizar timestamp en Firestore
      const docRef = doc(db, this.usersCollection, uid);
      await updateDoc(docRef, {
        fechaActualizacion: new Date(),
        passwordCambiado: new Date()
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      
      switch (error.code) {
        case 'auth/weak-password':
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        case 'auth/requires-recent-login':
          throw new Error('Debes volver a autenticarte para cambiar la contraseña');
        default:
          throw error;
      }
    }
  }

  /**
   * Desactivar usuario (soft delete)
   * @param {string} uid - ID del usuario
   * @returns {Promise<void>}
   */
  async deactivateUser(uid) {
    try {
      // Verificar que el usuario existe
      const user = await this.getUserById(uid);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // No permitir desactivar al propio usuario
      if (auth.currentUser?.uid === uid) {
        throw new Error('No puedes desactivar tu propia cuenta');
      }

      // Actualizar estado en Firestore
      const docRef = doc(db, this.usersCollection, uid);
      await updateDoc(docRef, {
        estado: 'inactivo',
        fechaDesactivacion: new Date(),
        desactivadoPor: auth.currentUser?.uid || 'system'
      });

    } catch (error) {
      console.error('Error desactivando usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar usuario completamente (hard delete)
   * @param {string} uid - ID del usuario
   * @returns {Promise<void>}
   */
  async deleteUser(uid) {
    try {
      // Verificar que el usuario existe
      const user = await this.getUserById(uid);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // No permitir eliminar al propio usuario
      if (auth.currentUser?.uid === uid) {
        throw new Error('No puedes eliminar tu propia cuenta');
      }

      // Eliminar de Firestore
      await deleteDoc(doc(db, this.usersCollection, uid));

      // Nota: Para eliminar de Firebase Auth se necesita que el usuario esté autenticado
      // En un sistema real esto se haría desde Functions de Firebase
      console.log('Usuario eliminado de Firestore. Auth debe ser manejado por el backend.');

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a cambios en usuarios (tiempo real)
   * @param {Function} callback - Función que se ejecuta cuando hay cambios
   * @returns {Function} - Función para cancelar la suscripción
   */
  subscribeToUsers(callback) {
    try {
      const q = query(
        collection(db, this.usersCollection),
        orderBy('fechaCreacion', 'desc')
      );

      return onSnapshot(q, (querySnapshot) => {
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(users);
      }, (error) => {
        console.error('Error en suscripción a usuarios:', error);
        callback([]);
      });

    } catch (error) {
      console.error('Error estableciendo suscripción:', error);
      return () => {}; // Retornar función vacía
    }
  }

  /**
   * Validar rol
   * @param {string} role - Rol a validar
   * @returns {boolean}
   */
  isValidRole(role) {
    const validRoles = ['admin_principal', 'socio_operador', 'contadora'];
    return validRoles.includes(role);
  }

  /**
   * Obtener permisos por rol
   * @param {string} role - Rol del usuario
   * @returns {Object} - Objeto con permisos
   */
  getRolePermissions(role) {
    const permissions = {
      admin_principal: {
        canManageUsers: true,
        canApproveExpenses: true,
        canViewAllExpenses: true,
        canManageFunds: true,
        canExportReports: true,
        canViewDashboard: true
      },
      contadora: {
        canManageUsers: false,
        canApproveExpenses: false,
        canViewAllExpenses: true,
        canManageFunds: true,
        canExportReports: true,
        canViewDashboard: true
      },
      socio_operador: {
        canManageUsers: false,
        canApproveExpenses: false,
        canViewAllExpenses: false,
        canManageFunds: false,
        canExportReports: false,
        canViewDashboard: true
      }
    };

    return permissions[role] || permissions.socio_operador;
  }

  /**
   * Verificar si el usuario actual tiene un permiso específico
   * @param {Object} user - Usuario actual
   * @param {string} permission - Permiso a verificar
   * @returns {boolean}
   */
  hasPermission(user, permission) {
    if (!user || !user.role) return false;
    
    const permissions = this.getRolePermissions(user.role);
    return permissions[permission] || false;
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} - Estadísticas
   */
  async getUserStats() {
    try {
      const users = await this.getAllUsers();
      
      const stats = {
        total: users.length,
        activos: users.filter(u => u.estado === 'activo').length,
        inactivos: users.filter(u => u.estado === 'inactivo').length,
        porRol: {
          admin_principal: users.filter(u => u.role === 'admin_principal').length,
          contadora: users.filter(u => u.role === 'contadora').length,
          socio_operador: users.filter(u => u.role === 'socio_operador').length
        }
      };

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        activos: 0,
        inactivos: 0,
        porRol: {
          admin_principal: 0,
          contadora: 0,
          socio_operador: 0
        }
      };
    }
  }
}

// Exportar instancia única
export const userService = new UserService();
export default userService;