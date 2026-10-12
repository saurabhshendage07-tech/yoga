import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, sanitizeData, validateFirebaseConfig } from '../firebase/firebase';

/**
 * Admin Login with Firebase Auth and Firestore "admin/{uid}" Verification
 */
export async function loginAdmin(email, password) {
  const cleanEmail = email?.trim();
  if (!cleanEmail || !password) {
    throw new Error('Please enter both admin email and password.');
  }

  const configStatus = validateFirebaseConfig();
  if (!configStatus.isValid) {
    throw new Error(
      `Firebase Configuration Incomplete: Missing environment variables [${configStatus.missingKeys.join(', ')}] in client/.env. Please paste your Firebase Web credentials into client/.env.`
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    // Verify admin role in Firestore "admin/{uid}" collection
    const adminDocRef = doc(db, 'admin', uid);
    const adminDocSnap = await getDoc(adminDocRef);

    if (!adminDocSnap.exists() || adminDocSnap.data()?.role !== 'admin') {
      // User is authenticated in Firebase Auth, but NOT authorized in "admin/{uid}"
      await signOut(auth);
      throw new Error('Access denied. Administrator privileges required in "admin" collection.');
    }

    const adminData = adminDocSnap.data();
    const adminProfile = {
      uid,
      id: uid,
      email: firebaseUser.email,
      role: 'admin',
      name: adminData.name || 'Studio Administrator',
      ...adminData
    };

    localStorage.setItem('pranaveda_current_user', JSON.stringify(adminProfile));
    return adminProfile;
  } catch (err) {
    if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
      throw new Error('Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in client/.env matches your Firebase Console project settings.');
    }
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your administrator credentials.');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
    throw err;
  }
}

/**
 * Standard User/Student Login
 */
export async function loginUser(email, password) {
  const cleanEmail = email?.trim();
  if (!cleanEmail || !password) {
    throw new Error('Please enter both email and password.');
  }

  const configStatus = validateFirebaseConfig();
  if (!configStatus.isValid) {
    throw new Error(
      `Firebase Configuration Incomplete: Missing environment variables [${configStatus.missingKeys.join(', ')}] in client/.env. Please paste your Firebase Web credentials into client/.env.`
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    // Check if user is an admin
    const adminDocRef = doc(db, 'admin', uid);
    const adminDocSnap = await getDoc(adminDocRef);

    if (adminDocSnap.exists() && adminDocSnap.data()?.role === 'admin') {
      const adminData = adminDocSnap.data();
      const adminProfile = {
        uid,
        id: uid,
        email: firebaseUser.email,
        role: 'admin',
        name: adminData.name || 'Studio Administrator',
        ...adminData
      };
      localStorage.setItem('pranaveda_current_user', JSON.stringify(adminProfile));
      return adminProfile;
    }

    // Check or fetch from "student/{uid}" collection
    const studentDocRef = doc(db, 'student', uid);
    const studentDocSnap = await getDoc(studentDocRef);

    let studentProfile;
    if (studentDocSnap.exists()) {
      studentProfile = {
        uid,
        id: uid,
        email: firebaseUser.email,
        role: 'user',
        ...studentDocSnap.data()
      };
    } else {
      // Auto-provision initial student record if not yet created
      studentProfile = {
        uid,
        id: uid,
        name: cleanEmail.split('@')[0],
        email: firebaseUser.email,
        role: 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      try {
        await setDoc(studentDocRef, sanitizeData(studentProfile), { merge: true });
      } catch (e) {
        console.warn('Could not auto-provision student doc:', e);
      }
    }

    localStorage.setItem('pranaveda_current_user', JSON.stringify(studentProfile));
    return studentProfile;
  } catch (err) {
    if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
      throw new Error('Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in client/.env matches your Firebase Console project settings.');
    }
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please verify your login credentials.');
    }
    if (err.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
    throw err;
  }
}

/**
 * Register a new User/Student with Firebase Auth and Firestore "student" collection
 */
export async function registerUser({ name, email, phone = '', mobile = '', password, role = 'user' }) {
  const cleanEmail = email?.trim();
  const assignedPhone = phone || mobile || '';

  if (!cleanEmail || !password) {
    throw new Error('Please provide email and password.');
  }

  const configStatus = validateFirebaseConfig();
  if (!configStatus.isValid) {
    throw new Error(
      `Firebase Configuration Incomplete: Missing environment variables [${configStatus.missingKeys.join(', ')}] in client/.env. Please paste your Firebase Web credentials into client/.env.`
    );
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    const studentRecord = {
      uid,
      id: uid,
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: assignedPhone.trim(),
      mobile: assignedPhone.trim(),
      role: 'user',
      status: 'active',
      activeCourses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save to Firestore "student" collection
    const studentDocRef = doc(db, 'student', uid);
    await setDoc(studentDocRef, sanitizeData(studentRecord));

    const userProfile = {
      uid,
      id: uid,
      ...studentRecord,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('pranaveda_current_user', JSON.stringify(userProfile));
    return userProfile;
  } catch (err) {
    if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
      throw new Error('Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in client/.env matches your Firebase Console project settings.');
    }
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please sign in.');
    }
    if (err.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    }
    throw err;
  }
}

/**
 * Logout User / Admin
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } finally {
    localStorage.removeItem('pranaveda_current_user');
  }
}

export async function logoutAdmin() {
  return logoutUser();
}

/**
 * Send Password Reset Email via Firebase Auth
 */
export async function resetPassword(email) {
  const cleanEmail = email?.trim();
  if (!cleanEmail) {
    throw new Error('Please enter your registered email address.');
  }

  const configStatus = validateFirebaseConfig();
  if (!configStatus.isValid) {
    throw new Error(
      `Firebase Configuration Incomplete: Missing environment variables [${configStatus.missingKeys.join(', ')}] in client/.env. Please paste your Firebase Web credentials into client/.env.`
    );
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true, message: `Password reset email sent to ${cleanEmail}` };
  } catch (err) {
    if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
      throw new Error('Invalid Firebase API key. Please check your VITE_FIREBASE_API_KEY in client/.env matches your Firebase Console project settings.');
    }
    if (err.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    }
    throw err;
  }
}

