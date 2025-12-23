// utils/activityLogger.js
import http from './httpClient.js';

// Map trạng thái tiếng Anh → tiếng Việt
const statusMap = {
  "To Do": "Chưa thực hiện",
  "In Progress": "Đang thực hiện",
  "Review": "Chờ duyệt",
  "Done": "Đã hoàn thành"
};

class ActivityLogger {
  static async log({ user_id, action, related_id, token }) {
    try {
      if (!user_id || !action) {
        console.error('❌ ActivityLogger: Missing required fields');
        return;
      }

      await http.activity.post(
        '/',
        {
          user_id,
          action,
          related_id: related_id || null,
          related_type: 'task'
        },
        {
          headers: token ? { Authorization: token } : {}
        }
      );

      console.log(`✓ Activity logged: ${action}`);
    } catch (error) {
      console.error(
        '⚠️ Failed to log activity:',
        error.response?.status || error.message
      );
    }
  }

  // 👉 Tạo task
  static async logTaskCreated(user_id, task_id, taskName, token) {
    const action = `Tạo công việc mới: ${taskName}`;
    await this.log({ user_id, action, related_id: task_id, token });
  }

  // 👉 Cập nhật task
  static async logTaskUpdated(user_id, task_id, taskName, status, token) {
    const vnStatus = statusMap[status] || status;
    const action = status
      ? `Cập nhật công việc: ${taskName} (${vnStatus})`
      : `Cập nhật công việc: ${taskName}`;
    await this.log({ user_id, action, related_id: task_id, token });
  }

  // 👉 Xóa task
  static async logTaskDeleted(user_id, task_id, taskName, token) {
    const action = `Xóa công việc: ${taskName}`;
    await this.log({ user_id, action, related_id: task_id, token });
  }

  // 👉 Giao task
  static async logTaskAssigned(user_id, task_id, taskName, assignedToName, token) {
    const action = `Giao việc "${taskName}" cho ${assignedToName}`;
    await this.log({ user_id, action, related_id: task_id, token });
  }

  // 👉 Đổi trạng thái task
  static async logTaskStatusChanged(user_id, task_id, taskName, oldStatus, newStatus, token) {
    const oldVN = statusMap[oldStatus] || oldStatus;
    const newVN = statusMap[newStatus] || newStatus;

    const action = `Thay đổi trạng thái: ${taskName} (${oldVN} → ${newVN})`;
    await this.log({ user_id, action, related_id: task_id, token });
  }

  // 👉 Cập nhật tiến độ
  static async logTaskProgressUpdated(user_id, task_id, taskName, progress, token) {
    const action = `Cập nhật tiến độ: ${taskName} (${progress}%)`;
    await this.log({ user_id, action, related_id: task_id, token });
  }
  // 👉 Ghi log hoạt động chung
  static async logActivity({ user_id, action, related_type, related_id, related_data }) {
      try {
          // Gọi sang Activity Service
          await http.activity.post('/', {
              user_id,
              action,
              related_type,
              related_id,
              related_data
          });
      } catch (err) {
          console.error("Activity Log Error:", err.message);
      }
  }
}

export default ActivityLogger;
