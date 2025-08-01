// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCoIj7d4p9RDsObUzKaAcEXWEWcCmISOXA",
  authDomain: "sage-archway-464312-b5.firebaseapp.com",
  projectId: "sage-archway-464312-b5",
  storageBucket: "sage-archway-464312-b5.firebasestorage.app",
  messagingSenderId: "38415501213",
  appId: "1:38415501213:web:26f14fbe5b2825b78b43b2",
  measurementId: "G-LXLM3SVL4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;