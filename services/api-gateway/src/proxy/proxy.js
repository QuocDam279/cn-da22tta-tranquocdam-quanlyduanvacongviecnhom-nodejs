import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/serviceMap.js';

/**
 * 🛠️ CẤU HÌNH CHUNG CHO CÁC PROXY
 * Tối ưu: Bơm thông tin User vào Header để Service con không cần gọi Auth Service nữa.
 */
const commonProxyOptions = {
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  logLevel: 'warn',
  
  onProxyReq: (proxyReq, req, res) => {
    // 1. Nếu đã qua middleware verifyToken, ta bơm thông tin user vào Header
    if (req.user) {
      // Encode URI component để tránh lỗi ký tự đặc biệt
      proxyReq.setHeader('x-user-id', req.user.id || req.user._id);
      proxyReq.setHeader('x-user-email', req.user.email || '');
      proxyReq.setHeader('x-user-role', req.user.role || '');
    }
    // 2. Không forwardBody nữa vì đã tắt express.json()
  },

  onError: (err, req, res) => {
    console.error(`[PROXY ERROR] ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.status(502).json({ message: 'Service unavailable', error: err.message });
    }
  }
};

// ----------------------------
// 1. STANDARD PROXIES
// ----------------------------

export const authProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.auth,
  pathRewrite: { '^/api/auth': '' },
});

export const userProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.user,
  pathRewrite: { '^/api/user': '' },
});

export const teamProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.team,
  pathRewrite: { '^/api/teams': '' },
});

export const projectProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.project,
  pathRewrite: { '^/api/projects': '' },
});

export const taskProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.task,
  pathRewrite: { '^/api/tasks': '' },
});

export const taskCommentProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.task_comment,
  pathRewrite: { '^/api/task-comments': '' },
});

export const notificationProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.notification_service,
  pathRewrite: { '^/api/notifications': '' }
});

export const mailProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.mail_service,
  pathRewrite: { '^/api/mail': '' }
});

export const activityProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.activity,
  pathRewrite: { '^/api/activity-logs': '' }
});

// ----------------------------
// 2. SPECIAL PROXIES (Cần config riêng)
// ----------------------------

// ✅ Uploads: Cần timeout dài và CORS đặc biệt
export const uploadsProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.uploads,
  proxyTimeout: 30000, 
  pathRewrite: { '^/uploads': '/uploads' },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
});

// ✅ Task Attachments: Cần timeout dài để upload file (Đây là cái bạn đang thiếu)
export const taskAttachmentProxy = createProxyMiddleware({
  ...commonProxyOptions,
  target: services.task_attachment,
  proxyTimeout: 30000, // Tăng lên 30s cho chắc
  timeout: 30000,
  pathRewrite: { '^/api/task-attachments': '' },
});