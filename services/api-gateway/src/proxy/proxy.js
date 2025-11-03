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
