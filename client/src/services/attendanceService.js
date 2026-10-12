import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'attendance';

/**
 * Fetch all attendance records from Firestore collection "attendance"
 */
export async function getAttendance({ date = '', studentId = '', courseId = '' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let records = snapshot.docs.map(formatDoc);

    // Sort descending by date / createdAt
    records.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

    if (date) {
      records = records.filter(r => r.date === date);
    }
    if (studentId) {
      records = records.filter(r => r.studentId === studentId);
    }
    if (courseId) {
      records = records.filter(r => r.courseId === courseId);
    }

    return records;
  } catch (err) {
    console.error('Error fetching attendance from Firestore:', err);
    throw err;
  }
}

/**
 * Mark or create attendance record in Firestore collection "attendance"
 */
export async function markAttendance(attendanceData) {
  const studentName = (attendanceData.studentName || attendanceData.userName || 'Student').trim();
  const date = attendanceData.date || new Date().toISOString().slice(0, 10);
  const status = attendanceData.status || 'Present'; // 'Present', 'Absent', 'Late', 'Excused'

  const record = {
    studentId: attendanceData.studentId || '',
    studentName,
    courseId: attendanceData.courseId || '',
    courseName: attendanceData.courseName || 'Yoga Batch',
    batch: attendanceData.batch || 'Morning Sunrise Batch',
    session: attendanceData.session || 'Standard Session',
    date,
    status,
    markedBy: attendanceData.markedBy || 'Admin',
    notes: attendanceData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(record));
    return { id: docRef.id, ...record, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error marking attendance in Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing attendance record
 */
export async function updateAttendance(attendanceId, data) {
  if (!attendanceId) throw new Error('Attendance ID is required.');

  const updatePayload = {
    ...data,
    updatedAt: serverTimestamp()
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, attendanceId);
    await updateDoc(docRef, sanitizeData(updatePayload));
    return { id: attendanceId, ...updatePayload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error updating attendance in Firestore:', err);
    throw err;
  }
}

/**
 * Delete an attendance record
 */
export async function deleteAttendance(attendanceId) {
  if (!attendanceId) throw new Error('Attendance ID is required for deletion.');

  try {
    const docRef = doc(db, COLLECTION_NAME, attendanceId);
    await deleteDoc(docRef);
    return { success: true, id: attendanceId };
  } catch (err) {
    console.error('Error deleting attendance from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for attendance collection
 */
export function subscribeToAttendance(callback) {
  const colRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const records = snapshot.docs.map(formatDoc);
    records.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    callback(records);
  }, (error) => {
    console.error('Firestore real-time attendance subscription error:', error);
  });

  return unsubscribe;
}
