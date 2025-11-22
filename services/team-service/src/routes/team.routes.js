//service/team-service/routes/team.routes.js
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
  leaveTeam
} from '../controllers/team.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTeam);// Tạo team mới
router.get('/', verifyToken, getMyTeams);// Lấy tất cả team của user hiện tại
router.get('/:id', verifyToken, getTeamById);// Lấy chi tiết 1 team
router.post('/:id/members/batch', verifyToken, addMembers);
router.delete('/:id/members/:uid', verifyToken, removeMember);// Xóa thành viên khỏi team
router.put('/:id', verifyToken, updateTeam);// Cập nhật thông tin team
router.delete('/:id', verifyToken, deleteTeam);// Xóa team
router.post('/:id/leave', verifyToken, leaveTeam);// Rời team

export default router;
