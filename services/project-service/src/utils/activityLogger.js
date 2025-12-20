import http from './httpClient.js';

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
          related_type: 'project'
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

  static async logProjectCreated(user_id, project_id, projectName, token) {
    await this.log({
      user_id,
      action: `Tạo dự án mới: ${projectName}`,
      related_id: project_id,
      token
    });
  }

  static async logProjectUpdated(user_id, project_id, projectName, token) {
    await this.log({
      user_id,
      action: `Cập nhật dự án: ${projectName}`,
      related_id: project_id,
      token
    });
  }

  static async logProjectDeleted(user_id, project_id, projectName, token) {
    await this.log({
      user_id,
      action: `Xóa dự án: ${projectName}`,
      related_id: project_id,
      token
    });
  }

  static async logProjectProgressUpdated(user_id, project_id, projectName, progress, token) {
    await this.log({
      user_id,
      action: `Cập nhật tiến độ dự án: ${projectName} (${progress}%)`,
      related_id: project_id,
      token
    });
  }
}

export default ActivityLogger;
