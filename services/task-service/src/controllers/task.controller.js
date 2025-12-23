import mongoose from 'mongoose';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';
import ActivityLogger from '../utils/activityLogger.js';

/**
 * 🔄 Helper: Tự động cập nhật progress của project (Chạy ngầm - Fire & Forget)
 * Không dùng await để tránh block response
 */
const triggerRecalcProjectProgress = (projectId, authHeader) => {
  if (!projectId) return;
  
  http.project.post(
    `/${projectId}/recalc-progress`,
    {},
    { headers: { Authorization: authHeader } }
  ).catch(err => {
    console.warn(`⚠️ [Background] Recalc progress failed for ${projectId}:`, err.message);
  });
};

/**
 * 🧱 Tạo task mới
 * ⚡ Tối ưu: Phản hồi ngay, log & recalc chạy ngầm
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

    // 1️⃣ Lấy project (Cần await để validate)
    const { data: project } = await http.project.get(`/${project_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    if (!project || !project.team_id) {
      return res.status(400).json({ message: 'Không tìm thấy dự án hoặc team_id' });
    }

    // --- Validation Ngày tháng ---
    const taskStartDate = start_date ? new Date(start_date) : null;
    const taskDueDate = due_date ? new Date(due_date) : null;
    const projectStartDate = project.start_date ? new Date(project.start_date) : null;
    const projectEndDate = project.end_date ? new Date(project.end_date) : null;

    if (taskStartDate && taskDueDate && taskStartDate > taskDueDate) 
        return res.status(400).json({ message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    if (taskStartDate && projectStartDate && taskStartDate < projectStartDate) 
        return res.status(400).json({ message: 'Ngày bắt đầu task không được trước ngày bắt đầu dự án' });
    if (taskDueDate && projectEndDate && taskDueDate > projectEndDate) 
        return res.status(400).json({ message: 'Ngày kết thúc task không được sau ngày kết thúc dự án' });

    // 2️⃣ Lấy danh sách thành viên team
    const { data: teamData } = await http.team.get(`/${project.team_id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    
    const memberIds = (teamData.members || []).map(m => (m.user_id._id || m.user_id).toString());

    if (!memberIds.includes(assigned_to)) {
      return res.status(403).json({ message: 'Người được giao không thuộc team của dự án này' });
    }

    // 3️⃣ Tạo task
    const task = await Task.create({
      project_id,
      task_name,
      description,
      assigned_to,
      created_by,
      start_date: taskStartDate || null,
      due_date: taskDueDate || null,
      priority,
      status,
      progress
    });

    // ✅ PHẢN HỒI NGAY LẬP TỨC (Giảm độ trễ)
    res.status(201).json({ message: 'Tạo task thành công', task });

    // ⚡ BACKGROUND JOBS
    ActivityLogger.logTaskCreated(
      created_by, task._id, task_name, req.headers.authorization
    ).catch(console.warn);

    triggerRecalcProjectProgress(project_id, req.headers.authorization);

  } catch (error) {
    console.error('❌ Lỗi createTask:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật task (Chung)
 */
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task không tồn tại' });

    if (task.created_by.toString() !== userId && task.assigned_to?.toString() !== userId) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa task này' });
    }

    Object.assign(task, updates);
    await task.save();

    res.json({ message: 'Cập nhật thành công', task });

    // ⚡ Background
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);

  } catch (error) {
    console.error('❌ Lỗi updateTask:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * 🎯 Cập nhật STATUS
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: id, $or: [{ created_by: userId }, { assigned_to: userId }] },
      { status, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task không tồn tại hoặc không có quyền' });

    res.json({ message: 'Cập nhật status thành công', task });
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * 📊 Cập nhật PROGRESS
 */
export const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: id, $or: [{ created_by: userId }, { assigned_to: userId }] },
      { progress, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task không tồn tại hoặc không có quyền' });

    res.json({ message: 'Cập nhật progress thành công', task });
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * ⚡ Cập nhật PRIORITY
 */
export const updateTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const userId = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: id, $or: [{ created_by: userId }, { assigned_to: userId }] },
      { priority, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task không tồn tại hoặc không có quyền' });

    res.json({ message: 'Cập nhật priority thành công', task });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * 📅 Cập nhật DUE_DATE
 */
export const updateTaskDueDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { due_date } = req.body;
    const userId = req.user.id;

    const task = await Task.findOneAndUpdate(
      { _id: id, $or: [{ created_by: userId }, { assigned_to: userId }] },
      { due_date, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: 'Task không tồn tại hoặc không có quyền' });

    res.json({ message: 'Cập nhật deadline thành công', task });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * 👤 Cập nhật ASSIGNED_TO (Fix Logic Leader)
 */
export const updateTaskAssignee = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body; 
    const currentUserId = req.user.id;

    // 1. Get Task & Project
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task không tồn tại' });

    const { data: project } = await http.project.get(`/${task.project_id}`, {
        headers: { Authorization: req.headers.authorization }
    });
    if (!project || !project.team_id) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // 2. Get Team Members
    const { data: teamData } = await http.team.get(`/${project.team_id}`, {
        headers: { Authorization: req.headers.authorization }
    });

    const members = teamData.members || [];

    // 3. Check Permission (Leader or Creator)
    const leaderMember = members.find(m => m.role === 'leader');
    const leaderId = leaderMember ? (leaderMember.user_id._id || leaderMember.user_id) : null;
    const projectCreatorId = project.created_by?._id || project.created_by;

    const isLeader = leaderId && leaderId.toString() === currentUserId;
    const isCreator = projectCreatorId && projectCreatorId.toString() === currentUserId;

    if (!isLeader && !isCreator) {
        return res.status(403).json({ message: 'Chỉ Leader hoặc người tạo dự án mới được chuyển giao công việc' });
    }

    // 4. Validate New Assignee
    const memberIds = members.map(m => (m.user_id._id || m.user_id).toString());
    if (!memberIds.includes(assigned_to)) {
        return res.status(400).json({ message: 'Người được giao không thuộc thành viên của nhóm này' });
    }

    // 5. Update
    task.assigned_to = assigned_to;
    task.updated_at = Date.now();
    await task.save();

    // ✅ Respond immediately
    res.json({ message: 'Gán task thành công', task });

    // ⚡ Background Log
    ActivityLogger.logTaskUpdate(
        currentUserId, task._id, `đã chuyển công việc "${task.task_name}" cho thành viên khác`, req.headers.authorization
    ).catch(console.warn);

  } catch (error) {
    console.error('❌ Lỗi updateTaskAssignee:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server' });
  }
};

