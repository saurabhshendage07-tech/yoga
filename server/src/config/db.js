import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { initialCourses, initialInstructors, initialTestimonials, initialClasses } from '../data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../');
const SERVER_DIR = path.resolve(__dirname, '../../');
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'localDb.json');

let isFirebaseConnected = false;
let firestoreDb = null;

/**
 * Enhanced Firebase Admin & Firestore Initialization
 */
function initializeFirebase() {
  if (admin.apps.length > 0) {
    firestoreDb = admin.firestore();
    isFirebaseConnected = true;
    return;
  }

  try {
    // 1. Check if FIREBASE_SERVICE_ACCOUNT_KEY env is set (raw JSON or filepath)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else if (fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
        serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf8'));
      }
      if (serviceAccount) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        firestoreDb = admin.firestore();
        isFirebaseConnected = true;
        console.log('✅ Connected to Google Cloud Firebase Firestore via Service Account Key');
        return;
      }
    }

    // 2. Check for individual env vars
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      firestoreDb = admin.firestore();
      isFirebaseConnected = true;
      console.log('✅ Connected to Google Cloud Firebase Firestore via Environment Variables');
      return;
    }

    // 3. Check for serviceAccountKey.json or firebase-key.json in server/ or project root
    const possibleKeyFiles = [
      path.join(SERVER_DIR, 'serviceAccountKey.json'),
      path.join(SERVER_DIR, 'firebase-adminsdk.json'),
      path.join(SERVER_DIR, 'firebase-key.json'),
      path.join(ROOT_DIR, 'serviceAccountKey.json'),
      path.join(ROOT_DIR, 'firebase-adminsdk.json'),
      path.join(ROOT_DIR, 'firebase-key.json')
    ];

    for (const keyPath of possibleKeyFiles) {
      if (fs.existsSync(keyPath)) {
        const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(keyData) });
        firestoreDb = admin.firestore();
        isFirebaseConnected = true;
        console.log(`✅ Connected to Google Cloud Firebase Firestore using key at: ${keyPath}`);
        return;
      }
    }

    // 4. Default Application Credentials if available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
      firestoreDb = admin.firestore();
      isFirebaseConnected = true;
      console.log('✅ Connected to Google Cloud Firebase Firestore via Application Default Credentials');
      return;
    }
  } catch (err) {
    console.warn('⚠️ Firebase initialization notice:', err.message);
  }

  console.log('ℹ️ Running with persistent Local Firestore-compatible JSON storage engine.');
}

initializeFirebase();

