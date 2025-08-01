import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'usuarios';

// Obtener usuario por email
export const getUserByEmail = async (email) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener usuario por email:', error);
    return null;
  }
};

// Obtener usuario por ID
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTION_NAME, userId));
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    return null;
  }
};