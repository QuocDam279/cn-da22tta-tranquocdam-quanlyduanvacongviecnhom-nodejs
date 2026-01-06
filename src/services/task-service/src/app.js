// services/task-service/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import taskRoutes from './routes/task.routes.js';
import taskCommentRoutes from './routes/taskComment.routes.js';   // 🆕 import thêm
import taskAttachmentRoutes from './routes/taskAttachment.routes.js'; // 🆕 import thêm

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 📂 Mount routes
app.use('/api/tasks', taskRoutes);
app.use('/api/task-comments', taskCommentRoutes);       // 🆕 Bình luận
app.use('/api/task-attachments', taskAttachmentRoutes); // 🆕 File đính kèm
app.use('/uploads', express.static('uploads'));

export default app;
