import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, sanitizeData, formatDoc } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'student';

/**
 * Fetch all students/users from Firestore collection "student"
 */
export async function getUsers({ search = '', role = 'all', status = 'all' } = {}) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(colRef);

    let students = snapshot.docs.map(formatDoc);

    // Sort descending by registration date / createdAt
    students.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.mobile?.toLowerCase().includes(q)
      );
    }

    if (role !== 'all') {
      students = students.filter(u => (u.role || 'user').toLowerCase() === role.toLowerCase());
    }

    if (status !== 'all') {
      students = students.filter(u => {
        const uStatus = (u.status || (u.isActive !== false ? 'active' : 'inactive')).toLowerCase();
        return uStatus === status.toLowerCase();
      });
    }

    return students;
  } catch (err) {
    console.error('Error fetching students from Firestore:', err);
    throw err;
  }
}

/**
 * Fetch single student by ID
 */
export async function getUserById(userId) {
  if (!userId) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return formatDoc(docSnap);
    }
    return null;
  } catch (err) {
    console.error('Error fetching student by ID from Firestore:', err);
    throw err;
  }
}

/**
 * Add a new student to Firestore collection "student"
 */
export async function addStudent(studentData) {
  const name = (studentData.name || '').trim();
  const email = (studentData.email || '').trim();
  const phone = (studentData.phone || studentData.mobile || '').trim();

  if (!name || !email) {
    throw new Error('Student name and email are required.');
  }

  const newStudent = {
    name,
    email,
    phone,
    mobile: phone,
    role: studentData.role || 'user',
    status: studentData.status || 'active',
    isActive: studentData.status !== 'inactive',
    activeCourses: Array.isArray(studentData.activeCourses)
      ? studentData.activeCourses
      : (studentData.courseName ? [studentData.courseName] : []),
    batch: studentData.batch || 'Morning Sunrise Batch',
    address: studentData.address || '',
    emergencyContact: studentData.emergencyContact || '',
    notes: studentData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(colRef, sanitizeData(newStudent));
    return { id: docRef.id, ...newStudent, createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error adding student to Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing student in Firestore collection "student"
 */
export async function updateUser(userId, data) {
  if (!userId) throw new Error('Student ID is required for update.');

  const updatePayload = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (data.status) {
    updatePayload.isActive = data.status === 'active';
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, sanitizeData(updatePayload));
    return { id: userId, ...updatePayload, updatedAt: new Date().toISOString() };
  } catch (err) {
    console.error('Error updating student in Firestore:', err);
    throw err;
  }
}

/**
 * Delete a student from Firestore collection "student"
 */
export async function deleteStudent(userId) {
  if (!userId) throw new Error('Student ID is required for deletion.');

  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(docRef);
    return { success: true, id: userId };
  } catch (err) {
    console.error('Error deleting student from Firestore:', err);
    throw err;
  }
}

/**
 * Toggle student active / suspended status
 */
export async function toggleUserStatus(userId, currentStatus) {
  if (!userId) return;

  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const isActive = nextStatus === 'active';

  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, {
      status: nextStatus,
      isActive,
      updatedAt: serverTimestamp()
    });
    return { id: userId, status: nextStatus, isActive };
  } catch (err) {
    console.error('Error toggling student status in Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for students in Firestore collection "student"
 */
export function subscribeToUsers(callback) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      let students = snapshot.docs.map(formatDoc);
      if (students.length === 0) {
        students = initialUsers.filter(u => u.role !== 'admin');
      }
      students.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      callback(students);
    }, (error) => {
      console.warn('Firestore real-time student subscription notice:', error);
      callback(initialUsers.filter(u => u.role !== 'admin'));
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize student listener:', err);
    callback(initialUsers.filter(u => u.role !== 'admin'));
    return () => {};
  }
}

// Aliases for clear semantic naming
export const getStudents = getUsers;
export const getStudentById = getUserById;
export const updateStudent = updateUser;
export const toggleStudentStatus = toggleUserStatus;
export const subscribeToStudents = subscribeToUsers;
export const deleteUser = deleteStudent;
