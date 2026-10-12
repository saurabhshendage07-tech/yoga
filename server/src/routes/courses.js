import express from 'express';
import { dbService } from '../config/db.js';

const router = express.Router();

// Helper to normalize course model
function normalizeCourse(c) {
  const name = c.name || c.title || 'Yoga Course';
  const fee = Number(c.fee !== undefined ? c.fee : c.price) || 2499;
  const timing = c.timing || c.schedule || 'Morning Sunrise Batch';
  const level = c.level || c.category || 'All Levels';
  const totalSeats = Number(c.totalSeats !== undefined ? c.totalSeats : c.capacity) || 20;
  const status = c.status || (c.isActive !== false ? 'active' : 'inactive');

  return {
    ...c,
    id: c.id || c.courseId,
    courseId: c.courseId || c.id,
    name,
    title: name,
    fee,
    price: fee,
    timing,
    schedule: timing,
    level,
    category: level,
    totalSeats,
    capacity: totalSeats,
    availableSeats: c.availableSeats !== undefined ? Number(c.availableSeats) : totalSeats,
    status,
    isActive: status === 'active' && c.isActive !== false
  };
}

// Get all active courses (for public website) or all courses (if admin query param is passed)
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    let courses = await dbService.getCollection('courses');
    
    courses = courses.map(normalizeCourse);

    if (includeInactive !== 'true') {
      courses = courses.filter(c => c.isActive !== false && c.status !== 'archived' && c.status !== 'inactive');
    }

    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single course by ID or Slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const courses = await dbService.getCollection('courses');
    const course = courses.find(c => c.id === idOrSlug || c.courseId === idOrSlug || c.slug === idOrSlug);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: normalizeCourse(course) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add new course to Firestore
router.post('/', async (req, res) => {
  try {
    const {
      name,
      title,
      shortDescription,
      description,
      duration,
      timing,
      schedule,
      batch,
      fee,
      price,
      originalFee,
      level,
      category,
      instructor,
      instructorTitle,
      totalSeats,
      capacity,
      availableSeats,
      image,
      benefits,
      requirements,
      curriculum,
      status = 'active',
      isActive = true,
      isPopular = false
    } = req.body;

    const courseName = (name || title || '').trim();
    const courseFee = Number(fee !== undefined ? fee : price);
    const courseDuration = duration || '4 Weeks';
    const courseTiming = timing || schedule || '06:30 AM - 07:30 AM (Mon, Wed, Fri)';

    if (!courseName || isNaN(courseFee) || !courseDuration || !courseTiming) {
      return res.status(400).json({
        success: false,
        message: 'Course Title/Name, Fee/Price, Duration and Timing/Schedule are required'
      });
    }

    const slug = courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `course-${Date.now()}`;
    const seats = Number(totalSeats !== undefined ? totalSeats : capacity) || 20;
    const nowIso = new Date().toISOString();

    const newCourse = {
      id,
      courseId: id,
      slug,
      name: courseName,
      title: courseName,
      shortDescription: shortDescription || '',
      description: description || '',
      duration: courseDuration,
      timing: courseTiming,
      schedule: courseTiming,
      batch: batch || courseTiming,
      fee: courseFee,
      price: courseFee,
      originalFee: originalFee ? Number(originalFee) : Math.round(courseFee * 1.3),
      level: level || category || 'All Levels',
      category: category || level || 'All Levels',
      instructor: instructor || 'Lead Acharya',
      instructorTitle: instructorTitle || 'Senior Yoga Master',
      totalSeats: seats,
      capacity: seats,
      availableSeats: availableSeats !== undefined ? Number(availableSeats) : seats,
      image: image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      status: status || (isActive ? 'active' : 'inactive'),
      isActive: Boolean(isActive) && status !== 'archived' && status !== 'inactive',
      isPopular: Boolean(isPopular),
      benefits: Array.isArray(benefits) ? benefits : (typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : []),
      requirements: Array.isArray(requirements) ? requirements : (typeof requirements === 'string' ? requirements.split('\n').filter(Boolean) : []),
      curriculum: Array.isArray(curriculum) ? curriculum : (typeof curriculum === 'string' ? curriculum.split('\n').filter(Boolean) : []),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const created = await dbService.setDoc('courses', id, newCourse);
    res.status(201).json({ success: true, message: 'Course created in Firestore successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Edit course
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('courses', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    if (updates.name && !updates.title) updates.title = updates.name;
    if (updates.title && !updates.name) updates.name = updates.title;
    if (updates.fee !== undefined) updates.fee = Number(updates.fee);
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.fee && !updates.price) updates.price = updates.fee;
    if (updates.price && !updates.fee) updates.fee = updates.price;
    if (updates.originalFee) updates.originalFee = Number(updates.originalFee);
    if (updates.totalSeats) updates.totalSeats = Number(updates.totalSeats);
    if (updates.capacity) updates.capacity = Number(updates.capacity);
    if (updates.availableSeats !== undefined) updates.availableSeats = Number(updates.availableSeats);

    if (updates.name && !updates.slug) {
      updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updated = await dbService.updateDoc('courses', id, updates);
    res.json({ success: true, message: 'Course updated in Firestore successfully', data: normalizeCourse(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Archive course
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('courses', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const updated = await dbService.updateDoc('courses', id, {
      status: 'archived',
      isActive: false,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, message: 'Course archived successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Toggle active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('courses', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const newActive = !existing.isActive;
    const updated = await dbService.updateDoc('courses', id, {
      isActive: newActive,
      status: newActive ? 'active' : 'inactive',
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true, message: `Course ${updated.isActive ? 'activated' : 'deactivated'}`, data: normalizeCourse(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await dbService.getDoc('courses', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    await dbService.deleteDoc('courses', id);
    res.json({ success: true, message: 'Course deleted from Firestore successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
