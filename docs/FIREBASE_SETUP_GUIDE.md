# 🔥 Configuración de Firebase para Control de Caja Chica

## 📋 Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Base de Datos](#estructura-de-base-de-datos)
3. [Reglas de Seguridad](#reglas-de-seguridad)
4. [Autenticación](#autenticación)
5. [Storage para Archivos](#storage-para-archivos)
6. [Integración con React](#integración-con-react)
7. [Migración de Datos](#migración-de-datos)

## 1. Configuración Inicial

### Paso 1: Crear Proyecto en Firebase
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Crear un proyecto"
3. Nombre: `control-caja-chica-esm`
4. Deshabilitar Google Analytics (opcional)
5. Click en "Crear proyecto"

### Paso 2: Configurar Firebase en tu App

```bash
# Instalar Firebase
npm install firebase
```

### Paso 3: Crear archivo de configuración

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "control-caja-chica-esm.firebaseapp.com",
  projectId: "control-caja-chica-esm",
  storageBucket: "control-caja-chica-esm.appspot.com",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

## 2. Estructura de Base de Datos

### Firestore - Colecciones y Documentos

#### Colección: `usuarios`
```javascript
{
  uid: "auto-generado",
  email: "juan.pablo@esm.com.ar",
  nombre: "Juan Pablo Rúa",
  rol: "admin_principal", // admin_principal | socio_operador | contadora
  activo: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Colección: `gastos`
```javascript
{
  id: "auto-generado",
  fecha: "2025-01-28",
  usuarioId: "uid-del-usuario",
  usuarioNombre: "Juan Pablo Rúa", // Desnormalizado para queries
  monto: 15000,
  medioPago: "efectivo", // efectivo | transferencia | billetera | tarjeta
  categoria: "viáticos", // viáticos | útiles | transporte | alimentación | mantenimiento | otros
  descripcion: "Almuerzo con cliente",
  archivoUrl: "https://storage.../comprobante.jpg", // opcional
  estado: "pendiente", // pendiente | aprobado | rechazado
  comentarioAdmin: "", // opcional
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Colección: `categorias`
```javascript
{
  id: "auto-generado",
  nombre: "viáticos",
  activa: true,
  orden: 1
}
```

#### Colección: `mediosPago`
```javascript
{
  id: "auto-generado",
  nombre: "efectivo",
  activo: true,
  orden: 1
}
```

## 3. Reglas de Seguridad

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar roles
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin_principal';
    }
    
    function isContadora() {
      return request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'contadora';
    }
    
    function isSocio() {
      return request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'socio_operador';
    }
    
    // Reglas para usuarios
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Reglas para gastos
    match /gastos/{gastoId} {
      // Todos pueden leer
      allow read: if request.auth != null && 
        (isAdmin() || isContadora() || 
         (isSocio() && resource.data.usuarioId == request.auth.uid));
      
      // Crear gastos
      allow create: if request.auth != null && 
        request.resource.data.usuarioId == request.auth.uid;
      
      // Actualizar gastos
      allow update: if request.auth != null && 
        (isAdmin() || 
         (resource.data.usuarioId == request.auth.uid && 
          resource.data.estado == 'pendiente'));
      
      // Eliminar gastos
      allow delete: if isAdmin();
    }
    
    // Reglas para categorías y medios de pago
    match /categorias/{categoriaId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /mediosPago/{medioId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

## 4. Autenticación

### Configurar Authentication en Firebase Console

1. En Firebase Console → Authentication → Sign-in method
2. Habilitar "Correo electrónico/contraseña"
3. Agregar usuarios manualmente o por código

### Crear usuarios programáticamente

```javascript
// src/utils/initializeUsers.js
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const usuarios = [
  {
    email: 'juan.pablo@esm.com.ar',
    password: 'admin123',
    nombre: 'Juan Pablo Rúa',
    rol: 'admin_principal'
  },
  {
    email: 'luis.tello@esm.com.ar',
    password: 'socio123',
    nombre: 'Luis Tello',
    rol: 'socio_operador'
  },
  {
    email: 'eugenio.cavallaro@esm.com.ar',
    password: 'socio123',
    nombre: 'Eugenio Cavallaro',
    rol: 'socio_operador'
  },
  {
    email: 'noelia@esm.com.ar',
    password: 'conta123',
    nombre: 'Noelia',
    rol: 'contadora'
  }
];

export const initializeUsers = async () => {
  for (const usuario of usuarios) {
    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        usuario.email, 
        usuario.password
      );
      
      // Crear documento en Firestore
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Usuario creado:', usuario.email);
    } catch (error) {
      console.error('Error creando usuario:', usuario.email, error);
    }
  }
};
```

## 5. Storage para Archivos

### Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura a usuarios autenticados
    match /comprobantes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.resource.size < 5 * 1024 * 1024 && // Max 5MB
        request.resource.contentType.matches('image/.*|application/pdf');
    }
  }
}
```

## 6. Integración con React

### Servicio de Firebase

```javascript
// src/services/firebaseService.js
import { db, auth, storage } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Autenticación
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'usuarios', userCredential.user.uid));
    return {
      uid: userCredential.user.uid,
      ...userDoc.data()
    };
  } catch (error) {
    throw error;
  }
};

