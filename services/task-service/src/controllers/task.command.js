import Task from '../models/Task.js';
import http from '../utils/httpClient.js';
import ActivityLogger from '../utils/activityLogger.js';
import { 
  triggerRecalcProjectProgress, 
  getTeamIdByProject, 
  populateTasksWithUsers 
} from '../services/task.helper.js';

// ============================================================
// 🟢 READ OPERATIONS (Lấy dữ liệu)
// ============================================================

// 1. Lấy danh sách task theo Project ID
export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project_id: projectId }).sort({ created_at: -1 });
    const populatedTasks = await populateTasksWithUsers(tasks, req.headers.authorization);
    res.json(populatedTasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Lấy chi tiết Task
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });
    const [populated] = await populateTasksWithUsers([task], req.headers.authorization);
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 3. Lấy Task của tôi (Dashboard)
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const query = { assigned_to: userId };
    if (status) query.status = status;

    const tasks = await Task.find(query).sort({ due_date: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// ============================================================
// 🟡 WRITE OPERATIONS (Thay đổi dữ liệu)
// ============================================================

// 4. Create Task
export const createTask = async (req, res) => {
  try {
    const { project_id, task_name, assigned_to, ...details } = req.body;
    const authHeader = req.headers.authorization;

    // 🔥 Lấy team_id từ Project để log
    const teamId = await getTeamIdByProject(project_id, authHeader);
    if (!teamId) return res.status(400).json({ message: 'Dự án không hợp lệ hoặc không thuộc nhóm nào' });

    // Tạo Task (Lưu team_id vào Task nếu model đã update, nhưng quan trọng là dùng teamId để log)
    const task = await Task.create({ 
      project_id, 
      team_id: teamId, // Lưu luôn nếu model hỗ trợ
      task_name, 
      assigned_to, 
      created_by: req.user.id, 
      ...details 
    });

    res.status(201).json({ message: 'Tạo công việc thành công', task });

    // ✅ LOG: Tạo mới
    ActivityLogger.logTaskCreated(req.user, task, teamId, authHeader);
    triggerRecalcProjectProgress(project_id, authHeader);

    // Thông báo Assign
    if (assigned_to && assigned_to !== req.user.id) {
       http.notification.post('/', {
         user_id: assigned_to, reference_id: task._id, type: 'ASSIGN',
         message: `${req.user.name} đã giao việc "${task_name}"`
       }, { headers: { Authorization: authHeader } }).catch(() => {});
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 5. Update Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy task' });

    const oldStatus = task.status;
    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);

    task.status = status;
    if (progress !== undefined) task.progress = progress;
    await task.save();

    res.json({ message: 'Cập nhật trạng thái thành công', task });

    // ✅ LOG: Đổi trạng thái
    ActivityLogger.logTaskStatusChanged(req.user, task, oldStatus, status, teamId, req.headers.authorization);
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 6. Update Progress
export const updateTaskProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy' });

    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);
    task.progress = progress;
    await task.save();

    res.json({ message: 'Cập nhật tiến độ thành công', task });

    // ✅ LOG: Đổi tiến độ
    ActivityLogger.logTaskProgressUpdated(req.user, task, progress, teamId, req.headers.authorization);
    triggerRecalcProjectProgress(task.project_id, req.headers.authorization);
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 7. Update Assignee
export const updateTaskAssignee = async (req, res) => {
  try {
    const { assigned_to } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Not found' });

    const teamId = await getTeamIdByProject(task.project_id, req.headers.authorization);
    
    // Logic validate thành viên thuộc team (đã có trong helper logic hoặc gọi API team check - ở đây giả lập đơn giản)
    // ...

    task.assigned_to = assigned_to;
    await task.save();

    res.json({ message: 'Giao việc thành công', task });

    // Lấy tên người được giao để log
    // (Thực tế nên lấy từ Auth service, ở đây log ID tạm hoặc xử lý ở Frontend)
    const assigneeName = "thành viên mới"; 

    // ✅ LOG: Giao việc
    ActivityLogger.logTaskAssigned(req.user, task, assigneeName, teamId, req.headers.authorization);

    if (assigned_to !== req.user.id) {
       http.notification.post('/', {
        user_id: assigned_to, reference_id: task._id, type: 'ASSIGN',
        message: `${req.user.name} đã giao việc "${task.task_name}"`
      }, { headers: { Authorization: req.headers.authorization } }).catch(() => {});
    }
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 8. Update Priority (KHÔNG LOG)
export const updateTaskPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { priority }, { new: true });
    res.json({ message: 'Cập nhật độ ưu tiên thành công', task });
    // ❌ Không gọi ActivityLogger
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 9. Update Due Date (KHÔNG LOG)
export const updateTaskDueDate = async (req, res) => {
  try {
    const { due_date } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { due_date }, { new: true });
    res.json({ message: 'Cập nhật hạn chót thành công', task });
    // ❌ Không gọi ActivityLogger
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 10. Update General Info (Tên, Mô tả...)
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

    // ✅ LOG: Chỉ log nếu đổi tên hoặc mô tả, không log nếu chỉ đổi ngày/priority qua hàm này
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

    await task.deleteOne();
    res.json({ message: 'Đã xóa công việc' });

    // ✅ LOG: Xóa
    ActivityLogger.logTaskDeleted(req.user, task._id, taskName, teamId, req.headers.authorization);
    triggerRecalcProjectProgress(projectId, req.headers.authorization);
  } catch (e) { res.status(500).json({ message: 'Lỗi server' }); }
};
// 12. Delete Tasks by Project (Cascade Delete)
export const deleteTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // 1. Tìm các task sẽ bị xóa để lấy tên log (Optional)
    const tasks = await Task.find({ project_id: projectId }).select('_id task_name');
    
    // 2. Xóa toàn bộ task thuộc project
    const result = await Task.deleteMany({ project_id: projectId });

    res.json({ 
      message: `Đã xóa ${result.deletedCount} công việc thuộc dự án`, 
      deletedCount: result.deletedCount 
    });

    // 3. Ghi log (Async) - chạy ngầm không cần await
    const authHeader = req.headers.authorization;
    // Lấy teamId thông qua helper hoặc gọi API (ở đây giản lược để fix lỗi crash trước)
    // Nếu muốn log kỹ hơn, bạn cần lấy teamId giống các hàm khác
    tasks.forEach(t => {
       ActivityLogger.logTaskDeleted(req.user, t._id, t.task_name, null, authHeader).catch(() => {});
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Lỗi server khi xóa tasks theo project' });
  }
};

