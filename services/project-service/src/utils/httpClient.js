import axios from 'axios';

const http = {
  auth: axios.create({
    baseURL: 'http://auth-service:5001/api/auth', // 📡 Auth Service
    timeout: 5000
  }),

  team: axios.create({
    baseURL: 'http://team-service:5002/api/teams', // 📡 Team Service
    timeout: 5000
  }),

  // Đã xóa Activity Service

  task: axios.create({
    baseURL: 'http://task-service:5004/api/tasks', // 📡 Task Service
    timeout: 5000
  }),
};

// Middleware log
for (const key in http) {
  http[key].interceptors.request.use(config => {
    console.log(`📡 [${key.toUpperCase()}] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
}

export default http;