// Gastos
export const createGasto = async (gastoData) => {
  try {
    const docRef = doc(collection(db, 'gastos'));
    await setDoc(docRef, {
      ...gastoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getGastos = async (userId = null, rol = null) => {
  try {
    let q;
    
    if (rol === 'admin_principal' || rol === 'contadora') {
      // Ver todos los gastos
      q = query(collection(db, 'gastos'), orderBy('fecha', 'desc'));
    } else {
      // Ver solo sus gastos
      q = query(
        collection(db, 'gastos'), 
        where('usuarioId', '==', userId),
        orderBy('fecha', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const updateGasto = async (gastoId, updates) => {
  try {
    await updateDoc(doc(db, 'gastos', gastoId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw error;
  }
};

// Storage
export const uploadComprobante = async (file, gastoId) => {
  try {
    const storageRef = ref(storage, `comprobantes/${gastoId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// Categorías y Medios de Pago
export const getCategorias = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'categorias'), where('activa', '==', true), orderBy('orden'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getMediosPago = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'mediosPago'), where('activo', '==', true), orderBy('orden'))
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};
```

### Hook personalizado

```javascript
// src/hooks/useFirebase.js
import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos adicionales del usuario
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        setUser({
          uid: user.uid,
          email: user.email,
          ...userDoc.data()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
```

## 7. Migración de Datos

### Script de migración inicial

```javascript
// src/utils/migrateData.js
import { db } from '../config/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

export const migrateInitialData = async () => {
  const batch = writeBatch(db);

  // Migrar categorías
  const categorias = [
    { nombre: 'viáticos', orden: 1 },
    { nombre: 'útiles', orden: 2 },
    { nombre: 'transporte', orden: 3 },
    { nombre: 'alimentación', orden: 4 },
    { nombre: 'mantenimiento', orden: 5 },
    { nombre: 'otros', orden: 6 }
  ];

  categorias.forEach((cat, index) => {
    const docRef = doc(collection(db, 'categorias'));
    batch.set(docRef, {
      ...cat,
      activa: true,
      createdAt: new Date()
    });
  });

  // Migrar medios de pago
  const mediosPago = [
    { nombre: 'efectivo', orden: 1 },
    { nombre: 'transferencia', orden: 2 },
    { nombre: 'billetera', orden: 3 },
    { nombre: 'tarjeta', orden: 4 }
  ];

  mediosPago.forEach((medio, index) => {
    const docRef = doc(collection(db, 'mediosPago'));
    batch.set(docRef, {
      ...medio,
      activo: true,
      createdAt: new Date()
    });
  });

  await batch.commit();
  console.log('Migración completada');
};
```

## 🚀 Pasos de Implementación

1. **Crear proyecto en Firebase Console**
2. **Instalar dependencias**
3. **Configurar Firebase en tu app**
4. **Crear usuarios iniciales**
5. **Configurar reglas de seguridad**
6. **Migrar datos iniciales**
7. **Actualizar componentes React**

## 📝 Notas Importantes

- Firebase cobra por lectura/escritura, considera los costos
- Firestore tiene límites de 1 escritura por segundo por documento
- Storage cobra por almacenamiento y transferencia
- Considera usar Firebase Emulator para desarrollo local

## 🔒 Seguridad

- Nunca expongas las credenciales de Firebase
- Usa variables de entorno para la configuración
- Implementa validación tanto en cliente como en reglas
- Monitorea el uso en Firebase Console

---
*Guía creada para la implementación de Firebase en Control de Caja Chica ESM*