//services/api-gateway/src/index.js
import http from 'http';
import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚦 API Gateway running on port ${PORT}`);
});
