import express from 'express';
import { dbService } from '../config/db.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const users = await dbService.getCollection('users');
    const courses = await dbService.getCollection('courses');
    const enrollments = await dbService.getCollection('enrollments');
    const payments = await dbService.getCollection('payments');
    const classes = await dbService.getCollection('classes');
    const contactMessages = await dbService.getCollection('contactMessages');
    const notifications = await dbService.getCollection('notifications');

    const students = users.filter(u => u.role !== 'admin');
    const successfulPayments = payments.filter(p => p.paymentStatus === 'Success' || p.status === 'Successful' || p.payment_status === 'Verified');
    const pendingPayments = payments.filter(p => p.paymentStatus === 'Pending' || p.status === 'Pending' || p.payment_status === 'Pending Verification');
    const failedPayments = payments.filter(p => p.paymentStatus === 'Failed' || p.status === 'Failed' || p.payment_status === 'Rejected');
    const totalRevenue = successfulPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const activeEnrollments = enrollments.filter(e => e.enrollmentStatus === 'Active' || e.enrollmentStatus === 'Confirmed' || e.enrollment_status === 'Confirmed');

    // Upcoming Classes (status !== Cancelled, sorted by date)
    const upcomingClasses = classes
      .filter(c => c.status !== 'Cancelled')
      .sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

    // Popular Courses (by enrollment count)
    const courseCountMap = {};
    enrollments.forEach(e => {
      const cId = e.courseId || e.course_id;
      if (cId) courseCountMap[cId] = (courseCountMap[cId] || 0) + 1;
    });

    const popularCourses = courses
      .map(c => ({
        ...c,
        id: c.id || c.courseId,
        name: c.name || c.title,
        enrollmentCount: courseCountMap[c.id || c.courseId] || 0
      }))
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 5);

    // Recent Registrations (last 6)
    const recentRegistrations = [...students]
      .sort((a, b) => new Date(b.createdAt || b.registrationDate) - new Date(a.createdAt || a.registrationDate))
      .slice(0, 6);

    // Recent Enrollments (last 6)
    const recentEnrollments = [...enrollments]
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
      .slice(0, 6);

    // Recent Payments (last 6)
    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.createdAt || b.transactionDate) - new Date(a.createdAt || a.transactionDate))
      .slice(0, 6);

    res.json({
      success: true,
      data: {
        totalStudents: students.length,
        totalUsers: users.length,
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.isActive !== false && c.status !== 'archived').length,
        totalEnrollments: enrollments.length,
        activeEnrollments: activeEnrollments.length,
        pendingPaymentsCount: pendingPayments.length,
        successfulPaymentsCount: successfulPayments.length,
        failedPaymentsCount: failedPayments.length,
        totalRevenue,
        upcomingClassesCount: upcomingClasses.length,
        upcomingClasses: upcomingClasses.slice(0, 6),
        recentRegistrations,
        recentEnrollments,
        recentPayments,
        popularCourses,
        newInquiriesCount: contactMessages.filter(m => m.status === 'New').length,
        totalNotifications: notifications.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Studio Settings
router.get('/settings', async (req, res) => {
  try {
    const raw = await dbService.getDoc('settings', 'general') || (await dbService.getCollection('settings'))[0];
    res.json({ success: true, data: raw });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const updated = await dbService.setDoc('settings', 'general', req.body);
    res.json({ success: true, message: 'Settings saved to Firestore', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset database to initial seed data (for testing & demo purposes)
router.post('/reset-seed', async (req, res) => {
  try {
    const fresh = await dbService.resetToSeed();
    res.json({ success: true, message: 'Database reset to initial demo state successfully', data: fresh });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
