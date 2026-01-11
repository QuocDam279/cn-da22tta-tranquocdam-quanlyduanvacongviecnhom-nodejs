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

/**
 * 🔓 Lấy tất cả tasks (Internal use - cho Cron Job)
 * Endpoint này chỉ truy cập được từ Docker internal network
 */
export const getAllTasksInternal = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .select('_id task_name due_date status assigned_to created_by project_id')
      .lean();
    
    res.json(tasks);
  } catch (error) {
    console.error('❌ Lỗi getAllTasksInternal:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// =================================================================
// 🆕 Validate Tasks Deadline (được gọi từ Project Service)
// =================================================================
export const validateTasksDeadline = async (req, res) => {
  try {
    const { id: project_id } = req.params;
    const { end_date } = req.query;

    console.log(`🔍 [Validate Deadline] project_id=${project_id}, new_end_date=${end_date}`);

    if (!end_date) {
      return res.status(400).json({ 
        message: 'Missing end_date parameter',
        hasConflicts: false 
      });
    }

    const newEndDate = new Date(end_date);
    
    // Validate date format
    if (isNaN(newEndDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format',
        hasConflicts: false 
      });
    }

    // 🔍 Tìm các task có due_date vượt quá end_date mới
    const tasksExceeding = await Task.find({
      project_id,
      due_date: { $gt: newEndDate }
    }).select('task_name due_date').lean();

    if (tasksExceeding.length === 0) {
      console.log('✅ [Validate Deadline] No conflicts found');
      return res.json({ 
        hasConflicts: false,
        message: 'No conflicting tasks'
      });
    }

    // Format task names cho message
    const taskNames = tasksExceeding
      .map(t => `"${t.task_name}" (hạn: ${new Date(t.due_date).toLocaleDateString('vi-VN')})`)
      .join(', ');

    console.log(`❌ [Validate Deadline] Found ${tasksExceeding.length} conflicting tasks`);

    res.json({
      hasConflicts: true,
      count: tasksExceeding.length,
      message: `Có ${tasksExceeding.length} công việc vượt quá thời hạn mới: ${taskNames}`,
      tasks: tasksExceeding.map(t => ({
        task_name: t.task_name,
        due_date: t.due_date
      }))
    });
  } catch (error) {
    console.error('⚠️ [Validate Deadline] Error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      hasConflicts: false // Để Project Service có thể xử lý fallback
    });
  }
};