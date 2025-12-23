import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createComment,
  getCommentsByTask,
  deleteComment
} from '../controllers/taskComment.controller.js';

const router = express.Router();

// Prefix: /api/comments (Giả sử bạn mount router này ở path đó)

// 1. Lấy danh sách comment của 1 task
// GET /api/comments/task/:taskId
router.get('/task/:taskId', verifyToken, getCommentsByTask);

// 2. Tạo comment mới
// POST /api/comments/task/:taskId
router.post('/task/:taskId', verifyToken, createComment);

// 3. Xóa comment
// DELETE /api/comments/:id
router.delete('/:id', verifyToken, deleteComment);

export default router;