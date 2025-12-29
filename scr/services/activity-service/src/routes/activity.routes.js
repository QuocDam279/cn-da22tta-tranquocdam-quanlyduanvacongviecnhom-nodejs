import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createActivityLog,
  getUserActivities,
  getTeamActivities,
} from '../controllers/activity.controller.js';

const router = express.Router();

// --- PRIVATE (Nội bộ microservices gọi) ---
router.post('/', createActivityLog); 

// --- PUBLIC (Cho Frontend gọi) ---
// 🔒 BẮT BUỘC phải verify token
router.get('/team/:team_id', verifyToken, getTeamActivities);
router.get('/user/:user_id', verifyToken, getUserActivities);

export default router;