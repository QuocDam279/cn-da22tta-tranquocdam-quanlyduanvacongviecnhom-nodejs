// service/team-service/routes/team.routes.js
import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addMembers,
  removeMember,
  updateTeam,
  deleteTeam,
  leaveTeam,
  getLeaderTeams
} from '../controllers/team.controller.js';

const router = express.Router();

// ⚡ Route đặc biệt phải đặt trước route có :id
router.get('/leader', verifyToken, getLeaderTeams); // Lấy các team do user làm leader

router.post('/', verifyToken, createTeam); // Tạo team mới
router.get('/', verifyToken, getMyTeams); // Lấy tất cả team của user hiện tại

// ⚠️ Từ đây trở xuống đều có :id
router.post('/:id/members/batch', verifyToken, addMembers);
router.delete('/:id/members/:uid', verifyToken, removeMember); // Xóa thành viên
router.put('/:id', verifyToken, updateTeam); // Cập nhật team
router.delete('/:id', verifyToken, deleteTeam); // Xóa team
router.post('/:id/leave', verifyToken, leaveTeam); // Rời team
router.get('/:id', verifyToken, getTeamById); // Chi tiết team

export default router;
