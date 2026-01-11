import mongoose from 'mongoose';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';

/**
 * 🔥 Lấy Team ID từ Project Service thông qua Project ID
 * Trả về null nếu lỗi hoặc không tìm thấy
 */
export const getTeamIdByProject = async (projectId, authHeader) => {
  if (!projectId) return null;
  try {
    const { data: response } = await http.project.get(`/${projectId}`, {
      headers: { Authorization: authHeader }
    });
    // Xử lý các trường hợp response structure khác nhau
    return response?.data?.team_id || response?.team_id;
  } catch (err) {
    console.warn(`[Helper] Không lấy được team_id cho project ${projectId}: ${err.message}`);
    return null;
  }
};

/**
 * Tính toán lại % tiến độ dự án và đẩy sang Project Service
 */
export const triggerRecalcProjectProgress = async (projectId, authHeader) => {
  if (!projectId) return;
  try {
    const stats = await Task.aggregate([
      { $match: { project_id: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: null, avg: { $avg: "$progress" } } }
    ]);
    const newProgress = stats.length > 0 ? Math.round(stats[0].avg) : 0;

    await http.project.post(`/${projectId}/recalc-progress`, 
      { progress: newProgress }, 
      { headers: { Authorization: authHeader } }
    );
  } catch (err) {
    console.warn(`[Helper] Cập nhật tiến độ dự án thất bại:`, err.message);
  }
};

/**
 * Populate thông tin User (Tên, Avatar) vào danh sách Task
 */
export const populateTasksWithUsers = async (tasks, authHeader) => {
  if (!tasks?.length) return [];
  
  const userIds = new Set();
  tasks.forEach(t => {
    if (t.created_by) userIds.add(t.created_by.toString());
    if (t.assigned_to) userIds.add(t.assigned_to.toString());
  });

  if (userIds.size === 0) return tasks;

  try {
    const { data: users } = await http.auth.post('/users/info', 
      { ids: Array.from(userIds) }, 
      { headers: { Authorization: authHeader } }
    );

    return tasks.map(task => {
      const t = task.toObject ? task.toObject() : task; 
      t.created_by = users.find(u => u._id === t.created_by?.toString()) || t.created_by;
      t.assigned_to = users.find(u => u._id === t.assigned_to?.toString()) || null;
      return t;
    });
  } catch (error) { 
    console.warn('[Helper] Populate users failed');
    return tasks; 
  }
};

/**
 * 🆕 Lấy tên người dùng từ request
 * Ưu tiên: Header từ Gateway > req.user.name > Fallback
 * 
 * @param {Object} req - Express request object
 * @returns {string} Tên người dùng
 */
export const getUserNameFromRequest = (req) => {
  // 1. Ưu tiên lấy từ header (Gateway đã encode)
  const headerName = req.headers['x-user-name'];
  if (headerName) {
    try {
      return decodeURIComponent(headerName);
    } catch (e) {
      console.warn('⚠️ Không thể decode x-user-name:', headerName);
      return headerName; // Fallback nếu decode lỗi
    }
  }

  // 2. Fallback: Lấy từ req.user (nếu có)
  if (req.user) {
    return req.user.full_name || req.user.name || req.user.email?.split('@')[0] || 'Người dùng';
  }

  // 3. Fallback cuối cùng
  return 'Người dùng';
};

/**
 * 🆕 Validate Due Date không vượt quá Project End Date
 * 
 * @param {string} project_id - ID của dự án
 * @param {Date|string} due_date - Ngày hạn chót cần validate
 * @param {string} authHeader - Authorization header
 * @returns {Promise<{valid: boolean, message?: string}>}
 */
export const validateTaskDueDate = async (project_id, due_date, authHeader) => {
  if (!due_date) return { valid: true };

  try {
    // Lấy thông tin project
    const { data: response } = await http.project.get(`/${project_id}`, {
      headers: { Authorization: authHeader }
    });

    const project = response?.data || response;
    
    if (!project.end_date) {
      return { valid: true }; // Project không có end_date thì bỏ qua
    }

    const taskDueDate = new Date(due_date);
    const projectEndDate = new Date(project.end_date);

    // Kiểm tra date hợp lệ
    if (isNaN(taskDueDate.getTime()) || isNaN(projectEndDate.getTime())) {
      return { valid: true }; // Nếu date không hợp lệ, bỏ qua validation
    }

    // So sánh ngày
    if (taskDueDate > projectEndDate) {
      return {
        valid: false,
        message: `Hạn chót công việc (${taskDueDate.toLocaleDateString('vi-VN')}) không được vượt quá hạn dự án (${projectEndDate.toLocaleDateString('vi-VN')})`
      };
    }

    return { valid: true };
  } catch (error) {
    console.warn(`[Helper] Validate due date error:`, error.message);
    // Fallback: cho phép tạo/update nếu không lấy được thông tin project
    return { valid: true };
  }
};