import express from 'express';
import { dbService } from '../config/db.js';

const router = express.Router();

// Public: Submit contact enquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const newMessage = {
      id: `contact-${Date.now()}`,
      name,
      email,
      mobile: mobile || '',
      subject: subject || 'General Yoga Inquiry',
      message,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    const saved = await dbService.addDoc('contactMessages', newMessage);
    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our wellness counselor will contact you soon.',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all contact messages
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let messages = await dbService.getCollection('contactMessages');

    if (status && status !== 'all') {
      messages = messages.filter(m => m.status?.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      messages = messages.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.mobile?.includes(q) ||
        m.subject?.toLowerCase().includes(q)
      );
    }

    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update message status (e.g. Replied, Read)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await dbService.updateDoc('contactMessages', id, { status });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete contact message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteDoc('contactMessages', id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
