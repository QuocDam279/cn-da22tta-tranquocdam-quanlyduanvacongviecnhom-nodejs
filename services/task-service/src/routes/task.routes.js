import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatsByProject,
  getMyTasks,
  getAllTasks
} from '../controllers/task.controller.js';

const router = express.Router();

/**
 * 🧱 Tạo công việc mới
 * POST /api/tasks
 */
router.post('/', verifyToken, createTask);

/**
 * 📋 Lấy tất cả task theo project
 * GET /api/tasks/project/:projectId
 */
router.get('/project/:projectId', verifyToken, getTasksByProject);

/**
 * 📊 Thống kê task theo project
 * GET /api/tasks/stats/:projectId
 */
router.get('/stats/:projectId', verifyToken, getTaskStatsByProject);

/**
 * 📊 Thống kê task của user (tất cả project)
 * GET /api/tasks/stats
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Task.aggregate([
      { $match: { assigned_to: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('❌ Lỗi getTaskStats:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

/**
 * 👤 Lấy tất cả task của user hiện tại
 * GET /api/tasks/my
 */
router.get('/my', verifyToken, getMyTasks);

/**
 * 🧠 Route nội bộ cho Notification Service
 * GET /api/tasks/internal/all
 */
router.get('/internal/all', getAllTasks);

/**
 * 🔍 Lấy chi tiết 1 task
 * GET /api/tasks/:id
 * ✅ Đặt cuối cùng để không bị nhầm với các route cố định
 */
router.get('/:id', verifyToken, getTaskById);

/**
 * ✏️ Cập nhật task
 * PUT /api/tasks/:id
 */
router.put('/:id', verifyToken, updateTask);

/**
 * 🗑️ Xóa task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', verifyToken, deleteTask);

export default router;
