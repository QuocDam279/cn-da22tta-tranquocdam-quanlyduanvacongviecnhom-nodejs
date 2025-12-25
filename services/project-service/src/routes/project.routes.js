import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

// Import Queries
import {
  getProjectsByTeam,
  getProjectById,
  getMyProjects,
  batchGetProjects
} from '../controllers/project.query.js';

// Import Commands
import {
  createProject,
  updateProject,
  deleteProject,
  recalcProjectProgress,
  deleteProjectsByTeam
} from '../controllers/project.command.js';

const router = express.Router();

// --- BATCH & LISTS ---
router.get('/batch', batchGetProjects);
router.get('/', verifyToken, getMyProjects);
router.get('/team/:teamId', verifyToken, getProjectsByTeam);

// --- CASCADE DELETE (Called by Team Service) ---
router.delete('/cascade/team/:teamId', verifyToken, deleteProjectsByTeam);

// --- SPECIFIC UPDATES (Called by Task Service) ---
router.post('/:id/recalc-progress', verifyToken, recalcProjectProgress);

// --- CORE CRUD ---
router.post('/', verifyToken, createProject);
router.get('/:id', verifyToken, getProjectById);
router.put('/:id', verifyToken, updateProject);
router.delete('/:id', verifyToken, deleteProject);

export default router;