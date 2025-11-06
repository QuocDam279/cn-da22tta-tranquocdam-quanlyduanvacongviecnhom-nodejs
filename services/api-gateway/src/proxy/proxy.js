//services/api-gateway/src/proxy/proxy.js
import { createProxyMiddleware } from 'http-proxy-middleware';
import { services } from '../config/serviceMap.js';

/**
 * Proxy trung gian cho các service:
 * - /api/auth  → AUTH_SERVICE_URL
 * - /api/teams → TEAM_SERVICE_URL
 */

// Hàm này giúp ghi lại body vào request gửi sang service thật, đảm bảo POST, PUT, PATCH vẫn có dữ liệu.
const forwardBody = (proxyReq, req) => {
  if (!req.body || !Object.keys(req.body).length) return;
  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
};

// ----------------------------
// AUTH PROXY
// ----------------------------
export const authProxy = createProxyMiddleware({
  target: services.auth,            
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/auth': ''                
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[AUTH PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach auth service',
        error: err.message
      });
    }
  }
});

// ----------------------------
// TEAM PROXY
// ----------------------------
export const teamProxy = createProxyMiddleware({
  target: services.team,            
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/teams': ''               
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[TEAM PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach team service',
        error: err.message
      });
    }
  }
});

// ----------------------------
// PROJECT PROXY
// ----------------------------
export const projectProxy = createProxyMiddleware({
  target: services.project,            
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/projects': ''               
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[PROJECT PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach project service',
        error: err.message
      });
    }
  }
});

// ----------------------------
// TASK PROXY
// ---------------------------- 

export const taskProxy = createProxyMiddleware({
  target: services.task,            
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/tasks': ''               
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[TASK PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach task service',
        error: err.message
      });
    }
  }
});

// ----------------------------
// TASK COMMENT PROXY
// ----------------------------
export const taskCommentProxy = createProxyMiddleware({
  target: services.task_comment,       // 💡 trỏ tới URL comment service trong serviceMap
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 10000,
  timeout: 10000,
  pathRewrite: {
    '^/api/task-comments': ''          // bỏ prefix /api/task-comments khi chuyển tiếp
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[TASK COMMENT PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach task comment service',
        error: err.message
      });
    }
  }
});


// ----------------------------
// TASK ATTACHMENT PROXY
// ----------------------------
export const taskAttachmentProxy = createProxyMiddleware({
  target: services.task_attachment,    // 💡 trỏ tới URL attachment service trong serviceMap
  changeOrigin: true,
  selfHandleResponse: false,
  proxyTimeout: 20000,                 // ⏱️ tăng timeout cho upload file
  timeout: 20000,
  pathRewrite: {
    '^/api/task-attachments': ''       // bỏ prefix /api/task-attachments
  },
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    forwardBody(proxyReq, req);
  },
  onError: (err, req, res) => {
    console.error('[TASK ATTACHMENT PROXY ERROR]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        message: 'Cannot reach task attachment service',
        error: err.message
      });
    }
  }
});