/**
 * 🗑️ Xóa task
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

    if (task.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa công việc này' });

    const { task_name, project_id, _id } = task;

    await task.deleteOne();

    res.json({ message: 'Xóa công việc thành công' });

    // ⚡ Background Jobs
    ActivityLogger.logTaskDeleted(req.user.id, _id, task_name, req.headers.authorization).catch(console.warn);
    triggerRecalcProjectProgress(project_id, req.headers.authorization);

  } catch (error) {
    console.error('❌ Lỗi deleteTask:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server' });
  }
};

// ... Các hàm GET giữ nguyên ...
export const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task.find({ project_id: projectId }).sort({ created_at: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

        const userIds = [task.created_by, task.assigned_to].filter(Boolean);
        let users = [];
        if (userIds.length > 0) {
            const { data } = await http.auth.post('/users/info', { ids: userIds });
            users = data;
        }

        const taskObj = task.toObject();
        taskObj.created_by = users.find(u => u._id === task.created_by.toString()) || null;
        taskObj.assigned_to = users.find(u => u._id === task.assigned_to?.toString()) || null;

        res.json(taskObj);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

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

export const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await Task.find({ assigned_to: userId }).sort({ due_date: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({}, '_id task_name due_date status assigned_to');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

export const batchGetTasks = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });

        const idArray = ids.split(',').filter(id => id.trim());
        if (idArray.length === 0) return res.json({ success: true, data: [] });

        const tasks = await Task.find({ _id: { $in: idArray } }).lean();
        const mapped = tasks.map(task => ({ ...task, name: task.task_name }));

        res.json({ success: true, data: mapped });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
};

export const getTaskStatsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await Task.aggregate([
      { $match: { assigned_to: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    console.error('❌ Lỗi getTaskStatsByUser:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa TẤT CẢ tasks thuộc 1 project (CASCADE DELETE)
 * Được gọi bởi Project Service khi xóa project
 * ⚡ Tối ưu: Phản hồi ngay, log chạy ngầm
 */
export const deleteTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Lấy danh sách tasks trước khi xóa (để log)
    const tasks = await Task.find({ project_id: projectId }).select('_id task_name');
    
    // Xóa tất cả tasks
    const result = await Task.deleteMany({ project_id: projectId });
    
    // ✅ Phản hồi ngay
    res.json({ 
      message: `Đã xóa ${result.deletedCount} công việc thuộc dự án`,
      deletedCount: result.deletedCount 
    });

    // ⚡ Log chạy ngầm (ghi log cho từng task bị xóa)
    if (tasks.length > 0) {
      Promise.all(
        tasks.map(task => 
          ActivityLogger.logTaskDeleted(
            req.user.id,
            task._id,
            task.task_name,
            req.headers.authorization
          ).catch(console.warn)
        )
      ).catch(console.warn);
    }

  } catch (error) {
    console.error('❌ Lỗi deleteTasksByProject:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};