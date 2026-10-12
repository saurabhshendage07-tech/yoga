import express from 'express';
import { dbService } from '../config/db.js';
import { fileStorageService } from '../services/fileStorageService.js';
import { qrService } from '../services/qrService.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

function normalizePayment(p) {
  const pStatus = p.paymentStatus || p.payment_status || p.status || 'Pending';
  let cleanStatus = 'Pending';
  if (['success', 'successful', 'verified'].includes(pStatus.toLowerCase())) {
    cleanStatus = 'Success';
  } else if (['failed', 'rejected'].includes(pStatus.toLowerCase())) {
    cleanStatus = 'Failed';
  } else if (['refunded'].includes(pStatus.toLowerCase())) {
    cleanStatus = 'Refunded';
  }

  return {
    ...p,
    id: p.id || p.paymentId,
    paymentId: p.paymentId || p.id,
    orderId: p.orderId || `order_${p.id}`,
    studentId: p.studentId || p.userId || '',
    userId: p.userId || p.studentId || '',
    studentName: p.studentName || p.student_name || p.userName || 'Student',
    userName: p.userName || p.studentName || p.student_name || 'Student',
    email: p.email || p.userEmail || '',
    userEmail: p.userEmail || p.email || '',
    phone: p.phone || p.mobile || p.userMobile || '',
    mobile: p.mobile || p.phone || p.userMobile || '',
    courseId: p.courseId || p.course_id || '',
    courseName: p.courseName || p.course_name || 'Yoga Course',
    amount: Number(p.amount) || 0,
    currency: p.currency || 'INR',
    paymentMethod: p.paymentMethod || p.method || 'UPI QR Code',
    method: p.method || p.paymentMethod || 'UPI QR Code',
    paymentStatus: cleanStatus,
    status: cleanStatus === 'Success' ? 'Successful' : cleanStatus,
    transactionDate: p.transactionDate || p.createdAt || p.created_at,
    createdAt: p.createdAt || p.created_at,
    updatedAt: p.updatedAt || p.updated_at
  };
}

/**
 * Public Endpoint: Get active payment settings for users/students
 */
router.get('/settings', async (req, res) => {
  try {
    const settings = await dbService.getPaymentSettings();
    res.json({
      success: true,
      data: {
        id: settings.id,
        qr_code_url: settings.qr_code_url || '',
        upi_id: settings.upi_id || 'yogaclass@upi',
        payment_instructions: settings.payment_instructions || 'Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.',
        is_active: settings.is_active !== false && Boolean(settings.qr_code_url)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin Endpoint: Get full payment settings (including metadata)
 */
router.get('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await dbService.getPaymentSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin Endpoint: Update payment settings (UPI ID, instructions, is_active, qr_code_url)
 */
router.put('/settings', requireAdmin, async (req, res) => {
  try {
    const { upi_id, payment_instructions, is_active, qr_code_url } = req.body;
    
    const updateData = {};
    if (upi_id !== undefined) updateData.upi_id = upi_id.trim();
    if (payment_instructions !== undefined) updateData.payment_instructions = payment_instructions.trim();
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    if (qr_code_url !== undefined) updateData.qr_code_url = qr_code_url;

    const saved = await dbService.savePaymentSettings(updateData);

    res.json({
      success: true,
      message: 'Payment settings saved to Firestore successfully.',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin Endpoint: Upload / Replace QR code image
 */
router.post('/upload-qr', requireAdmin, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image base64 data is required.' });
    }

    const fileResult = fileStorageService.saveBase64Image(imageBase64, 'qr');
    const current = await dbService.getPaymentSettings();
    if (current.qr_code_url && current.qr_code_url !== fileResult.url) {
      fileStorageService.deleteFileByUrl(current.qr_code_url);
    }

    const updated = await dbService.savePaymentSettings({
      qr_code_url: fileResult.url,
      is_active: true
    });

    res.json({
      success: true,
      message: 'QR code uploaded and updated successfully in Firestore.',
      data: {
        qr_code_url: fileResult.url,
        settings: updated
      }
    });
  } catch (err) {
    console.error('QR upload error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * Admin Endpoint: Remove QR code
 */
router.delete('/remove-qr', requireAdmin, async (req, res) => {
  try {
    const current = await dbService.getPaymentSettings();
    if (current.qr_code_url) {
      fileStorageService.deleteFileByUrl(current.qr_code_url);
    }

    const updated = await dbService.savePaymentSettings({
      qr_code_url: '',
      is_active: false
    });

    res.json({
      success: true,
      message: 'QR code removed successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin Endpoint: Auto-generate QR code for configured UPI ID
 */
router.post('/generate-qr', requireAdmin, async (req, res) => {
  try {
    const { upi_id } = req.body;
    const current = await dbService.getPaymentSettings();
    const targetUpi = (upi_id || current.upi_id || 'yogaclass@upi').trim();

    const qrUrl = await qrService.generateAndSaveQrFile(targetUpi, 'PranaVeda Yoga Sanctuary');

    const updated = await dbService.savePaymentSettings({
      upi_id: targetUpi,
      qr_code_url: qrUrl,
      is_active: true
    });

    res.json({
      success: true,
      message: `QR code generated for UPI ID: ${targetUpi}`,
      data: {
        qr_code_url: qrUrl,
        settings: updated
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Get all payment transactions from Firestore
 */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let payments = await dbService.getCollection('payments');

    payments = payments.map(normalizePayment);

    if (status && status !== 'all') {
      const target = status.toLowerCase();
      payments = payments.filter(p => p.paymentStatus.toLowerCase() === target || p.status.toLowerCase() === target);
    }

    if (search) {
      const q = search.toLowerCase();
      payments = payments.filter(p =>
        p.id?.toLowerCase().includes(q) ||
        p.paymentId?.toLowerCase().includes(q) ||
        p.orderId?.toLowerCase().includes(q) ||
        p.studentName?.toLowerCase().includes(q) ||
        p.userName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.courseName?.toLowerCase().includes(q) ||
        p.utrNumber?.toLowerCase().includes(q)
      );
    }

    payments.sort((a, b) => new Date(b.createdAt || b.transactionDate) - new Date(a.createdAt || a.transactionDate));
    res.json({ success: true, count: payments.length, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Update payment status (e.g. Refunded)
 */
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    const targetStatus = paymentStatus || status;
    const existing = await dbService.getDoc('payments', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const nowIso = new Date().toISOString();
    const updated = await dbService.updateDoc('payments', id, {
      status: targetStatus,
      paymentStatus: targetStatus,
      payment_status: targetStatus,
      updatedAt: nowIso
    });

    // Also update associated enrollment if refunded
    if (targetStatus === 'Refunded' && existing.enrollmentId) {
      await dbService.updateDoc('enrollments', existing.enrollmentId, {
        paymentStatus: 'Refunded',
        payment_status: 'Refunded',
        enrollmentStatus: 'Cancelled',
        enrollment_status: 'Cancelled',
        updatedAt: nowIso
      });
    }

    res.json({ success: true, message: 'Payment status updated in Firestore', data: normalizePayment(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
