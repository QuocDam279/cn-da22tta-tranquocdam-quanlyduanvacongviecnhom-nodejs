// services/activity-service/src/utils/httpClient.js
import axios from 'axios';

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 5000
  });

  // Error handling interceptor
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        console.error(`⏱️ Timeout: ${error.config.url}`);
      } else if (error.response) {
        console.error(`❌ HTTP ${error.response.status}: ${error.config.url}`);
      } else {
        console.error(`🔌 Network error: ${error.message}`);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const http = {
  team: createClient('http://team-service:5002/api/teams')
};

export default http;