// Local Database Seed Data
function getInitialLocalData() {
  const nowIso = new Date().toISOString();
  return {
    courses: initialCourses.map(c => ({
      ...c,
      courseId: c.id,
      title: c.name,
      price: c.fee,
      schedule: c.timing,
      category: c.level,
      capacity: c.totalSeats,
      status: c.isActive ? 'active' : 'inactive',
      createdAt: c.createdAt || nowIso,
      updatedAt: nowIso
    })),
    instructors: initialInstructors,
    testimonials: initialTestimonials,
    classes: initialClasses,
    users: [
      {
        id: "user-admin-main",
        uid: "user-admin-main",
        email: "admin@gmail.com",
        name: "Studio Administrator",
        phone: "+91 9876543210",
        mobile: "+91 9876543210",
        password: "adminSecret2026",
        role: "admin",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        enrolledCourses: ["course-1", "course-2", "course-4"],
        status: "active",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        updatedAt: nowIso
      },
      {
        id: "user-admin-1",
        uid: "user-admin-1",
        email: "admin@pranavedayoga.com",
        name: "Studio Administrator",
        phone: "+91 9876543210",
        mobile: "+91 9876543210",
        password: "adminSecret2026",
        role: "admin",
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        enrolledCourses: ["course-1", "course-2"],
        status: "active",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: nowIso
      },
      {
        id: "user-demo-1",
        uid: "user-demo-1",
        email: "student@pranavedayoga.com",
        name: "Aarav Sharma",
        phone: "+91 9823456789",
        mobile: "+91 9823456789",
        role: "user",
        profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        enrolledCourses: ["course-1"],
        status: "active",
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: nowIso
      }
    ],
    enrollments: [
      {
        id: "ENR-2026-001",
        enrollmentId: "ENR-2026-001",
        studentId: "user-demo-1",
        userId: "user-demo-1",
        studentName: "Aarav Sharma",
        userName: "Aarav Sharma",
        fullName: "Aarav Sharma",
        email: "student@pranavedayoga.com",
        userEmail: "student@pranavedayoga.com",
        phone: "+91 9823456789",
        mobile: "+91 9823456789",
        userMobile: "+91 9823456789",
        age: 28,
        gender: "Male",
        courseId: "course-1",
        course_id: "course-1",
        courseName: "Beginner Yoga Foundation",
        course_name: "Beginner Yoga Foundation",
        coursePrice: 2499,
        amount: 2499,
        batchTiming: "06:30 AM - 07:30 AM (Mon, Wed, Fri)",
        batch: "06:30 AM - 07:30 AM (Mon, Wed, Fri)",
        startDate: "Next Monday",
        paymentStatus: "Success",
        payment_status: "Verified",
        paymentId: "pay_mock_98234a1b2c",
        orderId: "order_mock_001",
        enrollmentStatus: "Active",
        enrollment_status: "Confirmed",
        utrNumber: "pay_mock_98234a1b2c",
        utr_number: "pay_mock_98234a1b2c",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: nowIso,
        updated_at: nowIso,
        notes: "Looking to relieve neck stiffness"
      }
    ],
    payments: [
      {
        id: "pay_mock_98234a1b2c",
        paymentId: "pay_mock_98234a1b2c",
        orderId: "order_mock_001",
        enrollmentId: "ENR-2026-001",
        studentId: "user-demo-1",
        userId: "user-demo-1",
        studentName: "Aarav Sharma",
        userName: "Aarav Sharma",
        email: "student@pranavedayoga.com",
        userEmail: "student@pranavedayoga.com",
        phone: "+91 9823456789",
        mobile: "+91 9823456789",
        courseId: "course-1",
        course_id: "course-1",
        courseName: "Beginner Yoga Foundation",
        course_name: "Beginner Yoga Foundation",
        amount: 2499,
        currency: "INR",
        paymentMethod: "UPI / Razorpay",
        method: "UPI / Razorpay",
        paymentStatus: "Success",
        status: "Successful",
        transactionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: nowIso,
        updated_at: nowIso
      }
    ],
    notifications: [
      {
        id: "notif-1",
        notificationId: "notif-1",
        userId: "user-demo-1",
        recipientName: "Aarav Sharma",
        recipientMobile: "+91 9823456789",
        title: "Enrollment Confirmation",
        type: "welcome_enrollment",
        channel: "WhatsApp & SMS",
        courseName: "Beginner Yoga Foundation",
        status: "Delivered",
        message: "Welcome to PranaVeda Yoga & Wellness! Your enrollment for Beginner Yoga Foundation has been successfully confirmed. Course: Beginner Yoga Foundation, Batch: 06:30 AM - 07:30 AM.",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    contactMessages: [
      {
        id: "contact-1",
        name: "Kavita Singhania",
        email: "kavita.s@example.com",
        mobile: "+91 9988776655",
        phone: "+91 9988776655",
        subject: "Weekend batches inquiry",
        message: "Do you have special weekend batches for working professionals?",
        status: "Replied",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ],
    settings: {
      studioName: "PranaVeda Yoga & Wellness",
      email: "namaste@pranavedayoga.com",
      phone: "+91 98765 43210",
      whatsappNumber: "+91 98765 43210",
      address: "Plot 42, Lotus Sanctuary, Green Glen Layout, Outer Ring Road, Bangalore, Karnataka - 560103",
      mapUrl: "https://maps.google.com/?q=Bangalore",
      workingHours: "Monday - Saturday: 05:30 AM - 08:30 PM | Sunday: 06:00 AM - 12:00 PM",
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_PranaVeda2026",
      currency: "INR",
      whatsappAutoNotification: true,
      smsAutoNotification: true
    },
    payment_settings: {
      id: "payment_settings_default",
      qr_code_url: "/uploads/default_yoga_qr.png",
      upi_id: "yogaclass@upi",
      payment_instructions: "Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.",
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso
    },
    footer_settings: {
      brandName: "PRANAVEDA",
      tagline: "Yoga & Wellness Sanctuary",
      description: "Rooted in authentic Himalayan Vedic lineages and modern biomechanics. Empowering conscious souls to cultivate mental stillness, profound vitality, and harmonious living.",
      address: "Plot 42, Lotus Sanctuary, Green Glen Layout, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      postalCode: "560103",
      phone: "+91 98765 43210",
      email: "namaste@pranavedayoga.com",
      whatsapp: "+91 98765 43210",
      openingHours: "Mon - Sat: 05:30 AM - 08:30 PM | Sun: 06:00 AM - 12:00 PM (Satsang & Meditation)",
      yogaDetails: "Daily Himalayan Hatha, dynamic Ashtanga/Vinyasa flow, and therapeutic Iyengar alignment batches led by master yogacharyas.",
      wellnessDetails: "Personalized Ayurvedic consultation, sound bowl therapy, chakra balancing, and deep restorative Yoga Nidra.",
      retreatDetails: "Quarterly Himalayan mountain retreats in Rishikesh & Dharamshala for immersive meditation and teacher sadhana.",
      ctaHeading: "Begin Your Journey Within",
      ctaDescription: "Discover balance, movement and mindful living with PranaVeda. Small batches, certified master yogis, and lifelong serenity.",
      ctaButtonText: "Explore Our Programs",
      ctaButtonUrl: "/courses",
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
        whatsapp: "https://wa.me/919876543210"
      },
      quickLinks: [
        { name: "Home", url: "/", enabled: true },
        { name: "About Us & Instructors", url: "/about", enabled: true },
        { name: "All Yoga Courses", url: "/courses", enabled: true },
        { name: "Contact & Sanctuary Visit", url: "/contact", enabled: true },
        { name: "Student Portal / Dashboard", url: "/dashboard", enabled: true }
      ],
      wellnessLinks: [
        { name: "Yoga Classes & Batches", url: "/courses", enabled: true },
        { name: "Meditation & Pranayama", url: "/courses", enabled: true },
        { name: "Wellness Programs", url: "/courses", enabled: true },
        { name: "Himalayan Retreats", url: "/about", enabled: true },
        { name: "Our Sacred Philosophy", url: "/about", enabled: true }
      ],
      copyright: "© 2026 PranaVeda Yoga & Wellness Sanctuary. All rights reserved.",
      privacyPolicyUrl: "/about",
      termsUrl: "/about",
      updated_at: nowIso
    }
  };
}

// Ensure database file exists for fallback/local mode
function ensureLocalDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(getInitialLocalData(), null, 2), 'utf8');
  }
}

