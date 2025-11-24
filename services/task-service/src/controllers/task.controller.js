// src/controllers/task.controller.js
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';

/**
 * 🧱 Tạo task mới
 */
export const createTask = async (req, res) => {
  try {
    const {
      project_id,
      task_name,
      description,
      assigned_to,
      start_date,
      due_date,
      priority,
      status = "To Do",
      progress = 0
    } = req.body;

    const created_by = req.user.id;

    // Kiểm tra ngày hợp lệ
    if (start_date && due_date && new Date(start_date) > new Date(due_date)) {
      return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    // 1️⃣ Lấy project để biết team_id
    const { data: project } = await http.project.get(`/${project_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    if (!project || !project.team_id)
      return res.status(400).json({ message: 'Không tìm thấy dự án hoặc team_id' });

    // 2️⃣ Lấy danh sách thành viên team
    const { data: teamData } = await http.team.get(`/${project.team_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const memberIds = teamData.members.map(m => m.user_id.toString());

    // 3️⃣ Kiểm tra xem assigned_to có thuộc team không
    if (!memberIds.includes(assigned_to))
      return res.status(403).json({ message: 'Người được giao không thuộc team của dự án này' });

    // 4️⃣ Tạo task
    const task = await Task.create({
      project_id,
      task_name,
      description,
      assigned_to,
      created_by,
      start_date: start_date || null,
      due_date: due_date || null,
      priority,
      status,
      progress
    });

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        '/',
        {
          user_id: created_by,
          action: `Tạo công việc mới: ${task_name}`,
          related_id: task._id,
          related_type: 'task'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logError) {
      console.warn('⚠ Không thể ghi activity log:', logError.message);
    }

    res.status(201).json({ message: 'Tạo task thành công', task });
  } catch (error) {
    console.error('❌ Lỗi createTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy tất cả task theo project
 */
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project_id: projectId }).sort({ created_at: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết 1 task
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

    // 🔹 Gọi Auth service để lấy thông tin user (created_by + assigned_to)
    const userIds = [task.created_by, task.assigned_to].filter(Boolean);

    let users = [];
    if (userIds.length > 0) {
      const { data } = await http.auth.post('/users/info', { ids: userIds });
      users = data;
    }

    // Gắn thông tin user vào task trả về
    const taskObj = task.toObject();
    taskObj.created_by = users.find(u => u._id === task.created_by.toString()) || null;
    taskObj.assigned_to = users.find(u => u._id === task.assigned_to?.toString()) || null;

    res.json(taskObj);
  } catch (error) {
    console.error('❌ Lỗi getTaskById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật task
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      task_name,
      description,
      start_date,
      due_date,
      status,
      priority,
      progress,
      assigned_to
    } = req.body;

    const task = await Task.findById(id);
    if (!task)
      return res.status(404).json({ message: 'Không tìm thấy công việc' });

    // Chỉ người tạo hoặc người được giao mới được sửa
    if (
      task.created_by.toString() !== req.user.id &&
      task.assigned_to?.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: 'Bạn không có quyền sửa công việc này' });
    }

    // Kiểm tra assigned_to mới
    if (assigned_to && assigned_to !== task.assigned_to?.toString()) {
      const { data: project } = await http.project.get(`/${task.project_id}`, {
        headers: { Authorization: req.headers.authorization }
      });

      if (!project || !project.team?._id) {
        return res
          .status(400)
          .json({ message: 'Không thể xác định team của dự án này' });
      }

      const { data: teamData } = await http.team.get(
        `/${project.team._id}`,
        { headers: { Authorization: req.headers.authorization } }
      );

      const memberIds = teamData.members.map(m => m.user?._id?.toString());
      if (!memberIds.includes(assigned_to)) {
        return res.status(403).json({
          message: 'Người được giao không thuộc team của dự án này'
        });
      }

      task.assigned_to = assigned_to;
    }

    // ✅ Cập nhật các trường khác
    if (task_name) task.task_name = task_name;
    if (description) task.description = description;
    if (start_date) task.start_date = start_date;
    if (due_date) task.due_date = due_date;
    if (status) task.status = status;
    if (priority) task.priority = priority;

    const oldProgress = task.progress;
    if (progress !== undefined) task.progress = progress;

    task.updated_at = new Date();
    await task.save();

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Cập nhật công việc: ${task.task_name} (${status || 'No status change'})`,
          related_id: task._id,
          related_type: 'task'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logError) {
      console.warn('⚠ Không thể ghi activity log:', logError.message);
    }

    // 🔄 Nếu progress thay đổi → gọi Project Service cập nhật progress
    if (progress !== undefined && progress !== oldProgress) {
      try {
        await http.project.post(
          `/${task.project_id}/recalc-progress`,
          { progress: undefined }, // Project Service sẽ tự tính trung bình Task, nên body có thể rỗng
          { headers: { Authorization: req.headers.authorization } }
        );
      } catch (err) {
        console.warn('⚠ Không thể cập nhật tiến độ project:', err.message);
      }
    }

    res.json({ message: 'Cập nhật công việc thành công', task });
  } catch (error) {
    console.error('❌ Lỗi updateTask:', error.message);
    res
      .status(500)
      .json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa task
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

    // Chỉ người tạo mới được xóa
    if (task.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa công việc này' });

    // Ghi log hoạt động trước khi xóa
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Xóa công việc: ${task.task_name}`,
          related_id: task._id,
          related_type: 'task'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logError) {
      console.warn('⚠ Không thể ghi activity log khi xóa task:', logError.message);
    }

    const projectId = task.project_id;

    // Xóa task
    await task.deleteOne();

    // 🔄 Gọi Project Service để tính lại progress sau khi xóa task
    try {
      await http.project.post(
        `/${projectId}/recalc-progress`,
        { progress: undefined },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.warn('⚠ Không thể cập nhật tiến độ project sau khi xóa task:', err.message);
    }

    res.json({ message: 'Xóa công việc thành công' });
  } catch (error) {
    console.error('❌ Lỗi deleteTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📊 Thống kê trạng thái công việc trong 1 project
 */
export const getTaskStatsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const stats = await Task.aggregate([
      { $match: { project_id: new mongoose.Types.ObjectId(projectId) } },
      { $group: { _id: '$status', count: { $sum: 1 }, avgProgress: { $avg: '$progress' } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 👤 Lấy tất cả task của user hiện tại
 */
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ assigned_to: userId }).sort({ due_date: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('❌ Lỗi getMyTasks:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🧠 Dành cho service nội bộ (Notification, Cron, ...)
 * Lấy tất cả task trong hệ thống (chỉ các trường cần thiết)
 */
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({}, '_id task_name due_date status assigned_to');
    res.json(tasks);
  } catch (error) {
    console.error('❌ Lỗi getAllTasks:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};