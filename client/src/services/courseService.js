import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebase';
import { initialCourses } from './mockData';

const COLLECTION_NAME = 'courses';

/**
 * Fetch all courses from Firestore collection "courses"
 */
export async function getCourses({ includeInactive = false } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    let snapshot;
    try {
      const q = query(colRef, orderBy('createdAt', 'desc'));
      snapshot = await getDocs(q);
    } catch {
      // Fallback without orderBy in case index or field is missing
      snapshot = await getDocs(colRef);
    }

    if (!snapshot || snapshot.empty) {
      if (includeInactive) return initialCourses;
      return initialCourses.filter(c => c.isActive !== false && c.status !== 'inactive');
    }

    const courses = snapshot.docs.map(formatDoc);
    // Sort client-side by createdAt descending
    courses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (includeInactive) return courses;
    return courses.filter(c => c.isActive !== false && c.status !== 'inactive');
  } catch (err) {
    console.warn('Notice: Firestore courses fetch error, using initial course catalog fallback:', err);
    if (includeInactive) return initialCourses;
    return initialCourses.filter(c => c.isActive !== false && c.status !== 'inactive');
  }
}

/**
 * Fetch single course by ID or slug
 */
export async function getCourseById(courseId) {
  if (!courseId) return null;

  try {
    // 1. Try direct ID
    const docRef = doc(db, COLLECTION_NAME, courseId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }

    // 2. Query all to find matching slug
    const courses = await getCourses({ includeInactive: true });
    return courses.find(c => c.id === courseId || c.slug === courseId) || null;
  } catch (err) {
    console.warn('Notice: Firestore getCourseById fallback to initial catalog:', err);
    return initialCourses.find(c => c.id === courseId || c.slug === courseId) || null;
  }
}

/**
 * Add a new course to Firestore collection "courses"
 */
export async function addCourse(courseData) {
  const title = (courseData.title || courseData.name || '').trim();
  if (!title) {
    throw new Error('Course title is required.');
  }

  const price = Number(courseData.price || courseData.fee || 0);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const newCourseData = {
    title,
    name: title,
    slug,
    shortDescription: (courseData.shortDescription || '').trim(),
    description: (courseData.description || '').trim(),
    duration: courseData.duration || '4 Weeks',
    timing: courseData.timing || '06:30 AM - 07:30 AM',
    batch: courseData.batch || courseData.timing || 'Morning Sunrise Batch',
    fee: price,
    price,
    originalFee: Number(courseData.originalFee || (price > 0 ? Math.round(price * 1.3) : 0)),
    level: courseData.level || 'Beginner',
    instructor: (courseData.instructor || 'Acharya Ananya Sharma').trim(),
    totalSeats: Number(courseData.totalSeats || 20),
    availableSeats: Number(courseData.availableSeats !== undefined ? courseData.availableSeats : 20),
    image: courseData.image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    benefits: Array.isArray(courseData.benefits)
      ? courseData.benefits
      : (typeof courseData.benefits === 'string' ? courseData.benefits.split('\n').map(s => s.trim()).filter(Boolean) : []),
    requirements: Array.isArray(courseData.requirements)
      ? courseData.requirements
      : (typeof courseData.requirements === 'string' ? courseData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : []),
    status: courseData.status || (courseData.isActive !== false ? 'active' : 'inactive'),
    isActive: courseData.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newCourseData));
    return { id: docRef.id, ...newCourseData, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error adding course to Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing course in Firestore collection "courses"
 */
export async function updateCourse(courseId, courseData) {
  if (!courseId) throw new Error('Course ID is required for update.');

  const title = (courseData.title || courseData.name || '').trim();
  const price = courseData.price !== undefined ? Number(courseData.price) : (courseData.fee !== undefined ? Number(courseData.fee) : undefined);

  const updatePayload = {
    ...courseData,
    updatedAt: serverTimestamp()
  };

  if (title) {
    updatePayload.title = title;
    updatePayload.name = title;
    updatePayload.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (price !== undefined) {
    updatePayload.price = price;
    updatePayload.fee = price;
  }
  if (courseData.benefits !== undefined) {
    updatePayload.benefits = Array.isArray(courseData.benefits)
      ? courseData.benefits
      : (typeof courseData.benefits === 'string' ? courseData.benefits.split('\n').map(s => s.trim()).filter(Boolean) : []);
  }
  if (courseData.requirements !== undefined) {
    updatePayload.requirements = Array.isArray(courseData.requirements)
      ? courseData.requirements
      : (typeof courseData.requirements === 'string' ? courseData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : []);
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, courseId);
    await updateDoc(docRef, sanitizeData(updatePayload));
    return { id: courseId, ...updatePayload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error updating course in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a course from Firestore collection "courses"
 */
export async function deleteCourse(courseId) {
  if (!courseId) throw new Error('Course ID is required for deletion.');

  try {
    const docRef = doc(db, COLLECTION_NAME, courseId);
    await deleteDoc(docRef);
    return { success: true, id: courseId };
  } catch (err) {
    console.error('Error deleting course from Firestore:', err);
    throw err;
  }
}

/**
 * Toggle active status of a course in Firestore
 */
export async function toggleCourseStatus(courseId, currentStatus) {
  if (!courseId) return;

  const nextStatus = (currentStatus === 'active' || currentStatus === true) ? 'inactive' : 'active';
  const isActive = nextStatus === 'active';

  try {
    const docRef = doc(db, COLLECTION_NAME, courseId);
    await updateDoc(docRef, {
      status: nextStatus,
      isActive,
      updatedAt: serverTimestamp()
    });
    return { id: courseId, status: nextStatus, isActive };
  } catch (err) {
    console.error('Error toggling course status in Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for courses collection
 */
export function subscribeToCourses(callback, { includeInactive = false } = {}) {
  const colRef = collection(db, COLLECTION_NAME);

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    let courses = snapshot.docs.map(formatDoc);
    if (courses.length === 0) {
      courses = [...initialCourses];
    }
    // Sort descending by createdAt
    courses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (includeInactive) {
      callback(courses);
    } else {
      callback(courses.filter(c => c.isActive !== false && c.status !== 'inactive'));
    }
  }, (error) => {
    console.warn('Firestore real-time courses subscription notice:', error);
    if (includeInactive) {
      callback(initialCourses);
    } else {
      callback(initialCourses.filter(c => c.isActive !== false && c.status !== 'inactive'));
    }
  });

  return unsubscribe;
}
