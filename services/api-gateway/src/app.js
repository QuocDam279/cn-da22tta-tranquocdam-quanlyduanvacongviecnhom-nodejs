//services/api-gateway/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { requestLogger } from './middleware/requestLogger.js';
import { verifyToken } from './middleware/verifyToken.js';
import { authProxy, projectProxy, teamProxy } from './proxy/proxy.js';
import { services } from './config/serviceMap.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// rate limiter cơ bản
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});
app.use(limiter);

// Healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Info route (useful debugging)
app.get('/_services', (req, res) => res.json({ services }));

/**
 * 1) Routes to AUTH service
 * - register / login / users/info đều chuyển tiếp
 * - auth endpoints không cần verify token ở gateway (auth-service tự handle)
 */
app.use('/api/auth', authProxy);

/**
 * 2) Routes to TEAM service
 * team-service expects Authorization header and its own verifyToken middleware will check it,
 * but to fail fast we also verify token here for protected routes.
 *
 * We'll verify token for all /api/teams routes before proxying.
 */
app.use('/api/teams', verifyToken, teamProxy);

app.use('/api/projects', verifyToken, projectProxy);

/**
 * 3) Catch-all for unknown proxied endpoints (optionally forward)
 */
app.use('/api/:service', (req, res) => {
  res.status(404).json({ message: 'Service not configured in API Gateway' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[GATEWAY ERROR]', err);
  res.status(500).json({ message: 'Gateway internal error', error: err.message });
});

export default app;
