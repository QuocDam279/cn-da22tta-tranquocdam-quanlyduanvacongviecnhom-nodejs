import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { requestLogger } from './middleware/requestLogger.js';
import { verifyToken } from './middleware/verifyToken.js';
// Import các proxy đã tối ưu...
import {
  authProxy, userProxy, uploadsProxy, projectProxy,
  teamProxy, taskProxy, taskCommentProxy, taskAttachmentProxy,
  notificationProxy, mailProxy, activityProxy
} from './proxy/proxy.js';

dotenv.config();
const app = express();

// 1. CORS
app.use(cors({
  origin: ["http://localhost:5173", "http://frontend:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// 3. Logger & Rate Limit
app.use(morgan('dev'));
app.use(requestLogger);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// 4. Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Uploads
app.use('/uploads', uploadsProxy);
app.use('/api/uploads', uploadsProxy);

// Public Routes
app.use('/api/auth', authProxy);

// Protected Routes (Có verifyToken)
// verifyToken sẽ giải mã JWT và gán vào req.user. 
// Sau đó proxy sẽ đọc req.user và gán vào Header 'x-user-id'.
app.use('/api/user', verifyToken, userProxy);
app.use('/api/teams', verifyToken, teamProxy);
app.use('/api/projects', verifyToken, projectProxy);
app.use('/api/tasks', verifyToken, taskProxy);
app.use('/api/task-comments', verifyToken, taskCommentProxy);
app.use('/api/task-attachments', verifyToken, taskAttachmentProxy);
app.use('/api/notifications', verifyToken, notificationProxy);
app.use('/api/mail', verifyToken, mailProxy);
app.use('/api/activity-logs', verifyToken, activityProxy);

// 404 & Error Handler (Giữ nguyên)
app.use((req, res) => res.status(404).json({ message: 'Service not found' }));
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({ message: 'Gateway error' });
});

export default app;