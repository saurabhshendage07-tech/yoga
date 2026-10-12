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
import { createPaymentRecord, updatePaymentStatus } from './paymentService';

const COLLECTION_NAME = 'payment';

/**
 * Create a new booking / enrollment
 */
export async function createBooking(bookingData) {
  const amount = Number(bookingData.amount || bookingData.fee || 2499);
  const paymentId = bookingData.paymentId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
  const studentName = (bookingData.userName || bookingData.student_name || bookingData.studentName || bookingData.fullName || 'Practitioner').trim();
  const email = (bookingData.userEmail || bookingData.email || '').trim();
  const phone = (bookingData.userPhone || bookingData.mobile || bookingData.phone || '').trim();
  const courseName = bookingData.courseName || bookingData.course_name || 'Beginner Yoga Foundation';

  const newBooking = {
    bookingId,
    orderId: bookingId,
    paymentId,
    userId: bookingData.userId || null,
    userName: studentName,
    studentName,
    student_name: studentName,
    userEmail: email,
    email,
    userPhone: phone,
    phone,
    mobile: phone,
    courseId: bookingData.courseId || bookingData.course_id || 'course-1',
    course_id: bookingData.courseId || bookingData.course_id || 'course-1',
    courseName,
    course_name: courseName,
    amount,
    bookingStatus: bookingData.bookingStatus || 'pending',
    enrollmentStatus: bookingData.enrollmentStatus || (bookingData.bookingStatus === 'confirmed' ? 'Confirmed' : 'Pending'),
    paymentStatus: bookingData.paymentStatus || 'Pending Verification',
    payment_status: bookingData.payment_status || bookingData.paymentStatus || 'Pending Verification',
    batch: bookingData.batch || bookingData.preferredBatch || 'Morning Sunrise Batch',
    preferredBatch: bookingData.batch || bookingData.preferredBatch || 'Morning Sunrise Batch',
    utrNumber: bookingData.utrNumber || bookingData.utr_number || '',
    utr_number: bookingData.utrNumber || bookingData.utr_number || '',
    paymentScreenshotUrl: bookingData.paymentScreenshotUrl || bookingData.payment_screenshot_url || '',
    payment_screenshot_url: bookingData.paymentScreenshotUrl || bookingData.payment_screenshot_url || '',
    address: bookingData.address || '',
    emergencyContact: bookingData.emergencyContact || bookingData.emergency_contact || '',
    notes: bookingData.notes || bookingData.health_goals || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newBooking));

    // Also ensure student record exists/updated in "student" collection if email present
    if (email) {
      try {
        const studentColRef = collection(db, 'student');
        await addDoc(studentColRef, sanitizeData({
          name: studentName,
          email,
          phone,
          mobile: phone,
          role: 'user',
          status: 'active',
          activeCourses: [courseName],
          batch: newBooking.batch,
          address: newBooking.address,
          emergencyContact: newBooking.emergencyContact,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }));
      } catch (e) {
        // Non-blocking
      }
    }

    return { id: docRef.id, ...newBooking, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error creating booking in Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all bookings / enrollments from Firestore
 */
export async function getBookings({ search = '', courseId = 'all', bookingStatus = 'all', paymentStatus = 'all' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let bookings = snapshot.docs.map(formatDoc);

    // Sort descending by createdAt
    bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.userName?.toLowerCase().includes(q) ||
        b.studentName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.userPhone?.toLowerCase().includes(q) ||
        b.mobile?.toLowerCase().includes(q) ||
        b.courseName?.toLowerCase().includes(q) ||
        b.utrNumber?.toLowerCase().includes(q) ||
        b.utr_number?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q)
      );
    }

    if (courseId && courseId !== 'all') {
      bookings = bookings.filter(b => b.courseId === courseId || b.course_id === courseId);
    }

    if (bookingStatus && bookingStatus !== 'all') {
      bookings = bookings.filter(b => (b.bookingStatus || '').toLowerCase() === bookingStatus.toLowerCase());
    }

    if (paymentStatus && paymentStatus !== 'all') {
      bookings = bookings.filter(b => {
        const pStatus = (b.paymentStatus || b.payment_status || '').toLowerCase();
        return pStatus.includes(paymentStatus.toLowerCase());
      });
    }

    return bookings;
  } catch (err) {
    console.error('Error fetching bookings from Firestore:', err);
    throw err;
  }
}

/**
 * Fetch bookings for a specific user / student
 */
export async function getUserBookings(userId, userEmail) {
  try {
    const all = await getBookings();
    return all.filter(b => {
      const matchUid = userId && b.userId === userId;
      const matchEmail = userEmail && (b.userEmail?.toLowerCase() === userEmail?.toLowerCase() || b.email?.toLowerCase() === userEmail?.toLowerCase());
      return matchUid || matchEmail;
    });
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    return [];
  }
}

/**
 * Update booking status (e.g. verified / confirmed, rejected / cancelled)
 */
export async function updateBookingStatus(bookingId, newStatus, reason = '') {
  if (!bookingId) throw new Error('Booking ID is required.');

  const isConfirm = newStatus === 'confirmed' || newStatus === 'Confirmed' || newStatus === 'Active' || newStatus === 'Verified';
  const isReject = newStatus === 'cancelled' || newStatus === 'Cancelled' || newStatus === 'Rejected';

  const updatePayload = {
    bookingStatus: isConfirm ? 'confirmed' : (isReject ? 'cancelled' : newStatus.toLowerCase()),
    enrollmentStatus: isConfirm ? 'Confirmed' : (isReject ? 'Rejected' : 'Pending'),
    paymentStatus: isConfirm ? 'Verified' : (isReject ? 'Rejected' : 'Pending Verification'),
    payment_status: isConfirm ? 'Verified' : (isReject ? 'Rejected' : 'Pending Verification'),
    updatedAt: serverTimestamp()
  };

  if (isConfirm) {
    updatePayload.verified_at = new Date().toISOString();
    updatePayload.verified_by = 'Studio Administrator';
  } else if (isReject) {
    updatePayload.rejection_reason = reason || 'Payment could not be verified.';
    updatePayload.verified_at = new Date().toISOString();
    updatePayload.verified_by = 'Studio Administrator';
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    await updateDoc(docRef, sanitizeData(updatePayload));
    return { id: bookingId, ...updatePayload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error updating booking status in Firestore:', err);
    throw err;
  }
}

/**
 * Delete booking record
 */
export async function deleteBooking(bookingId) {
  if (!bookingId) throw new Error('Booking ID is required.');

  try {
    const docRef = doc(db, COLLECTION_NAME, bookingId);
    await deleteDoc(docRef);
    return { success: true, id: bookingId };
  } catch (err) {
    console.error('Error deleting booking from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for bookings collection
 */
export function subscribeToBookings(callback) {
  const colRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    const bookings = snapshot.docs.map(formatDoc);
    bookings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    callback(bookings);
  }, (error) => {
    console.error('Firestore real-time booking subscription error:', error);
  });

  return unsubscribe;
}
