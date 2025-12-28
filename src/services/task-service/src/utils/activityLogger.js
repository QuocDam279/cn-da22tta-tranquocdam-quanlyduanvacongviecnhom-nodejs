import http from './httpClient.js';

const statusMap = {
  "To Do": "Chưa thực hiện",
  "In Progress": "Đang thực hiện",
  "Review": "Chờ duyệt",
  "Done": "Đã hoàn thành"
};

class ActivityLogger {
  /**
   * Hàm core gửi log sang Activity Service
   */
  static async log({ user, action, related_id, related_name, team_id, token }) {
    try {
      if (!user || !action) return;

      await http.activity.post('/', {
        user_id: user.id || user._id,
        user_name: user.name || user.full_name || "Thành viên",
        user_avatar: user.avatar || "",
        action,
        related_id: related_id || null,
        related_type: 'task',
        related_name: related_name,
        team_id: team_id // 🔥 Quan trọng: Để trưởng nhóm lọc log
      }, {
        headers: token ? { Authorization: token } : {}
      });
    } catch (error) {
      // Chỉ warn nhẹ, không làm crash luồng chính
      console.warn('⚠️ ActivityLogger Error:', error.response?.status || error.message);
    }
  }

  static async logTaskCreated(user, task, teamId, token) {
    await this.log({
      user,
      action: `đã tạo công việc: "${task.task_name}"`,
      related_id: task._id,
      related_name: task.task_name,
      team_id: teamId,
      token
    });
  }

  static async logTaskStatusChanged(user, task, oldStatus, newStatus, teamId, token) {
    const oldVN = statusMap[oldStatus] || oldStatus;
    const newVN = statusMap[newStatus] || newStatus;
    await this.log({
      user,
      action: `đã đổi trạng thái "${task.task_name}" từ [${oldVN}] sang [${newVN}]`,
      related_id: task._id,
      related_name: task.task_name,
      team_id: teamId,
      token
    });
  }

  static async logTaskProgressUpdated(user, task, progress, teamId, token) {
    await this.log({
      user,
      action: `đã cập nhật tiến độ "${task.task_name}" thành ${progress}%`,
      related_id: task._id,
      related_name: task.task_name,
      team_id: teamId,
      token
    });
  }

  static async logTaskAssigned(user, task, assigneeName, teamId, token) {
    await this.log({
      user,
      action: `đã giao công việc "${task.task_name}" cho ${assigneeName}`,
      related_id: task._id,
      related_name: task.task_name,
      team_id: teamId,
      token
    });
  }

  // Dùng cho update chung (như đổi tên, mô tả)
  static async logTaskGeneralUpdate(user, task, changes, teamId, token) {
    // Chỉ log nếu thay đổi tên hoặc mô tả, bỏ qua priority/date ở đây nếu lỡ truyền vào
    const keys = Object.keys(changes).filter(k => ['task_name', 'description'].includes(k));
    if (keys.length === 0) return;

    await this.log({
      user,
      action: `đã cập nhật thông tin công việc "${task.task_name}"`,
      related_id: task._id,
      related_name: task.task_name,
      team_id: teamId,
      token
    });
  }

  static async logTaskDeleted(user, task_id, taskName, teamId, token) {
    await this.log({
      user,
      action: `đã xóa công việc: "${taskName}"`,
      related_id: task_id,
      related_name: taskName,
      team_id: teamId,
      token
    });
  }
}

export default ActivityLogger;