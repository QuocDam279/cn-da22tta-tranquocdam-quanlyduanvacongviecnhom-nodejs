// services/mail-service/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 0️⃣ CÁCH 0: Ưu tiên số 1 - Kiểm tra Gọi nội bộ (Internal Call)
  // Nếu có chìa khóa nội bộ đúng, cho qua luôn không cần token user
  const internalKey = req.headers['x-api-key'];
  if (internalKey && internalKey === process.env.INTERNAL_API_KEY) {
    console.log('🛡️ [AUTH] Internal call authorized');
    return next();
  }

  // 1️⃣ CÁCH 1: Kiểm tra Header từ Gateway
  const gatewayUserId = req.headers['x-user-id'];
  if (gatewayUserId) {
    req.user = {
      id: gatewayUserId,
      _id: gatewayUserId,
      role: req.headers['x-user-role'],
      email: req.headers['x-user-email']
    };
    return next();
  }

  // 2️⃣ CÁCH 2: Fallback Token (Code cũ của bạn)
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Không có thông tin xác thực' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Lỗi auth nội bộ:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};