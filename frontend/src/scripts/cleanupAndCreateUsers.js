// ========================================
// 🧹 Script de Limpieza y Creación de Usuarios
// ========================================
// Desarrollado por: Claude AI Assistant
// "Siempre aquí para ayudar y resolver problemas técnicos"
// Última actualización: 2025-08-26
// ========================================

import { auth, db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  deleteDoc, 
  setDoc,
  query,
  where 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';

// Datos de usuarios correctos
const USUARIOS_CORRECTOS = [
  {
    name: 'Luis Sergio Tello',
    email: 'luistelloiphone@gmail.com',
    role: 'superadmin',
    telefono: '2617000835',
    password: 'esm2025'
  },
  {
    name: 'Noelia Albornoz',
    email: 'noeliaalbornoz1@gmail.com',
    role: 'admin',
    telefono: '2616620283',
    password: 'esm2025'
  },
  {
    name: 'Juan Pablo Rua',
    email: 'pablorua@hotmail.com',
    role: 'socio',
    telefono: '2612494500',
    password: 'esm2025'
  },
  {
    name: 'Eugenio Cavallaro',
    email: 'eugenion.cavallaro@gmail.com',
    role: 'socio',
    telefono: '2616946211',
    password: 'esm2025'
  }
];

class UserCleanupService {
  constructor() {
    this.usersCollection = 'usuarios';
  }

  // Limpiar todos los usuarios existentes
  async cleanupAllUsers() {
    try {
      console.log('🧹 Iniciando limpieza de usuarios...');
      
      const q = query(collection(db, this.usersCollection));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((docSnapshot) => {
        console.log(`🗑️ Eliminando usuario: ${docSnapshot.data().email}`);
        deletePromises.push(deleteDoc(docSnapshot.ref));
      });
      
      await Promise.all(deletePromises);
      console.log(`✅ ${deletePromises.length} usuarios eliminados`);
      
      return deletePromises.length;
    } catch (error) {
      console.error('❌ Error limpiando usuarios:', error);
      throw error;
    }
  }

  // Crear usuario individual
  async createUser(userData) {
    try {
      const { name, email, role, telefono, password } = userData;
      
      console.log(`👤 Creando usuario: ${name} (${email})`);
      
      // Crear en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      // Actualizar perfil
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Crear documento en Firestore
      const userDoc = {
        uid,
        name,
        email,
        role,
        telefono,
        estado: 'activo',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        creadoPor: 'system-cleanup'
      };
      
      await setDoc(doc(db, this.usersCollection, uid), userDoc);
      
      console.log(`✅ Usuario creado: ${name}`);
      return { id: uid, ...userDoc };
      
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.email}:`, error);
      throw error;
    }
  }

  // Crear todos los usuarios correctos
  async createAllCorrectUsers() {
    try {
      console.log('👥 Creando usuarios correctos...');
      
      const createdUsers = [];
      
      for (const userData of USUARIOS_CORRECTOS) {
        try {
          const user = await this.createUser(userData);
          createdUsers.push(user);
        } catch (error) {
          console.error(`Error con usuario ${userData.email}:`, error.message);
          // Continuar con el siguiente usuario
        }
      }
      
      console.log(`✅ ${createdUsers.length} usuarios creados exitosamente`);
      return createdUsers;
      
    } catch (error) {
      console.error('❌ Error creando usuarios:', error);
      throw error;
    }
  }

  // Ejecutar proceso completo
  async executeFullCleanup() {
    try {
      console.log('🚀 Iniciando proceso completo de limpieza y creación...');
      
      // 1. Limpiar usuarios existentes
      const deletedCount = await this.cleanupAllUsers();
      
      // 2. Crear usuarios correctos
      const createdUsers = await this.createAllCorrectUsers();
      
      console.log('🎉 Proceso completado exitosamente!');
      console.log(`📊 Resumen:`);
      console.log(`   - Usuarios eliminados: ${deletedCount}`);
      console.log(`   - Usuarios creados: ${createdUsers.length}`);
      
      return {
        deletedCount,
        createdUsers,
        success: true
      };
      
    } catch (error) {
      console.error('❌ Error en proceso completo:', error);
      throw error;
    }
  }
}

// Función para ejecutar desde el navegador
export const executeUserCleanup = async () => {
  const service = new UserCleanupService();
  return await service.executeFullCleanup();
};

// Función para limpiar solo usuarios (sin crear nuevos)
export const cleanupUsersOnly = async () => {
  const service = new UserCleanupService();
  return await service.cleanupAllUsers();
};

// Función para crear solo usuarios (sin limpiar)
export const createUsersOnly = async () => {
  const service = new UserCleanupService();
  return await service.createAllCorrectUsers();
};

export default UserCleanupService;
