// services/notification-service/src/server.js
import app from './app.js';
import dotenv from 'dotenv';

// 🕒 import cron job để chạy hằng ngày
import './scron/reminder.js';

dotenv.config();

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
  console.log(`🚀 Notification Service đang chạy trên port ${PORT}`);
});
