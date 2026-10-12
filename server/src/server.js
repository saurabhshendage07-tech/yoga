import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import coursesRouter from './routes/courses.js';
import enrollmentsRouter from './routes/enrollments.js';
import paymentsRouter from './routes/payments.js';
import usersRouter from './routes/users.js';
import notificationsRouter from './routes/notifications.js';
import contactRouter from './routes/contact.js';
import statsRouter from './routes/stats.js';
import authRouter from './routes/auth.js';
import footerRouter from './routes/footer.js';
import classesRouter from './routes/classes.js';
import { dbService } from './config/db.js';

import { qrService } from './services/qrService.js';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure uploads folder and default QR code
qrService.ensureDefaultQrCode().catch(err => console.warn('QR init notice:', err.message));

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-email']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads (QR codes, payment screenshots)
app.use('/uploads', express.static(UPLOADS_DIR));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/courses', coursesRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/stats', statsRouter);
app.use('/api/auth', authRouter);
app.use('/api/footer', footerRouter);
app.use('/api/classes', classesRouter);

// Root healthcheck & info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'PranaVeda Yoga & Wellness Backend API',
    database: dbService.isFirebase() ? 'Google Cloud Firebase Firestore' : 'Persistent Local Engine (Ready for Firebase)',
    razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Dev Simulator Mode',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🧘 PranaVeda Yoga Backend Server running on http://localhost:${PORT}`);
  console.log(`🌱 Database Mode: ${dbService.isFirebase() ? 'Google Firebase Firestore' : 'Resilient Local Store'}`);
  console.log(`======================================================\n`);
});
