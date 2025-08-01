// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey) {
  console.error('Firebase configuration is missing. Please check your .env file.');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuración adicional para desarrollo
if (import.meta.env.DEV) {
  // Conectar a emuladores locales si están disponibles
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export default app;