ensureLocalDb();

export function readDb() {
  try {
    ensureLocalDb();
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const initial = getInitialLocalData();
    let hasChanges = false;
    for (const key of Object.keys(initial)) {
      if (!parsed[key] || (Array.isArray(initial[key]) && Array.isArray(parsed[key]) && parsed[key].length === 0)) {
        parsed[key] = initial[key];
        hasChanges = true;
      }
    }
    if (hasChanges) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local db:', err);
    return getInitialLocalData();
  }
}

export function writeDb(data) {
  try {
    ensureLocalDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing local db:', err);
    return false;
  }
}

/**
 * Unified Database Service with Direct Firestore & Resilient Local Provider
 */
export const dbService = {
  isFirebase: () => isFirebaseConnected,
  getFirestore: () => firestoreDb,
  getAdmin: () => admin,

  getServerTimestamp() {
    if (isFirebaseConnected && admin) {
      return admin.firestore.FieldValue.serverTimestamp();
    }
    return new Date().toISOString();
  },

  async getCollection(collectionName) {
    if (isFirebaseConnected && firestoreDb) {
      try {
        const snapshot = await firestoreDb.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error(`Firestore getCollection(${collectionName}) error:`, err);
      }
    }
    const data = readDb();
    return data[collectionName] || [];
  },

  async getDoc(collectionName, id) {
    if (isFirebaseConnected && firestoreDb) {
      try {
        const doc = await firestoreDb.collection(collectionName).doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
      } catch (err) {
        console.error(`Firestore getDoc(${collectionName}, ${id}) error:`, err);
      }
    }
    const data = readDb();
    const items = data[collectionName] || [];
    return items.find(item => item.id === id || item.uid === id || item.courseId === id || item.enrollmentId === id || item.paymentId === id || item.classId === id) || null;
  },

  async setDoc(collectionName, id, itemData) {
    const payload = { ...itemData, id };
    if (isFirebaseConnected && firestoreDb) {
      try {
        await firestoreDb.collection(collectionName).doc(id).set(payload, { merge: true });
        return payload;
      } catch (err) {
        console.error(`Firestore setDoc(${collectionName}, ${id}) error:`, err);
      }
    }
    const data = readDb();
    if (!data[collectionName]) data[collectionName] = [];
    const idx = data[collectionName].findIndex(i => i.id === id || i.uid === id || i.enrollmentId === id || i.paymentId === id || i.classId === id);
    if (idx >= 0) {
      data[collectionName][idx] = { ...data[collectionName][idx], ...payload };
    } else {
      data[collectionName].push(payload);
    }
    writeDb(data);
    return payload;
  },

  async addDoc(collectionName, itemData) {
    const id = itemData.id || itemData.uid || itemData.enrollmentId || itemData.paymentId || itemData.classId || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    return this.setDoc(collectionName, id, { ...itemData, id });
  },

  async updateDoc(collectionName, id, updateFields) {
    if (isFirebaseConnected && firestoreDb) {
      try {
        await firestoreDb.collection(collectionName).doc(id).update(updateFields);
        const updated = await this.getDoc(collectionName, id);
        return updated;
      } catch (err) {
        console.error(`Firestore updateDoc(${collectionName}, ${id}) error:`, err);
      }
    }
    const data = readDb();
    if (!data[collectionName]) return null;
    const idx = data[collectionName].findIndex(i => i.id === id || i.uid === id || i.enrollmentId === id || i.paymentId === id || i.classId === id);
    if (idx === -1) return null;
    data[collectionName][idx] = { ...data[collectionName][idx], ...updateFields };
    writeDb(data);
    return data[collectionName][idx];
  },

  async deleteDoc(collectionName, id) {
    if (isFirebaseConnected && firestoreDb) {
      try {
        await firestoreDb.collection(collectionName).doc(id).delete();
        return true;
      } catch (err) {
        console.error(`Firestore deleteDoc(${collectionName}, ${id}) error:`, err);
      }
    }
    const data = readDb();
    if (!data[collectionName]) return false;
    data[collectionName] = data[collectionName].filter(i => i.id !== id && i.uid !== id && i.enrollmentId !== id && i.paymentId !== id && i.classId !== id);
    writeDb(data);
    return true;
  },

  async getPaymentSettings() {
    const defaultSettings = {
      id: "payment_settings_default",
      qr_code_url: "/uploads/default_yoga_qr.png",
      upi_id: "yogaclass@upi",
      payment_instructions: "Scan this QR code using Google Pay, PhonePe, Paytm or any UPI app.",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConnected && firestoreDb) {
      try {
        const doc = await firestoreDb.collection('payment_settings').doc('default').get();
        if (doc.exists) return { id: doc.id, ...doc.data() };
      } catch (err) {
        console.error('Firestore getPaymentSettings error:', err);
      }
    }

    const data = readDb();
    if (data.payment_settings) {
      if (Array.isArray(data.payment_settings)) {
        return data.payment_settings[0] || defaultSettings;
      }
      return data.payment_settings;
    }
    data.payment_settings = defaultSettings;
    writeDb(data);
    return defaultSettings;
  },

  async savePaymentSettings(settingsUpdate) {
    const current = await this.getPaymentSettings();
    const updated = {
      ...current,
      ...settingsUpdate,
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConnected && firestoreDb) {
      try {
        await firestoreDb.collection('payment_settings').doc('default').set(updated, { merge: true });
        return updated;
      } catch (err) {
        console.error('Firestore savePaymentSettings error:', err);
      }
    }

    const data = readDb();
    data.payment_settings = updated;
    writeDb(data);
    return updated;
  },

  async getFooterSettings() {
    const defaultFooter = {
      brandName: "PRANAVEDA",
      tagline: "Yoga & Wellness Sanctuary",
      description: "Rooted in authentic Himalayan Vedic lineages and modern biomechanics. Empowering conscious souls to cultivate mental stillness, profound vitality, and harmonious living.",
      address: "Plot 42, Lotus Sanctuary, Green Glen Layout, Outer Ring Road",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      postalCode: "560103",
      phone: "+91 98765 43210",
      email: "namaste@pranavedayoga.com",
      whatsapp: "+91 98765 43210",
      openingHours: "Mon - Sat: 05:30 AM - 08:30 PM | Sun: 06:00 AM - 12:00 PM (Satsang & Meditation)",
      yogaDetails: "Daily Himalayan Hatha, dynamic Ashtanga/Vinyasa flow, and therapeutic Iyengar alignment batches led by master yogacharyas.",
      wellnessDetails: "Personalized Ayurvedic consultation, sound bowl therapy, chakra balancing, and deep restorative Yoga Nidra.",
      retreatDetails: "Quarterly Himalayan mountain retreats in Rishikesh & Dharamshala for immersive meditation and teacher sadhana.",
      ctaHeading: "Begin Your Journey Within",
      ctaDescription: "Discover balance, movement and mindful living with PranaVeda. Small batches, certified master yogis, and lifelong serenity.",
      ctaButtonText: "Explore Our Programs",
      ctaButtonUrl: "/courses",
      socialLinks: {
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
        whatsapp: "https://wa.me/919876543210"
      },
      quickLinks: [
        { name: "Home", url: "/", enabled: true },
        { name: "About Us & Instructors", url: "/about", enabled: true },
        { name: "All Yoga Courses", url: "/courses", enabled: true },
        { name: "Contact & Sanctuary Visit", url: "/contact", enabled: true },
        { name: "Student Portal / Dashboard", url: "/dashboard", enabled: true }
      ],
      wellnessLinks: [
        { name: "Yoga Classes & Batches", url: "/courses", enabled: true },
        { name: "Meditation & Pranayama", url: "/courses", enabled: true },
        { name: "Wellness Programs", url: "/courses", enabled: true },
        { name: "Himalayan Retreats", url: "/about", enabled: true },
        { name: "Our Sacred Philosophy", url: "/about", enabled: true }
      ],
      copyright: "© 2026 PranaVeda Yoga & Wellness Sanctuary. All rights reserved.",
      privacyPolicyUrl: "/about",
      termsUrl: "/about",
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConnected && firestoreDb) {
      try {
        const doc = await firestoreDb.collection('footer_settings').doc('default').get();
        if (doc.exists) return { id: doc.id, ...defaultFooter, ...doc.data() };
      } catch (err) {
        console.error('Firestore getFooterSettings error:', err);
      }
    }

    const data = readDb();
    if (data.footer_settings) {
      return { ...defaultFooter, ...data.footer_settings };
    }
    data.footer_settings = defaultFooter;
    writeDb(data);
    return defaultFooter;
  },

  async saveFooterSettings(settingsUpdate) {
    const current = await this.getFooterSettings();
    const updated = {
      ...current,
      ...settingsUpdate,
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConnected && firestoreDb) {
      try {
        await firestoreDb.collection('footer_settings').doc('default').set(updated, { merge: true });
        return updated;
      } catch (err) {
        console.error('Firestore saveFooterSettings error:', err);
      }
    }

    const data = readDb();
    data.footer_settings = updated;
    writeDb(data);
    return updated;
  },

  async resetToSeed() {
    const fresh = getInitialLocalData();
    writeDb(fresh);
    return fresh;
  }
};
