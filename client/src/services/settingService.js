import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebaseConfig';
import { initialStudioSettings, initialFooterSettings } from './mockData';

const COLLECTION_NAME = 'setting';

/**
 * Fetch Studio Settings from Firestore collection "setting" document "studio"
 */
export async function getStudioSettings() {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'studio');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }
    return initialStudioSettings;
  } catch (err) {
    console.error('Error fetching studio settings from Firestore:', err);
    return initialStudioSettings;
  }
}

/**
 * Save Studio Settings to Firestore document "setting/studio"
 */
export async function saveStudioSettings(data) {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'studio');
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, sanitizeData(payload), { merge: true });
    return { id: 'studio', ...payload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error saving studio settings to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch Footer Settings from Firestore collection "setting" document "footer"
 */
export async function getFooterSettings() {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'footer');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }
    return initialFooterSettings;
  } catch (err) {
    console.error('Error fetching footer settings from Firestore:', err);
    return initialFooterSettings;
  }
}

/**
 * Save Footer Settings to Firestore document "setting/footer"
 */
export async function saveFooterSettings(data) {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'footer');
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, sanitizeData(payload), { merge: true });
    return { id: 'footer', ...payload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error saving footer settings to Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for studio settings
 */
export function subscribeToStudioSettings(callback) {
  try {
    const docRef = doc(db, COLLECTION_NAME, 'studio');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(formatDoc(docSnap));
      }
    }, (err) => {
      console.warn('Firestore studio settings listener notice:', err);
      callback(initialStudioSettings);
    });
  } catch (err) {
    console.warn('Could not initialize studio settings listener:', err);
    callback(initialStudioSettings);
    return () => {};
  }
}
