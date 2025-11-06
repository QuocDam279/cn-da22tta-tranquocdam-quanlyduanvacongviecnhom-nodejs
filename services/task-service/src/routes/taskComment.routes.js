import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createComment,
  getCommentsByTask,
  deleteComment
} from '../controllers/taskComment.controller.js';

const router = express.Router();

router.post('/:taskId', verifyToken, createComment);   
router.get('/:taskId', verifyToken, getCommentsByTask);
router.delete('/:id', verifyToken, deleteComment);

export default router;
