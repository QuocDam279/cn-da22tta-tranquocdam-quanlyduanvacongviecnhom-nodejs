import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createProject,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects,
  recalcProjectProgress,
  batchGetProjects
} from '../controllers/project.controller.js';

const router = express.Router();

// 📦 Batch endpoint - internal
router.get('/batch', batchGetProjects);

// 🧱 Tạo dự án mới
router.post('/', verifyToken, createProject);

// 📋 Lấy tất cả dự án user tham gia
router.get('/', verifyToken, getMyProjects);

// 📂 Lấy dự án theo team
router.get('/team/:teamId', verifyToken, getProjectsByTeam);

// 🔍 Chi tiết dự án
router.get('/:id', verifyToken, getProjectById);

// ✏️ Cập nhật dự án
router.put('/:id', verifyToken, updateProject);

// 🗑️ Xóa dự án
router.delete('/:id', verifyToken, deleteProject);

// 🔄 Tính lại tiến độ
router.post('/:id/recalc-progress', verifyToken, recalcProjectProgress);

export default router;
