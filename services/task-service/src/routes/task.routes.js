import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';

// Import Query Controllers (Read)
import {
  getTasksByProject,
  getTaskById,
  getMyTasks,
  getTaskStatsByProject,
  getTaskStatsByUser,
  batchGetTasks
} from '../controllers/task.query.js';

// Import Command Controllers (Write)
import {
  createTask,
  updateTask,
  deleteTask,
  deleteTasksByProject,
  updateTaskStatus,
  updateTaskProgress,
  updateTaskPriority,
  updateTaskAssignee,
  updateTaskDueDate
} from '../controllers/task.command.js';

const router = express.Router();

// --- BATCH & STATS ---
router.get('/batch', batchGetTasks);
router.get('/stats', verifyToken, getTaskStatsByUser);
router.get('/stats/:projectId', verifyToken, getTaskStatsByProject);

// --- GENERAL READ ---
router.get('/my', verifyToken, getMyTasks);
router.get('/project/:projectId', verifyToken, getTasksByProject);
router.get('/:id', verifyToken, getTaskById);

// --- PROJECT CASCADING ---
router.delete('/cascade/project/:projectId', verifyToken, deleteTasksByProject);

// --- SPECIFIC UPDATES ---
router.patch('/:id/status', verifyToken, updateTaskStatus);
router.patch('/:id/progress', verifyToken, updateTaskProgress);
router.patch('/:id/priority', verifyToken, updateTaskPriority);
router.patch('/:id/assign', verifyToken, updateTaskAssignee);
router.patch('/:id/due-date', verifyToken, updateTaskDueDate);

// --- CORE CRUD ---
router.post('/', verifyToken, createTask);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

export default router;