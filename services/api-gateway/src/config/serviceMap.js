// services/api-gateway/src/config/serviceMap.js
// danh sách URL cho các service nội bộ (Docker network)
export const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001/api/auth',
  user: process.env.USER_SERVICE_URL || 'http://auth-service:5001/api/user', // ✅ THÊM MỚI
  uploads: process.env.UPLOADS_URL || 'http://auth-service:5001',
  team: process.env.TEAM_SERVICE_URL || 'http://team-service:5002/api/teams',
  project: process.env.PROJECT_SERVICE_URL || 'http://project-service:5003/api/projects',
  task: process.env.TASK_SERVICE_URL || 'http://task-service:5004/api/tasks',
  task_comment: process.env.TASK_COMMENT_SERVICE_URL || 'http://task-service:5004/api/task-comments',
  task_attachment: process.env.TASK_ATTACHMENT_SERVICE_URL || 'http://task-service:5004/api/task-attachments',
  notification_service: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005/api/notifications',
  mail_service: process.env.MAIL_SERVICE_URL || 'http://mail-service:5006/api/mail',
  activity: process.env.ACTIVITY_SERVICE_URL || 'http://activity-service:5007/api/activity-logs'
};