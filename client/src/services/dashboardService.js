import {
  collection,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getCourses } from './courseService';
import { getUsers } from './userService';
import { getPayments } from './paymentService';
import { getAttendance } from './attendanceService';
import { getEnquiries } from './enquiryService';
import { getBookings } from './bookingService';

/**
 * Fetch dynamic statistics aggregated from Firestore collections
 */
export async function getDashboardStats() {
  try {
    const [courses, students, payments, attendance, enquiries, bookings] = await Promise.all([
      getCourses({ includeInactive: true }).catch(() => []),
      getUsers().catch(() => []),
      getPayments().catch(() => []),
      getAttendance().catch(() => []),
      getEnquiries().catch(() => []),
      getBookings().catch(() => [])
    ]);

    // Active Courses
    const activeCourses = courses.filter(c => c.status === 'active' || c.isActive !== false).length;

    // Payments calculations from "payment" collection
    const successfulPayments = payments.filter(p => {
      const s = (p.paymentStatus || p.status || '').toLowerCase();
      return s === 'success' || s === 'verified' || s === 'successful' || s === 'paid';
    });

    const pendingPayments = payments.filter(p => {
      const s = (p.paymentStatus || p.status || '').toLowerCase();
      return s.includes('pending');
    });

    const failedPayments = payments.filter(p => {
      const s = (p.paymentStatus || p.status || '').toLowerCase();
      return s === 'failed' || s === 'rejected' || s === 'refunded' || s === 'cancelled';
    });

    const totalRevenue = successfulPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Attendance stats
    const totalAttendance = attendance.length;
    const presentAttendance = attendance.filter(a => (a.status || '').toLowerCase() === 'present').length;
    const attendancePercentage = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

    return {
      // 1. Total Students
      totalStudents: students.length,
      totalUsers: students.length,

      // 2. Total Courses
      totalCourses: courses.length,
      activeCourses,

      // 3. Total Payments
      totalPayments: payments.length,

      // 4. Pending Payments
      pendingPaymentsCount: pendingPayments.length,
      successfulPaymentsCount: successfulPayments.length,
      failedPaymentsCount: failedPayments.length,
      totalRevenue,

      // 5. Total Enquiries
      totalEnquiries: enquiries.length,
      unreadEnquiriesCount: enquiries.filter(e => (e.status || '').toLowerCase() === 'unread').length,

      // 6. Attendance statistics
      totalAttendance,
      presentAttendance,
      attendancePercentage,

      // Enrollments / Bookings
      totalEnrollments: bookings.length,
      activeEnrollments: bookings.filter(b => {
        const s = (b.enrollmentStatus || b.bookingStatus || '').toLowerCase();
        return s === 'confirmed' || s === 'active' || s === 'verified';
      }).length,

      // Lists for recent panels
      recentEnrollments: bookings.slice(0, 6),
      recentPayments: payments.slice(0, 6),
      recentRegistrations: students.slice(0, 6),
      upcomingClasses: courses.slice(0, 4).map(c => ({
        id: c.id,
        courseName: c.name || c.title,
        instructor: c.instructor || 'Acharya Ananya Sharma',
        location: 'Main Sanctuary Hall',
        date: c.batch || 'Mon, Wed, Fri',
        startTime: c.timing || '06:30 AM',
        enrolledCount: bookings.filter(b => (b.courseId === c.id || b.courseName === c.name) && (b.enrollmentStatus === 'Confirmed' || b.bookingStatus === 'confirmed')).length,
        capacity: c.totalSeats || 20
      }))
    };
  } catch (err) {
    console.error('Error computing dashboard statistics from Firestore:', err);
    throw new Error('Failed to compute live studio analytics from Firestore.');
  }
}

/**
 * Subscribe to real-time updates across Firestore collections
 */
export function subscribeToDashboardMetrics(callback) {
  let isSubscribed = true;

  const refresh = () => {
    if (!isSubscribed) return;
    getDashboardStats()
      .then(stats => {
        if (isSubscribed) callback(stats);
      })
      .catch((e) => console.warn('Dashboard stats refresh notice:', e));
  };

  // Initial fetch
  refresh();

  const unsubs = [];
  const collectionsToWatch = ['courses', 'student', 'payment', 'enquiries', 'attendance'];

  collectionsToWatch.forEach(colName => {
    try {
      if (db) {
        const unsub = onSnapshot(collection(db, colName), refresh, (err) => {
          console.warn(`Firestore collection ${colName} listener notice:`, err);
        });
        unsubs.push(unsub);
      }
    } catch (err) {
      console.warn(`Could not attach listener to ${colName}:`, err);
    }
  });

  return () => {
    isSubscribed = false;
    unsubs.forEach(unsub => {
      try {
        if (typeof unsub === 'function') unsub();
      } catch (e) {}
    });
  };
}
