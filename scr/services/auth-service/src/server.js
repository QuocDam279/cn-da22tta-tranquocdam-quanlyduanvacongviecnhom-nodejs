// services/auth-service/src/server.js
import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Auth Service đang chạy trên port ${PORT}`);
  console.log(`📍 Google OAuth Callback: http://localhost:${PORT}/api/auth/google/callback`);
  console.log(`🔗 Google Login URL: http://localhost:${PORT}/api/auth/google`);
});