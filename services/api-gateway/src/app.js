// services/api-gateway/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { requestLogger } from './middleware/requestLogger.js';
import { verifyToken } from './middleware/verifyToken.js';
import {
  authProxy,
  userProxy,
  uploadsProxy,
  projectProxy,
  teamProxy,
  taskProxy,
  taskCommentProxy,
  taskAttachmentProxy,
  notificationProxy,
  mailProxy,
  activityProxy
} from './proxy/proxy.js';
import { services } from './config/serviceMap.js';

dotenv.config();
const app = express();

// -----------------------------
// CORS - ĐẶT TRƯỚC TIÊN
// -----------------------------
app.use(cors({
  origin: ["http://localhost:5173", "http://frontend:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -----------------------------
// Uploads - ĐẶT TRƯỚC helmet
// -----------------------------
app.use('/uploads', uploadsProxy);        // Route gốc
app.use('/api/uploads', uploadsProxy);    // ✅ THÊM: Route với /api prefix

// -----------------------------
// Helmet - Cấu hình để không block CORS
// -----------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// -----------------------------
// Các middleware khác
// -----------------------------
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// Giới hạn số request
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// -----------------------------
// Healthcheck & Debug
// -----------------------------
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/_services', (req, res) => res.json({ services }));

// -----------------------------
// Routes
// -----------------------------

// 🔑 Auth (public)
app.use('/api/auth', authProxy);

// 👤 User Profile (cần token)
app.use('/api/user', verifyToken, userProxy);

// 👥 Team
app.use('/api/teams', verifyToken, teamProxy);

// 📁 Project
app.use('/api/projects', verifyToken, projectProxy);

// ✅ Task
app.use('/api/tasks', verifyToken, taskProxy);

// 💬 Task Comment
app.use('/api/task-comments', verifyToken, taskCommentProxy);

// 📎 Task Attachment
app.use('/api/task-attachments', verifyToken, taskAttachmentProxy);

// 🔔 Notification
app.use('/api/notifications', verifyToken, notificationProxy);

// 📧 Mail
app.use('/api/mail', verifyToken, mailProxy);

// 📊 Activity Logs
app.use('/api/activity-logs', verifyToken, activityProxy);

// 404 cho service chưa định nghĩa
app.use('/api/:service', (req, res) => {
  res.status(404).json({ message: 'Service not configured in API Gateway' });
});

// -----------------------------
// Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({
    message: 'Gateway internal error',
    error: err.message
  });
});

export default app;