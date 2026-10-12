import express from 'express';
import { dbService } from '../config/db.js';

const router = express.Router();

/**
 * Admin: Get all users with enriched statistics (enrolled courses count, latest enrollment & total spend)
 */
router.get('/', async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let users = await dbService.getCollection('users');
    const enrollments = await dbService.getCollection('enrollments');
    const payments = await dbService.getCollection('payments');

    if (role && role !== 'all') {
      users = users.filter(u => u.role === role);
    }

    if (status && status !== 'all') {
      users = users.filter(u => (u.status || (u.isActive ? 'active' : 'inactive')) === status);
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.mobile?.includes(q) ||
        u.uid?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q)
      );
    }

    // Enrich with enrollment details, payment status and spend from Firestore
    const enriched = users.map(user => {
      const userEnrollments = enrollments.filter(e =>
        e.userId === user.id || e.studentId === user.id || e.userId === user.uid ||
        e.userEmail?.toLowerCase() === user.email?.toLowerCase() ||
        e.email?.toLowerCase() === user.email?.toLowerCase()
      );

      const userPayments = payments.filter(p =>
        (p.userId === user.id || p.studentId === user.id || p.userEmail?.toLowerCase() === user.email?.toLowerCase()) &&
        (p.status === 'Successful' || p.paymentStatus === 'Success' || p.payment_status === 'Verified')
      );

      const totalSpent = userPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const latestEnrollment = userEnrollments.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))[0];

      return {
        ...user,
        uid: user.uid || user.id,
        phone: user.phone || user.mobile || '',
        status: user.status || (user.isActive !== false ? 'active' : 'inactive'),
        registrationDate: user.createdAt,
        accountStatus: user.isActive !== false ? 'Active' : 'Inactive',
        enrollmentsCount: userEnrollments.length,
        totalSpent,
        enrolledCourses: user.enrolledCourses || userEnrollments.map(e => e.courseName || e.course_name),
        activeCourses: userEnrollments.filter(e => e.enrollmentStatus === 'Active' || e.enrollmentStatus === 'Confirmed' || e.enrollment_status === 'Confirmed').map(e => e.courseName || e.course_name),
        latestEnrollment: latestEnrollment ? {
          courseName: latestEnrollment.courseName || latestEnrollment.course_name,
          enrollmentStatus: latestEnrollment.enrollmentStatus || latestEnrollment.enrollment_status,
          paymentStatus: latestEnrollment.paymentStatus || latestEnrollment.payment_status,
          date: latestEnrollment.createdAt || latestEnrollment.created_at
        } : null
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get single user by ID / UID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbService.getDoc('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Update user profile in Firestore
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('users', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    if (updates.mobile && !updates.phone) updates.phone = updates.mobile;
    if (updates.phone && !updates.mobile) updates.mobile = updates.phone;

    const updated = await dbService.updateDoc('users', id, updates);
    res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Toggle user activation status
 */
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbService.getDoc('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newActiveState = user.isActive === false ? true : false;
    const updated = await dbService.updateDoc('users', id, {
      isActive: newActiveState,
      status: newActiveState ? 'active' : 'inactive',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete user
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbService.getDoc('users', id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await dbService.deleteDoc('users', id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
