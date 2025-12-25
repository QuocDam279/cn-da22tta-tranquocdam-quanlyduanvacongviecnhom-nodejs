import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

// Import Queries
import {
  getMyTeams,
  getLeaderTeams,
  getTeamsBatch,
  getTeamById
} from '../controllers/team.query.js';

// Import Commands
import {
  createTeam,
  addMembers,
  removeMember,
  updateTeam,
  deleteTeam,
  leaveTeam
} from '../controllers/team.command.js';

const router = express.Router();

// --- BATCH & LISTS ---
router.get('/batch', getTeamsBatch);
router.get('/leader', verifyToken, getLeaderTeams);
router.get('/', verifyToken, getMyTeams);

// --- MEMBER MANAGEMENT ---
router.post('/:id/members/batch', verifyToken, addMembers);
router.delete('/:id/members/:uid', verifyToken, removeMember);
router.post('/:id/leave', verifyToken, leaveTeam);

// --- CRUD ---
router.post('/', verifyToken, createTeam);
router.get('/:id', verifyToken, getTeamById);
router.put('/:id', verifyToken, updateTeam);
router.delete('/:id', verifyToken, deleteTeam);

export default router;