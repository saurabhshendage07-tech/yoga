import express from 'express';
import { dbService } from '../config/db.js';

const router = express.Router();

/**
 * Get all classes (with optional date / courseId / status filters)
 */
router.get('/', async (req, res) => {
  try {
    const { courseId, status, date } = req.query;
    let classes = await dbService.getCollection('classes');

    if (courseId && courseId !== 'all') {
      classes = classes.filter(c => c.courseId === courseId);
    }

    if (status && status !== 'all') {
      classes = classes.filter(c => c.status?.toLowerCase() === status.toLowerCase());
    }

    if (date) {
      classes = classes.filter(c => c.date === date);
    }

    // Sort by date and start time
    classes.sort((a, b) => new Date(`${a.date} ${a.startTime}`) - new Date(`${b.date} ${b.startTime}`));

    res.json({ success: true, count: classes.length, data: classes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get single class by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await dbService.getDoc('classes', id);
    if (!classItem) {
      return res.status(404).json({ success: false, message: 'Class schedule not found' });
    }
    res.json({ success: true, data: classItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Add new class
 */
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      courseName,
      instructor,
      date,
      startTime,
      endTime,
      capacity = 20,
      location = 'Lotus Main Shala (Studio 1)',
      status = 'Scheduled'
    } = req.body;

    if (!courseName || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Course Name, Date, Start Time and End Time are required.'
      });
    }

    const classId = `class-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newClass = {
      id: classId,
      classId,
      courseId: courseId || `course-${Date.now()}`,
      courseName,
      instructor: instructor || 'Lead Acharya',
      date,
      startTime,
      endTime,
      capacity: Number(capacity) || 20,
      enrolledCount: 0,
      location,
      status,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const saved = await dbService.setDoc('classes', classId, newClass);
    res.status(201).json({
      success: true,
      message: 'Class added to schedule successfully',
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Edit class schedule / details
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('classes', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    if (updates.capacity) updates.capacity = Number(updates.capacity);
    if (updates.enrolledCount !== undefined) updates.enrolledCount = Number(updates.enrolledCount);

    const updated = await dbService.updateDoc('classes', id, updates);
    res.json({
      success: true,
      message: 'Class schedule updated successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Cancel class
 */
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('classes', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const updated = await dbService.updateDoc('classes', id, {
      status: 'Cancelled',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Class cancelled successfully',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Admin: Delete class
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('classes', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    await dbService.deleteDoc('classes', id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
