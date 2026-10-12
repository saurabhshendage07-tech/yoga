import express from 'express';
import { dbService } from '../config/db.js';
import { notificationService } from '../services/notificationService.js';

const router = express.Router();

// Admin: Get notification history
router.get('/', async (req, res) => {
  try {
    const { channel, status, search } = req.query;
    let notifs = await dbService.getCollection('notifications');

    if (channel && channel !== 'all') {
      notifs = notifs.filter(n => n.channel?.toLowerCase().includes(channel.toLowerCase()));
    }

    if (status && status !== 'all') {
      notifs = notifs.filter(n => n.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      notifs = notifs.filter(n =>
        n.recipientName?.toLowerCase().includes(q) ||
        n.recipientMobile?.includes(q) ||
        n.message?.toLowerCase().includes(q)
      );
    }

    notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Send custom message (WhatsApp / SMS / Both)
router.post('/send-custom', async (req, res) => {
  try {
    const { recipientName, mobile, channel = 'WhatsApp', message } = req.body;
    if (!mobile || !message) {
      return res.status(400).json({ success: false, message: 'Mobile number and message are required' });
    }

    const result = await notificationService.sendCustomMessage({
      recipientName,
      mobile,
      channel,
      message
    });

    res.json({
      success: true,
      message: `${channel} message dispatched successfully!`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Resend/retry notification
router.post('/:id/resend', async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await dbService.getDoc('notifications', id);
    if (!notif) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    let dispatchRes;
    if (notif.channel?.includes('WhatsApp')) {
      dispatchRes = await notificationService.sendWhatsAppMessage({
        to: notif.recipientMobile,
        message: notif.message
      });
    } else {
      dispatchRes = await notificationService.sendSMSMessage({
        to: notif.recipientMobile,
        message: notif.message
      });
    }

    const updated = await dbService.updateDoc('notifications', id, {
      status: dispatchRes.status,
      lastRetriedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Notification re-dispatched', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
