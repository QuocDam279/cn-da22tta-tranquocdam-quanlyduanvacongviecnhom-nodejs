// services/auth-service/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import connectDB from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
connectDB();

// CORS cho API
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware cấu hình chung
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Session cho Passport (tùy chọn - nếu dùng session)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Middleware CORS cho uploads (tái sử dụng)
const setCorsHeaders = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
};

const uploadsStatic = express.static(path.join(process.cwd(), 'uploads'));

// ✅ Serve static files - 2 ROUTES
app.use('/uploads', setCorsHeaders, uploadsStatic);
app.use('/api/uploads', setCorsHeaders, uploadsStatic);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

export default app;