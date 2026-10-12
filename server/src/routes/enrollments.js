import express from 'express';
import { dbService } from '../config/db.js';
import { razorpayService } from '../services/razorpayService.js';
import { notificationService } from '../services/notificationService.js';
import { fileStorageService } from '../services/fileStorageService.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Upload Payment Screenshot
 */
router.post('/upload-screenshot', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Screenshot image data is required.' });
    }

    const fileResult = fileStorageService.saveBase64Image(imageBase64, 'screenshot');
    res.json({
      success: true,
      message: 'Screenshot uploaded successfully',
      data: {
        url: fileResult.url,
        filename: fileResult.filename
      }
    });
  } catch (err) {
    console.error('Screenshot upload error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * Step 1 (UPI QR Flow): Submit Enrollment with UTR & Screenshot
 */
router.post('/submit-upi', async (req, res) => {
  try {
    const {
      fullName,
      student_name,
      studentName,
      email,
      userEmail,
      mobile,
      userMobile,
      phone,
      age,
      gender,
      address,
      emergencyContact,
      emergency_contact,
      notes,
      health_goals,
      courseId,
      course_id,
      preferredBatch,
      batch,
      utrNumber,
      utr_number,
      paymentScreenshotUrl,
      payment_screenshot_url,
      userId,
      studentId
    } = req.body;

    const sName = (fullName || student_name || studentName || '').trim();
    const sMobile = (mobile || userMobile || phone || '').trim();
    const sEmail = (email || userEmail || '').trim().toLowerCase();
    const cId = courseId || course_id;
    const utr = (utrNumber || utr_number || '').trim();
    const screenshot = paymentScreenshotUrl || payment_screenshot_url || '';
    const bTiming = preferredBatch || batch || 'Morning Sunrise Batch';
    const hGoals = notes || health_goals || '';
    const emContact = emergencyContact || emergency_contact || '';
    const sId = userId || studentId || `user-${Date.now()}`;

    // Validation
    if (!sName || !sMobile || !sEmail) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Mobile Number and Email are required.'
      });
    }

    if (!cId) {
      return res.status(400).json({ success: false, message: 'Course selection is required.' });
    }

    if (!utr) {
      return res.status(400).json({
        success: false,
        message: 'Transaction / UTR Number is required for payment verification.'
      });
    }

    // Lookup course in DB to ensure security & accurate price
    const course = await dbService.getDoc('courses', cId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    if (course.isActive === false || course.status === 'inactive' || course.status === 'archived') {
      return res.status(400).json({ success: false, message: 'This course is currently not accepting new enrollments.' });
    }

    // Prevent duplicate active/pending enrollment for the same student & course
    const existingEnrollments = await dbService.getCollection('enrollments');
    const duplicate = existingEnrollments.find(e =>
      ((e.email?.toLowerCase() === sEmail || e.userEmail?.toLowerCase() === sEmail) || (e.mobile === sMobile || e.userMobile === sMobile || e.phone === sMobile)) &&
      (e.courseId === cId || e.course_id === cId) &&
      (e.enrollmentStatus === 'Active' || e.enrollmentStatus === 'Confirmed' || e.enrollmentStatus === 'Pending')
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing ${duplicate.enrollmentStatus} enrollment for ${course.name || course.title}. Please check your student portal.`
      });
    }

    // Always fetch server-side fee from database
    const courseFee = Number(course.fee || course.price);
    const courseName = course.name || course.title;

    const enrollmentId = `ENR-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const paymentId = `pay_upi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    // Create Enrollment Record in Firestore
    const newEnrollment = {
      id: enrollmentId,
      enrollmentId: enrollmentId,
      studentId: sId,
      userId: sId,
      student_name: sName,
      studentName: sName,
      userName: sName,
      fullName: sName,
      email: sEmail,
      userEmail: sEmail,
      mobile: sMobile,
      phone: sMobile,
      userMobile: sMobile,
      age: Number(age) || null,
      gender: gender || 'Female',
      address: address || '',
      emergency_contact: emContact,
      emergencyContact: emContact,
      health_goals: hGoals,
      notes: hGoals,
      course_id: course.id,
      courseId: course.id,
      course_name: courseName,
      courseName: courseName,
      coursePrice: courseFee,
      amount: courseFee,
      batch: bTiming,
      batchTiming: bTiming,
      startDate: 'Next Monday',
      utr_number: utr,
      utrNumber: utr,
      payment_screenshot_url: screenshot,
      paymentScreenshotUrl: screenshot,
      paymentId: utr, // store UTR as payment reference
      orderId: `order_upi_${Date.now()}`,
      payment_status: 'Pending Verification',
      paymentStatus: 'Pending',
      enrollment_status: 'Pending',
      enrollmentStatus: 'Pending',
      rejection_reason: null,
      verified_by: null,
      verified_at: null,
      created_at: nowIso,
      updated_at: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await dbService.setDoc('enrollments', enrollmentId, newEnrollment);

    // Save linked payment record in Firestore
    const paymentRecord = {
      id: paymentId,
      paymentId: paymentId,
      orderId: newEnrollment.orderId,
      enrollmentId: enrollmentId,
      studentId: sId,
      userId: sId,
      userName: sName,
      studentName: sName,
      student_name: sName,
      email: sEmail,
      userEmail: sEmail,
      phone: sMobile,
      mobile: sMobile,
      userMobile: sMobile,
      courseId: course.id,
      course_id: course.id,
      courseName: courseName,
      course_name: courseName,
      amount: courseFee,
      currency: 'INR',
      paymentMethod: 'UPI QR Code',
      method: 'UPI QR Code',
      utrNumber: utr,
      utr_number: utr,
      payment_screenshot_url: screenshot,
      paymentScreenshotUrl: screenshot,
      status: 'Pending',
      payment_status: 'Pending Verification',
      paymentStatus: 'Pending',
      transactionDate: nowIso,
      createdAt: nowIso,
      created_at: nowIso,
      updatedAt: nowIso,
      updated_at: nowIso
    };

    await dbService.setDoc('payments', paymentId, paymentRecord);

    // Ensure user exists in Users collection in Firestore
    const users = await dbService.getCollection('users');
    let existingUser = users.find(u => u.email?.toLowerCase() === sEmail);
    if (!existingUser) {
      existingUser = {
        id: sId,
        uid: sId,
        name: sName,
        email: sEmail,
        phone: sMobile,
        mobile: sMobile,
        role: 'user',
        profileImage: '',
        enrolledCourses: [],
        status: 'active',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      await dbService.setDoc('users', existingUser.id, existingUser);
    }

    res.status(201).json({
      success: true,
      message: 'Enrollment Submitted Successfully! Your payment is pending verification. Our team will verify your payment and confirm your seat shortly.',
      data: {
        enrollment: newEnrollment,
        payment: paymentRecord
      }
    });
  } catch (err) {
    console.error('Enrollment submission error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Verify Payment & Activate Enrollment
 */
router.post('/:id/verify-payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminIdentifier = req.headers['x-user-email'] || req.adminUser?.email || 'Admin';

    const enrollment = await dbService.getDoc('enrollments', id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found.' });
    }

    const nowIso = new Date().toISOString();
    const updates = {
      payment_status: 'Success',
      paymentStatus: 'Success',
      enrollment_status: 'Active',
      enrollmentStatus: 'Active',
      verified_by: adminIdentifier,
      verified_at: nowIso,
      updated_at: nowIso,
      updatedAt: nowIso
    };

    const updated = await dbService.updateDoc('enrollments', id, updates);

    // Update matching payment record in Firestore
    const payments = await dbService.getCollection('payments');
    const payment = payments.find(p => p.enrollmentId === id || p.utrNumber === enrollment.utr_number || p.id === enrollment.paymentId);
    if (payment) {
      await dbService.updateDoc('payments', payment.id, {
        status: 'Successful',
        paymentStatus: 'Success',
        payment_status: 'Success',
        verified_by: adminIdentifier,
        verified_at: nowIso,
        updatedAt: nowIso
      });
    }

    // Update User enrolledCourses in Firestore
    const studentUser = await dbService.getDoc('users', enrollment.studentId || enrollment.userId);
    const courseId = enrollment.courseId || enrollment.course_id;
    if (studentUser && courseId) {
      const currentCourses = Array.isArray(studentUser.enrolledCourses) ? studentUser.enrolledCourses : [];
      if (!currentCourses.includes(courseId)) {
        await dbService.updateDoc('users', studentUser.id, {
          enrolledCourses: [...currentCourses, courseId],
          updatedAt: nowIso
        });
      }
    }

    // Deduct course available seat if applicable
    if (courseId) {
      const course = await dbService.getDoc('courses', courseId);
      if (course && course.availableSeats > 0) {
        await dbService.updateDoc('courses', course.id, {
          availableSeats: Math.max(0, course.availableSeats - 1),
          updatedAt: nowIso
        });
      }
    }

    // Send Welcome WhatsApp / SMS Notification if enabled
    try {
      await notificationService.sendWelcomeEnrollmentNotification({
        userName: enrollment.student_name || enrollment.userName || enrollment.studentName,
        mobile: enrollment.mobile || enrollment.userMobile || enrollment.phone,
        email: enrollment.email || enrollment.userEmail,
        courseName: enrollment.course_name || enrollment.courseName,
        batchTiming: enrollment.batch || enrollment.batchTiming,
        startDate: enrollment.startDate || 'Next Monday',
        paymentId: enrollment.utr_number || enrollment.paymentId || 'UPI Verified',
        amount: enrollment.amount || enrollment.coursePrice
      });
    } catch (notifErr) {
      console.warn('Welcome notification notice:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully and student enrollment is now Active!',
      data: updated
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Reject Payment
 */
router.post('/:id/reject-payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const adminIdentifier = req.headers['x-user-email'] || req.adminUser?.email || 'Admin';

    const enrollment = await dbService.getDoc('enrollments', id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found.' });
    }

    const reason = (rejection_reason || 'Payment could not be verified.').trim();
    const nowIso = new Date().toISOString();

    const updates = {
      payment_status: 'Failed',
      paymentStatus: 'Failed',
      enrollment_status: 'Cancelled',
      enrollmentStatus: 'Cancelled',
      rejection_reason: reason,
      verified_by: adminIdentifier,
      verified_at: nowIso,
      updated_at: nowIso,
      updatedAt: nowIso
    };

    const updated = await dbService.updateDoc('enrollments', id, updates);

    // Update matching payment record if exists
    const payments = await dbService.getCollection('payments');
    const payment = payments.find(p => p.enrollmentId === id || p.utrNumber === enrollment.utr_number || p.id === enrollment.paymentId);
    if (payment) {
      await dbService.updateDoc('payments', payment.id, {
        status: 'Failed',
        paymentStatus: 'Failed',
        payment_status: 'Failed',
        rejection_reason: reason,
        verified_by: adminIdentifier,
        verified_at: nowIso,
        updatedAt: nowIso
      });
    }

    res.json({
      success: true,
      message: 'Payment marked as Failed and enrollment Cancelled.',
      data: updated
    });
  } catch (err) {
    console.error('Reject payment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get User's Enrollments (User Dashboard)
 */
router.get('/my-enrollments', async (req, res) => {
  try {
    const { userId, studentId, email, mobile } = req.query;
    const all = await dbService.getCollection('enrollments');
    const filtered = all.filter(e => {
      if (userId && (e.userId === userId || e.studentId === userId)) return true;
      if (studentId && (e.studentId === studentId || e.userId === studentId)) return true;
      if (email && (e.userEmail?.toLowerCase() === email.toLowerCase() || e.email?.toLowerCase() === email.toLowerCase())) return true;
      if (mobile && (e.userMobile === mobile || e.mobile === mobile || e.phone === mobile)) return true;
      return false;
    });

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Get All Enrollments with Search & Filters
 */
router.get('/', async (req, res) => {
  try {
    const { search, courseId, paymentStatus, enrollmentStatus } = req.query;
    let enrollments = await dbService.getCollection('enrollments');

    if (search) {
      const q = search.toLowerCase();
      enrollments = enrollments.filter(e =>
        (e.userName && e.userName.toLowerCase().includes(q)) ||
        (e.student_name && e.student_name.toLowerCase().includes(q)) ||
        (e.studentName && e.studentName.toLowerCase().includes(q)) ||
        (e.userEmail && e.userEmail.toLowerCase().includes(q)) ||
        (e.email && e.email.toLowerCase().includes(q)) ||
        (e.userMobile && e.userMobile.includes(q)) ||
        (e.mobile && e.mobile.includes(q)) ||
        (e.phone && e.phone.includes(q)) ||
        (e.utr_number && e.utr_number.toLowerCase().includes(q)) ||
        (e.utrNumber && e.utrNumber.toLowerCase().includes(q)) ||
        (e.id && e.id.toLowerCase().includes(q)) ||
        (e.enrollmentId && e.enrollmentId.toLowerCase().includes(q))
      );
    }

    if (courseId && courseId !== 'all') {
      enrollments = enrollments.filter(e => (e.courseId === courseId || e.course_id === courseId));
    }

    if (paymentStatus && paymentStatus !== 'all') {
      enrollments = enrollments.filter(e => {
        const ps = (e.paymentStatus || e.payment_status || '').toLowerCase();
        const target = paymentStatus.toLowerCase();
        if (target === 'success' || target === 'successful' || target === 'verified') {
          return ps === 'success' || ps === 'successful' || ps === 'verified';
        }
        if (target === 'pending' || target === 'pending verification') {
          return ps === 'pending' || ps === 'pending verification';
        }
        return ps === target;
      });
    }

    if (enrollmentStatus && enrollmentStatus !== 'all') {
      enrollments = enrollments.filter(e => {
        const es = (e.enrollmentStatus || e.enrollment_status || '').toLowerCase();
        const target = enrollmentStatus.toLowerCase();
        if (target === 'active' || target === 'confirmed') {
          return es === 'active' || es === 'confirmed';
        }
        return es === target;
      });
    }

    // Sort newest first
    enrollments.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get single enrollment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await dbService.getDoc('enrollments', id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    }
    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update Enrollment Status (Pending, Active, Completed, Cancelled)
 */
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { enrollmentStatus, paymentStatus } = req.body;
    const existing = await dbService.getDoc('enrollments', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const updates = {
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (enrollmentStatus) {
      updates.enrollmentStatus = enrollmentStatus;
      updates.enrollment_status = enrollmentStatus;
    }
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      updates.payment_status = paymentStatus;
    }

    const updated = await dbService.updateDoc('enrollments', id, updates);
    res.json({ success: true, message: 'Enrollment status updated in Firestore', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Export Enrollments to CSV
 */
router.get('/export-csv', async (req, res) => {
  try {
    const enrollments = await dbService.getCollection('enrollments');
    const headers = [
      'Enrollment ID',
      'Student Name',
      'Email',
      'Mobile',
      'Age',
      'Gender',
      'Address',
      'Emergency Contact',
      'Course Name',
      'Batch Timing',
      'Fee Amount',
      'UTR Number',
      'Payment Screenshot',
      'Payment Status',
      'Enrollment Status',
      'Rejection Reason',
      'Verified By',
      'Verified At',
      'Enrollment Date'
    ];

    const rows = enrollments.map(e => [
      `"${e.enrollmentId || e.id}"`,
      `"${e.studentName || e.student_name || e.userName || ''}"`,
      `"${e.email || e.userEmail || ''}"`,
      `"${e.phone || e.mobile || e.userMobile || ''}"`,
      e.age || '',
      `"${e.gender || ''}"`,
      `"${(e.address || '').replace(/"/g, '""')}"`,
      `"${(e.emergencyContact || e.emergency_contact || '').replace(/"/g, '""')}"`,
      `"${e.courseName || e.course_name || ''}"`,
      `"${e.batchTiming || e.batch || ''}"`,
      e.coursePrice || e.amount || 0,
      `"${e.utrNumber || e.utr_number || e.paymentId || ''}"`,
      `"${e.paymentScreenshotUrl || e.payment_screenshot_url || ''}"`,
      `"${e.paymentStatus || e.payment_status || 'Pending'}"`,
      `"${e.enrollmentStatus || e.enrollment_status || 'Pending'}"`,
      `"${e.rejection_reason || ''}"`,
      `"${e.verified_by || ''}"`,
      `"${e.verified_at ? new Date(e.verified_at).toLocaleString() : ''}"`,
      `"${new Date(e.createdAt || e.created_at).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=PranaVeda_Enrollments_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Razorpay verification flow linked to Firestore
router.post('/create-order', async (req, res) => {
  try {
    const { courseId, fullName, email, mobile, preferredBatch } = req.body;
    const course = await dbService.getDoc('courses', courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const receiptId = `ENR-${Date.now().toString().slice(-6)}`;
    const orderData = await razorpayService.createOrder({
      amount: course.fee || course.price,
      currency: 'INR',
      receipt: receiptId
    });
    res.json({
      success: true,
      data: {
        ...orderData,
        course: { id: course.id, name: course.name || course.title, fee: course.fee || course.price, batch: preferredBatch }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, enrollmentData } = req.body;
    const cId = enrollmentData.courseId;
    const course = await dbService.getDoc('courses', cId);
    const fee = course ? (course.fee || course.price) : 2499;
    const enrollmentId = `ENR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();
    
    const newEnrollment = {
      id: enrollmentId,
      enrollmentId: enrollmentId,
      studentId: enrollmentData.userId || `user-${Date.now()}`,
      userId: enrollmentData.userId || `user-${Date.now()}`,
      studentName: enrollmentData.fullName,
      student_name: enrollmentData.fullName,
      userName: enrollmentData.fullName,
      email: enrollmentData.email,
      userEmail: enrollmentData.email,
      phone: enrollmentData.mobile,
      mobile: enrollmentData.mobile,
      userMobile: enrollmentData.mobile,
      course_id: cId,
      courseId: cId,
      course_name: course ? (course.name || course.title) : enrollmentData.courseName,
      courseName: course ? (course.name || course.title) : enrollmentData.courseName,
      coursePrice: fee,
      amount: fee,
      batch: enrollmentData.preferredBatch,
      batchTiming: enrollmentData.preferredBatch,
      utr_number: razorpay_payment_id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      payment_status: 'Success',
      paymentStatus: 'Success',
      enrollment_status: 'Active',
      enrollmentStatus: 'Active',
      created_at: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    await dbService.setDoc('enrollments', enrollmentId, newEnrollment);

    // Save payment record
    const paymentRecord = {
      id: razorpay_payment_id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      enrollmentId: enrollmentId,
      studentId: newEnrollment.studentId,
      studentName: enrollmentData.fullName,
      email: enrollmentData.email,
      phone: enrollmentData.mobile,
      courseId: cId,
      courseName: newEnrollment.courseName,
      amount: fee,
      currency: 'INR',
      paymentMethod: 'Razorpay',
      paymentStatus: 'Success',
      status: 'Successful',
      transactionDate: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    await dbService.setDoc('payments', razorpay_payment_id, paymentRecord);

    // Update User enrolledCourses in Firestore
    const user = await dbService.getDoc('users', newEnrollment.studentId);
    if (user) {
      const currentCourses = Array.isArray(user.enrolledCourses) ? user.enrolledCourses : [];
      if (!currentCourses.includes(cId)) {
        await dbService.updateDoc('users', user.id, {
          enrolledCourses: [...currentCourses, cId],
          updatedAt: nowIso
        });
      }
    }

    res.json({ success: true, message: 'Enrollment confirmed and saved to Firestore', data: { enrollment: newEnrollment } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
