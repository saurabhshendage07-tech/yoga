import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData } from '../firebase/firebaseConfig';
import {
  initialCourses,
  initialUsers,
  initialPayments,
  initialContactMessages,
  initialStudioSettings,
  initialFooterSettings,
  initialPaymentSettings
} from './mockData';

/**
 * Automatically seeds all initial default collections & documents into Firestore
 * for project "yoga" (collections: courses, setting, student, payment, attendance, notification, enquiries)
 */
export async function autoSeedAllFirestoreCollections({ force = false } = {}) {
  const report = {
    courses: 0,
    setting: 0,
    student: 0,
    payment: 0,
    attendance: 0,
    notification: 0,
    enquiries: 0,
    errors: []
  };

  try {
    // 1. SEED SETTING (setting/studio, setting/payment, setting/footer)
    try {
      await setDoc(doc(db, 'setting', 'studio'), sanitizeData({
        ...initialStudioSettings,
        updatedAt: serverTimestamp()
      }), { merge: true });

      await setDoc(doc(db, 'setting', 'payment'), sanitizeData({
        ...initialPaymentSettings,
        updatedAt: serverTimestamp()
      }), { merge: true });

      await setDoc(doc(db, 'setting', 'footer'), sanitizeData({
        ...initialFooterSettings,
        updatedAt: serverTimestamp()
      }), { merge: true });

      report.setting = 3;
    } catch (e) {
      console.warn('Error seeding setting collection:', e);
      report.errors.push(`Setting: ${e.message}`);
    }

    // 2. SEED COURSES
    try {
      const coursesSnap = await getDocs(collection(db, 'courses')).catch(() => null);
      if (force || !coursesSnap || coursesSnap.empty) {
        for (const course of initialCourses) {
          const docRef = doc(db, 'courses', course.id);
          await setDoc(docRef, sanitizeData({
            ...course,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
          report.courses++;
        }
      }
    } catch (e) {
      console.warn('Error seeding courses:', e);
      report.errors.push(`Courses: ${e.message}`);
    }

    // 3. SEED STUDENT
    try {
      const studentSnap = await getDocs(collection(db, 'student')).catch(() => null);
      if (force || !studentSnap || studentSnap.empty) {
        for (const student of initialUsers) {
          if (student.role !== 'admin') {
            const docRef = doc(db, 'student', student.id);
            await setDoc(docRef, sanitizeData({
              ...student,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }), { merge: true });
            report.student++;
          }
        }
      }
    } catch (e) {
      console.warn('Error seeding students:', e);
      report.errors.push(`Student: ${e.message}`);
    }

    // 4. SEED PAYMENT
    try {
      const paymentSnap = await getDocs(collection(db, 'payment')).catch(() => null);
      if (force || !paymentSnap || paymentSnap.empty) {
        for (const pay of initialPayments) {
          const docRef = doc(db, 'payment', pay.id);
          await setDoc(docRef, sanitizeData({
            ...pay,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
          report.payment++;
        }
      }
    } catch (e) {
      console.warn('Error seeding payments:', e);
      report.errors.push(`Payment: ${e.message}`);
    }

    // 5. SEED ATTENDANCE
    try {
      const attSnap = await getDocs(collection(db, 'attendance')).catch(() => null);
      if (force || !attSnap || attSnap.docs.length <= 1) {
        const todayStr = new Date().toISOString().slice(0, 10);
        const sampleAttendance = [
          {
            id: 'att_01',
            studentId: 'user_student_01',
            studentName: 'Aarav Sharma',
            studentMobile: '9876543210',
            courseId: 'course-1',
            courseName: 'Beginner Yoga Foundation',
            date: todayStr,
            batch: 'Morning Sunrise Batch (06:30 AM - 07:30 AM)',
            status: 'Present'
          },
          {
            id: 'att_02',
            studentId: 'user_student_02',
            studentName: 'Pooja Deshmukh',
            studentMobile: '9123456780',
            courseId: 'course-2',
            courseName: 'Advanced Hatha & Vinyasa Flow',
            date: todayStr,
            batch: 'Morning Power Flow (07:45 AM - 09:00 AM)',
            status: 'Present'
          },
          {
            id: 'att_03',
            studentId: 'user_student_03',
            studentName: 'Rohan Kulkarni',
            studentMobile: '9887766554',
            courseId: 'course-3',
            courseName: 'Weight Management & Core Power Yoga',
            date: todayStr,
            batch: 'Evening Fat-Burn Batch (06:00 PM - 07:00 PM)',
            status: 'Absent'
          }
        ];

        for (const att of sampleAttendance) {
          const docRef = doc(db, 'attendance', att.id);
          await setDoc(docRef, sanitizeData({
            ...att,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
          report.attendance++;
        }
      }
    } catch (e) {
      console.warn('Error seeding attendance:', e);
      report.errors.push(`Attendance: ${e.message}`);
    }

    // 6. SEED NOTIFICATION
    try {
      const notifSnap = await getDocs(collection(db, 'notification')).catch(() => null);
      if (force || !notifSnap || notifSnap.empty) {
        const sampleNotifs = [
          {
            id: 'notif_01',
            recipientName: 'All Yoga Students',
            recipientMobile: '+91 98765 43210',
            mobile: '+91 98765 43210',
            channel: 'WhatsApp',
            type: 'broadcast',
            message: 'Namaste! Tomorrow morning special Pranayama & Sound Healing session at 6:30 AM at Ram Mandir Chowk, Sangli studio.',
            status: 'Delivered'
          },
          {
            id: 'notif_02',
            recipientName: 'Aarav Sharma',
            recipientMobile: '9876543210',
            mobile: '9876543210',
            channel: 'WhatsApp',
            type: 'enrollment_confirmation',
            message: 'Your registration for Beginner Yoga Foundation batch has been confirmed! Welcome to PranaVeda.',
            status: 'Delivered'
          }
        ];

        for (const notif of sampleNotifs) {
          const docRef = doc(db, 'notification', notif.id);
          await setDoc(docRef, sanitizeData({
            ...notif,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
          report.notification++;
        }
      }
    } catch (e) {
      console.warn('Error seeding notifications:', e);
      report.errors.push(`Notification: ${e.message}`);
    }

    // 7. SEED ENQUIRIES
    try {
      const enqSnap = await getDocs(collection(db, 'enquiries')).catch(() => null);
      if (force || !enqSnap || enqSnap.empty) {
        for (const msg of initialContactMessages) {
          const docRef = doc(db, 'enquiries', msg.id);
          await setDoc(docRef, sanitizeData({
            ...msg,
            course: 'Therapeutic & Meditation Consultation',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }), { merge: true });
          report.enquiries++;
        }
      }
    } catch (e) {
      console.warn('Error seeding enquiries:', e);
      report.errors.push(`Enquiries: ${e.message}`);
    }

    return {
      success: true,
      report,
      message: 'All default collections successfully populated in Firestore!'
    };
  } catch (globalErr) {
    console.error('Fatal error during Firestore auto-seeding:', globalErr);
    return {
      success: false,
      error: globalErr.message,
      report
    };
  }
}
