// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCoIj7d4p9RDsObUzKaAcEXWEWcCmISOXA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sage-archway-464312-b5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sage-archway-464312-b5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sage-archway-464312-b5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "38415501213",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:38415501213:web:26f14fbe5b2825b78b43b2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-LXLM3SVL4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;