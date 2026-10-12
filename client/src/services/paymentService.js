import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebase';
import { initialPaymentSettings } from './mockData';

const COLLECTION_NAME = 'payment';
const SETTING_COLLECTION = 'setting';

/**
 * Fetch all payments from Firestore collection "payment"
 */
export async function getPayments({ search = '', status = 'all' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let payments = snapshot.docs.map(formatDoc);

    // Sort descending by createdAt
    payments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(p =>
        p.paymentId?.toLowerCase().includes(q) ||
        p.bookingId?.toLowerCase().includes(q) ||
        p.orderId?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q) ||
        p.studentName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.userEmail?.toLowerCase().includes(q) ||
        p.transactionId?.toLowerCase().includes(q) ||
        p.utrNumber?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    }

    if (status !== 'all') {
      payments = payments.filter(p => {
        const pStatus = (p.paymentStatus || p.status || '').toLowerCase();
        return pStatus === status.toLowerCase();
      });
    }

    return payments;
  } catch (err) {
    console.error('Error fetching payments from Firestore:', err);
    throw err;
  }
}

/**
 * Fetch single payment by ID
 */
export async function getPaymentById(paymentId) {
  if (!paymentId) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }
    return null;
  } catch (err) {
    console.error('Error fetching payment by ID from Firestore:', err);
    throw err;
  }
}

/**
 * Create a new payment record in Firestore collection "payment"
 */
export async function createPaymentRecord(paymentData) {
  const paymentId = paymentData.paymentId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const studentName = (paymentData.userName || paymentData.studentName || 'Student').trim();

  const newPayment = {
    paymentId,
    bookingId: paymentData.bookingId || paymentData.orderId || `ORD-${Date.now().toString().slice(-6)}`,
    orderId: paymentData.orderId || paymentData.bookingId || `ORD-${Date.now().toString().slice(-6)}`,
    userId: paymentData.userId || null,
    userName: studentName,
    studentName,
    email: (paymentData.email || paymentData.userEmail || '').trim(),
    phone: (paymentData.phone || paymentData.userPhone || paymentData.mobile || '').trim(),
    courseName: paymentData.courseName || 'Yoga Course',
    courseId: paymentData.courseId || '',
    amount: Number(paymentData.amount || 0),
    transactionId: paymentData.transactionId || paymentData.utrNumber || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    utrNumber: paymentData.utrNumber || paymentData.transactionId || '',
    paymentStatus: paymentData.paymentStatus || paymentData.status || 'Pending',
    status: paymentData.paymentStatus || paymentData.status || 'Pending',
    paymentMethod: paymentData.paymentMethod || paymentData.method || 'UPI',
    screenshotUrl: paymentData.screenshotUrl || paymentData.paymentScreenshotUrl || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newPayment));
    return { id: docRef.id, ...newPayment, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error creating payment record in Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing payment record in Firestore
 */
export async function updatePayment(paymentId, data) {
  if (!paymentId) throw new Error('Payment ID is required for update.');

  const updatePayload = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (data.paymentStatus) {
    updatePayload.status = data.paymentStatus;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await updateDoc(docRef, sanitizeData(updatePayload));
    return { id: paymentId, ...updatePayload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error updating payment in Firestore:', err);
    throw err;
  }
}

/**
 * Update payment status (e.g. Success, Pending, Failed, Refunded)
 */
export async function updatePaymentStatus(paymentId, newStatus) {
  if (!paymentId) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await updateDoc(docRef, {
      paymentStatus: newStatus,
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return { id: paymentId, paymentStatus: newStatus, status: newStatus };
  } catch (err) {
    console.error('Error updating payment status in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a payment record from Firestore
 */
export async function deletePayment(paymentId) {
  if (!paymentId) throw new Error('Payment ID is required for deletion.');

  try {
    const docRef = doc(db, COLLECTION_NAME, paymentId);
    await deleteDoc(docRef);
    return { success: true, id: paymentId };
  } catch (err) {
    console.error('Error deleting payment from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for payments collection
 */
export function subscribeToPayments(callback) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      let payments = snapshot.docs.map(formatDoc);
      if (payments.length === 0) {
        payments = initialPayments;
      }
      payments.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      callback(payments);
    }, (error) => {
      console.warn('Firestore real-time payment subscription notice:', error);
      callback(initialPayments);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize payment listener:', err);
    callback(initialPayments);
    return () => {};
  }
}

/**
 * Fetch Payment Settings (UPI ID, QR code) from "setting/payment"
 */
export async function getPaymentSettings() {
  try {
    const docRef = doc(db, SETTING_COLLECTION, 'payment');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }

    return initialPaymentSettings;
  } catch (err) {
    console.error('Error fetching payment settings from Firestore:', err);
    return initialPaymentSettings;
  }
}

/**
 * Save Payment Settings to "setting/payment"
 */
export async function savePaymentSettings(settingsData) {
  try {
    const docRef = doc(db, SETTING_COLLECTION, 'payment');
    const payload = {
      ...settingsData,
      updatedAt: serverTimestamp()
    };
    await setDoc(docRef, sanitizeData(payload), { merge: true });
    return { id: 'payment', ...payload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error saving payment settings to Firestore:', err);
    throw err;
  }
}
