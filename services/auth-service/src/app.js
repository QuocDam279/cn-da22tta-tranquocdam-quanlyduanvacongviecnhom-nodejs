// services/auth-service/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
connectDB();

// Middleware cấu hình chung
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);

export default app;
