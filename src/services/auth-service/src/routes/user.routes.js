// services/auth-service/src/routes/user.routes.js
import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  changePassword 
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Tất cả routes đều cần xác thực
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), uploadAvatar);
router.put('/password', verifyToken, changePassword);

export default router;