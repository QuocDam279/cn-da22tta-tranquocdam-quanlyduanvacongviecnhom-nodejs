import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import activityRoutes from './routes/activity.routes.js';

dotenv.config();
const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/activity-logs', activityRoutes);

export default app;
