import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'enquiries';

/**
 * Submit a new enquiry to Firestore collection "enquiries"
 */
export async function createEnquiry({ name, email, phone = '', mobile = '', course = '', subject = 'Yoga Program Enquiry', message = '' }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim();
  const assignedPhone = (phone || mobile || '').trim();

  if (!cleanName || !cleanEmail) {
    throw new Error('Name and email are required to submit an enquiry.');
  }

  const newDoc = {
    name: cleanName,
    email: cleanEmail,
    phone: assignedPhone,
    mobile: assignedPhone,
    course: (course || '').trim(),
    subject: (subject || 'General Yoga Inquiry').trim(),
    message: (message || '').trim(),
    status: 'unread',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newDoc));
    return { id: docRef.id, ...newDoc, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error submitting enquiry to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all enquiries from Firestore collection "enquiries"
 */
export async function getEnquiries({ status = 'all', search = '' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let enquiries = snapshot.docs.map(formatDoc);

    // Sort descending by createdAt
    enquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search) {
      const q = search.toLowerCase();
      enquiries = enquiries.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.phone?.toLowerCase().includes(q) ||
        e.mobile?.toLowerCase().includes(q) ||
        e.course?.toLowerCase().includes(q) ||
        e.subject?.toLowerCase().includes(q) ||
        e.message?.toLowerCase().includes(q)
      );
    }

    if (status !== 'all') {
      enquiries = enquiries.filter(e => {
        const eStatus = (e.status || 'unread').toLowerCase();
        if (status === 'New' || status === 'unread') {
          return eStatus === 'unread' || eStatus === 'new';
        }
        return eStatus === status.toLowerCase();
      });
    }

    return enquiries;
  } catch (err) {
    console.error('Error fetching enquiries from Firestore:', err);
    throw err;
  }
}

/**
 * Update enquiry status (e.g. unread, read, replied)
 */
export async function updateEnquiryStatus(enquiryId, status) {
  if (!enquiryId) throw new Error('Enquiry ID is required.');

  try {
    const docRef = doc(db, COLLECTION_NAME, enquiryId);
    await updateDoc(docRef, {
      status: status.toLowerCase(),
      updatedAt: serverTimestamp()
    });
    return { id: enquiryId, status: status.toLowerCase() };
  } catch (err) {
    console.error('Error updating enquiry status in Firestore:', err);
    throw err;
  }
}

/**
 * Delete an enquiry from Firestore
 */
export async function deleteEnquiry(enquiryId) {
  if (!enquiryId) throw new Error('Enquiry ID is required.');

  try {
    const docRef = doc(db, COLLECTION_NAME, enquiryId);
    await deleteDoc(docRef);
    return { success: true, id: enquiryId };
  } catch (err) {
    console.error('Error deleting enquiry from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for enquiries collection
 */
export function subscribeToEnquiries(callback) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const enquiries = snapshot.docs.map(formatDoc);
      enquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      callback(enquiries);
    }, (error) => {
      console.warn('Firestore real-time enquiries subscription notice:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize enquiries listener:', err);
    callback([]);
    return () => {};
  }
}
