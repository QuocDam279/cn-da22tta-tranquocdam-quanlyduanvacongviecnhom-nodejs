// services/task-service/src/server.js
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`🚀 Task Service đang chạy trên port ${PORT}`);
});
