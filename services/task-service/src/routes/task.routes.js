import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatsByProject,
  getTaskStatsByUser,
  getMyTasks,
  getAllTasks,
  batchGetTasks,
  deleteTasksByProject,
  updateTaskStatus,
  updateTaskProgress,
  updateTaskPriority,
  updateTaskAssignee,
  updateTaskDueDate
} from '../controllers/task.controller.js';

const router = express.Router();

// =====================================================
// 📦 INTERNAL / BATCH ROUTES
// =====================================================

/**
 * Lấy nhiều task theo ID
 * GET /api/tasks/batch?ids=id1,id2
 */
router.get('/batch', batchGetTasks);

/**
 * Lấy toàn bộ task
 * GET /api/tasks/internal/all
 */
router.get('/internal/all', getAllTasks);


// =====================================================
// 👤 GENERAL ROUTES
// =====================================================

/**
 * Tạo công việc mới
 * POST /api/tasks
 */
router.post('/', verifyToken, createTask);

/**
 * Lấy tất cả task được giao cho user hiện tại
 * GET /api/tasks/my
 */
router.get('/my', verifyToken, getMyTasks);

/**
 * Thống kê task của user (trên tất cả dự án)
 * GET /api/tasks/stats
 */
router.get('/stats', verifyToken, getTaskStatsByUser);


// =====================================================
// 📋 PROJECT CONTEXT ROUTES
// =====================================================

/**
 * 🗑️ Xóa tất cả task thuộc một dự án (CASCADE DELETE)
 * ⚠️ PHẢI ĐẶT TRƯỚC /project/:projectId để tránh conflict
 * DELETE /api/tasks/cascade/project/:projectId
 */
router.delete('/cascade/project/:projectId', verifyToken, deleteTasksByProject);

/**
 * Lấy danh sách task của một dự án
 * GET /api/tasks/project/:projectId
 */
router.get('/project/:projectId', verifyToken, getTasksByProject);

/**
 * Thống kê task trong một dự án
 * GET /api/tasks/stats/:projectId
 */
router.get('/stats/:projectId', verifyToken, getTaskStatsByProject);


// =====================================================
// ✨ SPECIFIC UPDATE ROUTES
// =====================================================

/**
 * Cập nhật Trạng thái
 * PATCH /api/tasks/:id/status
 */
router.patch('/:id/status', verifyToken, updateTaskStatus);

/**
 * Cập nhật Tiến độ
 * PATCH /api/tasks/:id/progress
 */
router.patch('/:id/progress', verifyToken, updateTaskProgress);

/**
 * Cập nhật Mức độ ưu tiên
 * PATCH /api/tasks/:id/priority
 */
router.patch('/:id/priority', verifyToken, updateTaskPriority);

/**
 * Chuyển giao công việc
 * PATCH /api/tasks/:id/assign
 */
router.patch('/:id/assign', verifyToken, updateTaskAssignee);

/**
 * Cập nhật Hạn chót
 * PATCH /api/tasks/:id/due-date
 */
router.patch('/:id/due-date', verifyToken, updateTaskDueDate);


// =====================================================
// 🔍 SPECIFIC GENERAL ROUTES (ĐẶT CUỐI CÙNG)
// =====================================================

/**
 * Lấy chi tiết 1 task
 * GET /api/tasks/:id
 */
router.get('/:id', verifyToken, getTaskById);

/**
 * Cập nhật thông tin chung
 * PUT /api/tasks/:id
 */
router.put('/:id', verifyToken, updateTask);

/**
 * Xóa task
 * DELETE /api/tasks/:id
 */
router.delete('/:id', verifyToken, deleteTask);

export default router;