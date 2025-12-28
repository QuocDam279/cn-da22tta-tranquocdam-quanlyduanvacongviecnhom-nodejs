// src/utils/httpClient.js
import axios from 'axios';

const INTERNAL_KEY = process.env.INTERNAL_API_KEY;

const http = {
  auth: axios.create({
    baseURL: 'http://auth-service:5001/api/auth',
    timeout: 5000,
    headers: { 'x-api-key': INTERNAL_KEY }
  }),

  team: axios.create({
    baseURL: 'http://team-service:5002/api/teams', // 📡 Team Service
    timeout: 5000
  }),

  project: axios.create({
    baseURL: 'http://project-service:5003/api/projects', // 📡 Project Service
    timeout: 5000
  }),

  task: axios.create({
    baseURL: 'http://task-service:5004/api/tasks', // 📡 Project Service
    timeout: 5000
  }),

  mail: axios.create({
    baseURL: 'http://mail-service:5006/api/mail',
    timeout: 20000,
    headers: { 'x-api-key': INTERNAL_KEY }
  })

};

// Middleware log
for (const key in http) {
  http[key].interceptors.request.use(config => {
    // console.log(`📡 [${key.toUpperCase()}] With Key: ${!!config.headers['x-api-key']}`);
    console.log(`📡 [${key.toUpperCase()}] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  });
}

export default http;
