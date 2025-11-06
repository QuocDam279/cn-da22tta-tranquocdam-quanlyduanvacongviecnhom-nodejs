import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  uploadAttachmentsMultiple,
  getAttachmentsByTask,
  deleteAttachment
} from '../controllers/taskAttachment.controller.js';

const router = express.Router();

// ⚙️ Cấu hình Multer (upload local, tự tạo folder nếu chưa có)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join('uploads', 'tasks'); // path chuẩn
    fs.mkdirSync(dest, { recursive: true });    // tạo folder nếu chưa có
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB mỗi file
});

/**
 * 📤 Upload file cho task
 * POST /api/task-attachments/:taskId
 */
router.post('/:taskId', verifyToken, upload.array('files', 3), uploadAttachmentsMultiple);

/**
 * 📄 Lấy danh sách file của 1 task
 * GET /api/task-attachments/:taskId
 */
router.get('/:taskId', verifyToken, getAttachmentsByTask);

/**
 * ❌ Xóa file đính kèm
 * DELETE /api/task-attachments/:id
 */
router.delete('/:id', verifyToken, deleteAttachment);

export default router;
