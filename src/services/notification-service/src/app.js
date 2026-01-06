// services/notification-service/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import notificationRoutes from './routes/notification.routes.js';


dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 📂 Mount routes
app.use('/api/notifications', notificationRoutes);

export default app;