/**
 * Subscribe to Firebase Auth state listener with Firestore role resolution
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      localStorage.removeItem('pranaveda_current_user');
      callback(null);
      return;
    }

    const uid = firebaseUser.uid;

    try {
      // 1. Check if UID exists in "admin" collection
      const adminDocRef = doc(db, 'admin', uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists() && adminDocSnap.data()?.role === 'admin') {
        const adminData = adminDocSnap.data();
        const profile = {
          uid,
          id: uid,
          email: firebaseUser.email,
          role: 'admin',
          name: adminData.name || 'Studio Administrator',
          ...adminData
        };
        localStorage.setItem('pranaveda_current_user', JSON.stringify(profile));
        callback(profile);
        return;
      }

      // 2. Otherwise check "student" collection
      const studentDocRef = doc(db, 'student', uid);
      const studentDocSnap = await getDoc(studentDocRef);

      if (studentDocSnap.exists()) {
        const profile = {
          uid,
          id: uid,
          email: firebaseUser.email,
          role: 'user',
          ...studentDocSnap.data()
        };
        localStorage.setItem('pranaveda_current_user', JSON.stringify(profile));
        callback(profile);
        return;
      }

      // 3. Fallback user
      const defaultUser = {
        uid,
        id: uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Practitioner',
        role: 'user'
      };
      localStorage.setItem('pranaveda_current_user', JSON.stringify(defaultUser));
      callback(defaultUser);
    } catch (err) {
      console.error('Error resolving user profile from Firestore:', err);
      const cached = getCurrentAuthUser();
      callback(cached || {
        uid,
        id: uid,
        email: firebaseUser.email,
        role: 'user'
      });
    }
  });
}

/**
 * Get cached auth user from localStorage
 */
export function getCurrentAuthUser() {
  try {
    const raw = localStorage.getItem('pranaveda_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
