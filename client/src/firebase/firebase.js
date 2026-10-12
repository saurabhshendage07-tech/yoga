import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  serverTimestamp as firestoreServerTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Safely read Vite environment variables without fake placeholder values
export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim()
};

/**
 * Validate that all required Firebase config keys exist in client/.env
 */
export function validateFirebaseConfig() {
  const missingKeys = [];
  if (!firebaseConfig.apiKey) missingKeys.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missingKeys.push('VITE_FIREBASE_APP_ID');

  const isValid = missingKeys.length === 0 && !firebaseConfig.apiKey.toLowerCase().includes('dummy');

  return {
    isValid,
    missingKeys,
    projectId: firebaseConfig.projectId || '(Not configured in .env)',
    authDomain: firebaseConfig.authDomain || '(Not configured in .env)',
    appId: firebaseConfig.appId || '(Not configured in .env)',
    hasApiKey: Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.toLowerCase().includes('dummy'))
  };
}

// Check configuration on module load
const configStatus = validateFirebaseConfig();
if (!configStatus.isValid) {
  console.warn(
    `⚠️ [Firebase Config Notice]: The following environment variables are missing or empty in client/.env:`,
    configStatus.missingKeys.join(', '),
    `\nPlease add your Firebase Project Web credentials into client/.env to connect Authentication and Firestore.`
  );
}

// Initialize or reuse Firebase App instance safely without crashing module evaluation
const optionsToInit = {
  apiKey: firebaseConfig.apiKey || 'AIzaSy_SafeInit_Key_PranaVedaYoga2026',
  authDomain: firebaseConfig.authDomain || `${firebaseConfig.projectId || 'yoga'}.firebaseapp.com`,
  projectId: firebaseConfig.projectId || 'yoga',
  storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId || 'yoga'}.appspot.com`,
  messagingSenderId: firebaseConfig.messagingSenderId || '123456789012',
  appId: firebaseConfig.appId || '1:123456789012:web:abcdef1234567890abcdef'
};

let appInstance;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(optionsToInit);
} catch (e) {
  console.warn('Firebase initializeApp notice:', e);
  appInstance = getApps().length > 0 ? getApp() : initializeApp(optionsToInit, 'pranaveda-app');
}

export const app = appInstance;

let authInstance;
try {
  authInstance = getAuth(appInstance);
} catch (e) {
  console.warn('Firebase getAuth notice:', e);
}
export const auth = authInstance;

let dbInstance;
try {
  dbInstance = getFirestore(appInstance);
} catch (e) {
  console.warn('Firebase getFirestore notice:', e);
}
export const db = dbInstance;

let storageInstance;
try {
  storageInstance = getStorage(appInstance);
} catch (e) {
  console.warn('Firebase getStorage notice:', e);
}
export const storage = storageInstance;
export const serverTimestamp = firestoreServerTimestamp;

/**
 * Clean object to prevent undefined values from being passed to Firestore
 */
export function sanitizeData(data) {
  if (data === null || data === undefined) return null;
  if (data instanceof Date) return data.toISOString();
  if (data instanceof Timestamp) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeData).filter(item => item !== undefined);
  }
  const clean = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      clean[key] = sanitizeData(val);
    }
  }
  return clean;
}

/**
 * Helper to normalize Firestore Document Snapshot to clean JS object
 */
export function formatDoc(docSnap) {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  const formatted = { id: docSnap.id, ...data };
  
  if (formatted.createdAt && typeof formatted.createdAt.toDate === 'function') {
    formatted.createdAt = formatted.createdAt.toDate().toISOString();
  }
  if (formatted.updatedAt && typeof formatted.updatedAt.toDate === 'function') {
    formatted.updatedAt = formatted.updatedAt.toDate().toISOString();
  }
  return formatted;
}

export default app;