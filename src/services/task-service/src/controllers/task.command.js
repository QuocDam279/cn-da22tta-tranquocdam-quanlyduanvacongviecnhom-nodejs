import Task from '../models/Task.js';
import http from '../utils/httpClient.js';
import ActivityLogger from '../utils/activityLogger.js';
import { 
  triggerRecalcProjectProgress, 
  getTeamIdByProject, 
  getUserNameFromRequest 
} from '../services/task.helper.js';

// 4. Create Task
export const createTask = async (req, res) => {
  try {
    const { project_id, task_name, assigned_to, ...details } = req.body;
    const authHeader = req.headers.authorization;
    const userName = getUserNameFromRequest(req);

    // 🔥 Lấy team_id từ Project
    const teamId = await getTeamIdByProject(project_id, authHeader);
    if (!teamId) return res.status(400).json({ message: 'Dự án không hợp lệ hoặc không thuộc nhóm nào' });

    // ✅ Tạo Task (assigned_to có thể undefined)
    const task = await Task.create({ 
      project_id, 
      team_id: teamId,
      task_name, 
      ...(assigned_to && { assigned_to }), // 🔥 Chỉ thêm assigned_to nếu có
      created_by: req.user.id, 
      ...details 
    });

    res.status(201).json({ message: 'Tạo công việc thành công', task });

    // ✅ LOG
    ActivityLogger.logTaskCreated(req.user, task, teamId, authHeader);
    triggerRecalcProjectProgress(project_id, authHeader);

    // ✅ CHỈ GỬI THÔNG BÁO NẾU CÓ NGƯỜI ĐƯỢC GIAO + KHÁC NGƯỜI TẠO
    if (assigned_to && assigned_to !== req.user.id) {
       http.notification.post('/', {
         user_id: assigned_to, 
         reference_id: task._id, 
         reference_model: 'Task',
         type: 'ASSIGN', 
         message: `${userName} đã giao việc "${task_name}" cho bạn`,
         should_send_mail: true
       }, { headers: { Authorization: authHeader } }).catch(() => {});
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 5. Update Status
export const updateTaskStatus = async (req, res) => {
  try {
    let { status, progress } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

    const oldStatus = task.status;
    const authHeader = req.headers.authorization;
    const teamId = await getTeamIdByProject(task.project_id, authHeader);
    const userName = getUserNameFromRequest(req);

    // ✅ Logic tự động set progress khi chuyển sang "In Progress"
    if (status === 'In Progress' && progress === undefined) {
      if (oldStatus === 'Done') {
        progress = 99;
      } else if (oldStatus === 'To Do') {
        progress = 1;
      }
    }

    // ✅ Validation
    if (status === 'In Progress' && (progress === 0 || progress === 100)) {
      return res.status(400).json({ 
        message: 'Công việc đang thực hiện phải có tiến độ từ 1-99%' 
      });
    }

    task.status = status;
    if (progress !== undefined) task.progress = progress;
    await task.save();

    res.json({ message: 'Cập nhật trạng thái thành công', task });

    // ✅ LOG
    ActivityLogger.logTaskStatusChanged(req.user, task, oldStatus, status, teamId, authHeader);
    triggerRecalcProjectProgress(task.project_id, authHeader);

    // ===================================================================
    // 🔥 MỚI: GỬI EMAIL KHI TASK HOÀN THÀNH (Done)
    // ===================================================================
    if (status === 'Done' && task.created_by.toString() !== req.user.id) {
      http.notification.post('/', {
        user_id: task.created_by, 
        reference_id: task._id, 
        reference_model: 'Task',
        type: 'STATUS_CHANGE',
        message: `✅ ${userName} đã hoàn thành task "${task.task_name}"`,
        should_send_mail: true  // ✅ GỬI EMAIL CHO NGƯỜI TẠO TASK
      }, { headers: { Authorization: authHeader } }).catch(() => {});
    }

  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 6. Update Progress
export const updateTaskProgress = async (req, res) => {
  try {
    const { progress, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy' });

    const oldStatus = task.status;
    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);
    
    // ✅ Validation
    if (status === 'In Progress' && (progress === 0 || progress === 100)) {
      return res.status(400).json({ 
        message: 'Công việc đang thực hiện phải có tiến độ từ 1-99%' 
      });
    }

    if (status === 'To Do' && progress !== 0) {
      return res.status(400).json({ 
        message: 'Công việc chưa thực hiện phải có tiến độ 0%' 
      });
    }

    if (status === 'Done' && progress !== 100) {
      return res.status(400).json({ 
        message: 'Công việc đã hoàn thành phải có tiến độ 100%' 
      });
    }

    task.progress = progress;
    if (status !== undefined) {
      task.status = status;
    }
    
    await task.save();

    res.json({ message: 'Cập nhật tiến độ thành công', task });

    const authHeader = req.headers.authorization;

    // ✅ LOG
    if (oldStatus !== task.status) {
      ActivityLogger.logTaskStatusChanged(req.user, task, oldStatus, task.status, teamId, authHeader);
    }
    
    ActivityLogger.logTaskProgressUpdated(req.user, task, progress, teamId, authHeader);
    triggerRecalcProjectProgress(task.project_id, authHeader);

    // ===================================================================
    // 🔥 MỚI: GỬI EMAIL KHI TASK VỪA HOÀN THÀNH 100%
    // ===================================================================
    if (task.status === 'Done' && task.created_by.toString() !== req.user.id) {
      const userName = getUserNameFromRequest(req);
      http.notification.post('/', {
        user_id: task.created_by, 
        reference_id: task._id, 
        reference_model: 'Task',
        type: 'STATUS_CHANGE',
        message: `✅ ${userName} đã hoàn thành task "${task.task_name}"`,
        should_send_mail: true
      }, { headers: { Authorization: authHeader } }).catch(() => {});
    }

  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 7. Update Assignee
export const updateTaskAssignee = async (req, res) => {
  try {
    const { assigned_to } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    const authHeader = req.headers.authorization;
    const userName = getUserNameFromRequest(req);
    const teamId = await getTeamIdByProject(task.project_id, authHeader);

    task.assigned_to = assigned_to;
    await task.save();

    res.json({ message: 'Giao việc thành công', task });

    // ✅ LOG
    ActivityLogger.logTaskAssigned(req.user, task, userName, teamId, authHeader);

    // ===================================================================
    // 🔥 SỬA: THÊM should_send_mail
    // ===================================================================
    if (assigned_to && assigned_to !== req.user.id) {
       http.notification.post('/', {
        user_id: assigned_to, 
        reference_id: task._id, 
        reference_model: 'Task',
        type: 'ASSIGN', 
        message: `${userName} đã giao việc "${task.task_name}" cho bạn`,
        should_send_mail: true  // ✅ BẬT GỬI EMAIL
      }, { headers: { Authorization: authHeader } }).catch(() => {});
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 8. Update Priority
export const updateTaskPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    res.json({ message: 'Cập nhật độ ưu tiên thành công', task });
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 9. Update Due Date
export const updateTaskDueDate = async (req, res) => {
  try {
    const { due_date } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { due_date }, { new: true });
    res.json({ message: 'Cập nhật hạn chót thành công', task });
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 10. Update General Info
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);
    Object.assign(task, updates);
    await task.save();

    res.json({ message: 'Cập nhật thành công', task });

    ActivityLogger.logTaskGeneralUpdate(req.user, task, updates, teamId, req.headers.authorization);
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 11. Delete Task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy' });

    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);
    const taskName = task.task_name;
    const projectId = task.project_id;
    const taskId = task._id;

    await task.deleteOne();
    res.json({ message: 'Đã xóa công việc' });

    ActivityLogger.logTaskDeleted(req.user, taskId, taskName, teamId, req.headers.authorization);
    triggerRecalcProjectProgress(projectId, req.headers.authorization);

    http.notification.delete(`/reference/Task/${taskId}`, {
        headers: { Authorization: req.headers.authorization }
    }).catch(err => {
        console.error(`⚠️ Failed to cleanup notification for task ${taskId}:`, err.message);
    });

  } catch (e) { 
    res.status(500).json({ message: 'Lỗi server' }); 
  }
};

// 12. Delete Tasks by Project
export const deleteTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const tasks = await Task.find({ project_id: projectId }).select('_id task_name');
    const result = await Task.deleteMany({ project_id: projectId });

    res.json({ 
      message: `Đã xóa ${result.deletedCount} công việc thuộc dự án`, 
      deletedCount: result.deletedCount 
    });

    const authHeader = req.headers.authorization;
    
    tasks.forEach(t => {
       ActivityLogger.logTaskDeleted(req.user, t._id, t.task_name, null, authHeader).catch(() => {});
    });

    http.notification.delete(`/reference/Project/${projectId}`, {
        headers: { Authorization: authHeader }
    }).catch(err => console.error("Cleanup project notifications failed:", err.message));

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi server khi xóa tasks theo project' });
  }
};

// =================================================================
// 🆕 13. Unassign Tasks khi User rời nhóm/bị xóa
// =================================================================
export const unassignTasksByTeam = async (req, res) => {
  try {
    const { user_id, team_id } = req.body;

    console.log('📥 [Unassign] Request:', { user_id, team_id });

    // ✅ Validation đơn giản
    if (!user_id || !team_id) {
      console.error('❌ [Unassign] Missing fields');
      return res.status(400).json({ 
        message: 'Missing required fields: user_id and team_id' 
      });
    }

    console.log('🔍 [Unassign] Executing updateMany...');

    // ✅ MONGOOSE TỰ ĐỘNG CAST - Không cần new ObjectId()
    const result = await Task.updateMany(
      { 
        team_id: team_id,        // ✅ Đơn giản hơn
        assigned_to: user_id     // ✅ Mongoose tự cast
      },
      { 
        $unset: { assigned_to: "" }
      }
    );

    console.log(`✅ [Unassign] Success: ${result.modifiedCount} tasks unassigned`);

    res.json({ 
      message: 'Tasks unassigned successfully', 
      unassignedCount: result.modifiedCount 
    });

    // ✅ LOG
    if (result.modifiedCount > 0) {
      const authHeader = req.headers.authorization;
      
      ActivityLogger.logBulkUnassign(
        req.user,
        user_id,
        team_id,
        result.modifiedCount,
        authHeader
      ).catch(err => {
        console.error('⚠️ Lỗi ghi log bulk unassign:', err.message);
      });
    }

  } catch (error) {
    console.error('⚠️ [Unassign] Error:', error);
    console.error('⚠️ [Unassign] Stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};