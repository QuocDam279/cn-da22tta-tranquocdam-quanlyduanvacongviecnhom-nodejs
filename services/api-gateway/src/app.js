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
  projectProxy,
  teamProxy,
  taskProxy,
  taskCommentProxy,
  taskAttachmentProxy
} from './proxy/proxy.js';
import { services } from './config/serviceMap.js';

dotenv.config();

const app = express();

// 🛡️ Middleware cơ bản
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// ⚙️ Rate limiter cơ bản
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

// 💓 Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 🧭 Debug route hiển thị danh sách service nội bộ
app.get('/_services', (req, res) => res.json({ services }));

/**
 * 1️⃣ AUTH SERVICE
 * - Các route đăng ký / đăng nhập / user info
 * - Không cần verifyToken tại gateway
 */
app.use('/api/auth', authProxy);

/**
 * 2️⃣ TEAM SERVICE
 * - Bảo vệ bằng verifyToken trước khi proxy
 */
app.use('/api/teams', verifyToken, teamProxy);

/**
 * 3️⃣ PROJECT SERVICE
 */
app.use('/api/projects', verifyToken, projectProxy);

/**
 * 4️⃣ TASK SERVICE (chính)
 */
app.use('/api/tasks', verifyToken, taskProxy);

/**
 * 5️⃣ TASK COMMENT SERVICE
 * - Cho phép tạo/lấy/xóa bình luận task
 */
app.use('/api/task-comments', verifyToken, taskCommentProxy);

/**
 * 6️⃣ TASK ATTACHMENT SERVICE
 * - Cho phép upload/lấy/xóa file đính kèm
 */
app.use('/api/task-attachments', verifyToken, taskAttachmentProxy);

/**
 * 7️⃣ Catch-all cho service chưa định nghĩa
 */
app.use('/api/:service', (req, res) => {
  res.status(404).json({ message: 'Service not configured in API Gateway' });
});

// 🧯 Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({
    message: 'Gateway internal error',
    error: err.message
  });
});

export default app;
