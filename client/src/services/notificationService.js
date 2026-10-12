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
import { db, sanitizeData, formatDoc } from '../firebase/firebase';

const COLLECTION_NAME = 'notification';

/**
 * Fetch all notifications from Firestore collection "notification"
 */
export async function getNotifications({ search = '', channel = 'all', status = 'all' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let notifications = snapshot.docs.map(formatDoc);

    // Sort descending by createdAt
    notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search) {
      const q = search.toLowerCase();
      notifications = notifications.filter(n =>
        n.recipientName?.toLowerCase().includes(q) ||
        n.recipientMobile?.toLowerCase().includes(q) ||
        n.mobile?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    }

    if (channel !== 'all') {
      notifications = notifications.filter(n => (n.channel || 'WhatsApp').toLowerCase() === channel.toLowerCase());
    }

    if (status !== 'all') {
      notifications = notifications.filter(n => (n.status || 'Delivered').toLowerCase() === status.toLowerCase());
    }

    return notifications;
  } catch (err) {
    console.error('Error fetching notifications from Firestore:', err);
    throw err;
  }
}

/**
 * Create a new notification log in Firestore collection "notification"
 */
export async function createNotification(notificationData) {
  const recipientName = (notificationData.recipientName || 'Practitioner').trim();
  const mobile = (notificationData.mobile || notificationData.recipientMobile || '').trim();
  const message = (notificationData.message || '').trim();

  if (!mobile || !message) {
    throw new Error('Mobile number and message content are required.');
  }

  const newDoc = {
    recipientName,
    recipientMobile: mobile,
    mobile,
    recipientEmail: notificationData.recipientEmail || '',
    channel: notificationData.channel || 'WhatsApp',
    type: notificationData.type || 'custom_broadcast',
    message,
    status: notificationData.status || 'Delivered',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newDoc));
    return { id: docRef.id, ...newDoc, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error creating notification in Firestore:', err);
    throw err;
  }
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(notificationId, status) {
  if (!notificationId) throw new Error('Notification ID is required.');

  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    return { id: notificationId, status };
  } catch (err) {
    console.error('Error updating notification in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a notification from Firestore
 */
export async function deleteNotification(notificationId) {
  if (!notificationId) throw new Error('Notification ID is required.');

  try {
    const docRef = doc(db, COLLECTION_NAME, notificationId);
    await deleteDoc(docRef);
    return { success: true, id: notificationId };
  } catch (err) {
    console.error('Error deleting notification from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for notification collection
 */
export function subscribeToNotifications(callback) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const notifications = snapshot.docs.map(formatDoc);
      notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      callback(notifications);
    }, (error) => {
      console.warn('Firestore real-time notification subscription notice:', error);
      callback([]);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize notification listener:', err);
    callback([]);
    return () => {};
  }
}
