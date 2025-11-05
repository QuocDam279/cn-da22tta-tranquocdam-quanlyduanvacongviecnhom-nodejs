// services/project-service/src/routes/project.routes.js
import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createProject,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  deleteProject,
  getMyProjects
} from '../controllers/project.controller.js';

const router = express.Router();

// 🧱 Tạo dự án mới
router.post('/', verifyToken, createProject);

// 📋 Lấy tất cả dự án của user (qua các team user tham gia)
router.get('/', verifyToken, getMyProjects);

// 📂 Lấy danh sách dự án của một team cụ thể
router.get('/team/:teamId', verifyToken, getProjectsByTeam);

// 🔍 Lấy chi tiết 1 dự án
router.get('/:id', verifyToken, getProjectById);

// ✏️ Cập nhật dự án
router.put('/:id', verifyToken, updateProject);

// 🗑️ Xóa dự án
router.delete('/:id', verifyToken, deleteProject);

export default router;
