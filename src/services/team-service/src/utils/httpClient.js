import axios from 'axios';

const http = {
  auth: axios.create({
    baseURL: 'http://auth-service:5001/api/auth',
    timeout: 5000
  }),

  project: axios.create({
    baseURL: 'http://project-service:5003/api/projects',
    timeout: 5000
  }),

  notification: axios.create({
    baseURL: 'http://notification-service:5005/api/notifications',
    timeout: 5000
  }),

  // ✅ THÊM TASK SERVICE
  task: axios.create({
    baseURL: 'http://task-service:5004/api/tasks',
    timeout: 5000
  })
};

// Middleware log
for (const key in http) {
  http[key].interceptors.request.use(config => {
    console.log(`📡 [${key.toUpperCase()}] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
}

export default http;