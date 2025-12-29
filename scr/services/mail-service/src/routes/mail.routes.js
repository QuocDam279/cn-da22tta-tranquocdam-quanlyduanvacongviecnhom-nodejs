import express from 'express';
import { sendMail, checkConnection } from '../controllers/mail.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js'; 

const router = express.Router();

/**
 * 🛡️ Bảo mật:
 * API gửi mail này NÊN được bảo vệ. 
 * Nếu gọi từ Gateway (Client -> Gateway -> Mail), cần verifyToken.
 * Nếu gọi nội bộ (Notification -> Mail), cần check API Key hoặc Internal Token.
 * Ở đây tôi dùng verifyToken tái sử dụng từ Middleware bạn đã có.
 */

// 🚑 Kiểm tra kết nối SMTP (Health check)
router.get('/health', checkConnection);

// 📤 Gửi mail
router.post('/send', verifyToken, sendMail);

export default router;