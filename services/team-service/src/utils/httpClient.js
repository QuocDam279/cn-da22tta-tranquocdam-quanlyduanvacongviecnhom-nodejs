import axios from 'axios';

const http = {
  auth: axios.create({
    baseURL: 'http://auth-service:5001/api/auth', // 📡 Auth Service
    timeout: 5000
  }),

  project: axios.create({
    baseURL: 'http://project-service:5003/api/projects', // 📡 Project Service
    timeout: 5000
  }),

  notification: axios.create({
    baseURL: 'http://notification-service:5005/api/notifications', // 📡 Notification Service
    timeout: 5000
  })

  // Đã xóa Activity Service
};

// Middleware log
for (const key in http) {
  http[key].interceptors.request.use(config => {
    console.log(`📡 [${key.toUpperCase()}] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
}

export default http;