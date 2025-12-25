import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { populateTasksWithUsers } from '../services/task.helper.js';

export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project_id: req.params.projectId }).sort({ created_at: -1 });
    const enrichedTasks = await populateTasksWithUsers(tasks, req.headers.authorization);
    res.json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assigned_to: req.user.id }).sort({ due_date: 1 });
    const enrichedTasks = await populateTasksWithUsers(tasks, req.headers.authorization);
    res.json(enrichedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });
    const [enrichedTask] = await populateTasksWithUsers([task], req.headers.authorization);
    res.json(enrichedTask);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getTaskStatsByProject = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { project_id: new mongoose.Types.ObjectId(req.params.projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getTaskStatsByUser = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { assigned_to: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const batchGetTasks = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });
    const tasks = await Task.find({ _id: { $in: ids.split(',').filter(Boolean) } }).lean();
    res.json({ success: true, data: tasks.map(t => ({ ...t, name: t.task_name })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
};