// services/team-service/src/server.js
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`🚀 Project Service đang chạy trên port ${PORT}`);
});
