// danh sách URL cho các service nội bộ (Docker network)
export const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:5001/api/auth',
  team: process.env.TEAM_SERVICE_URL || 'http://team-service:5002/api/teams',
  project: process.env.PROJECT_SERVICE_URL || 'http://project-service:5003/api/projects'
};
