import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const ANNOUNCEMENT_DOC_PATH = 'config/announcement';

export const subscribeAnnouncement = (callback) => {
  const ref = doc(db, ANNOUNCEMENT_DOC_PATH);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ active: false, message: '' });
    }
  }, () => callback({ active: false, message: '' }));
};

export const getAnnouncement = async () => {
  const ref = doc(db, ANNOUNCEMENT_DOC_PATH);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  return { active: false, message: '' };
};

export const updateAnnouncement = async (data) => {
  const ref = doc(db, ANNOUNCEMENT_DOC_PATH);
  await setDoc(ref, {
    active: Boolean(data.active),
    message: data.message || '',
    updatedAt: new Date(),
  }, { merge: true });
};


