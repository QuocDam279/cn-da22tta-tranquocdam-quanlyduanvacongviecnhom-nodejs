// services/task-service/src/utils/httpClient.js
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

  project: axios.create({
    baseURL: 'http://project-service:5003/api/projects', // 📡 Project Service
    timeout: 5000
  }),

  activity: axios.create({
    baseURL: 'http://activity-service:5007/api/activity-logs', // 📡 Activity Log Service
    timeout: 5000
  }),

  notification: axios.create({
    baseURL: 'http://notification-service:5005/api/notifications', // 📡 Dự kiến Notification Service
    timeout: 5000
  })

};

// Middleware log (tuỳ chọn, giúp debug dễ hơn)
for (const key in http) {
  http[key].interceptors.request.use(config => {
    console.log(`📡 [${key.toUpperCase()}] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
}

export default http;
