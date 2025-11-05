// services/project-service/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // ✅ headers, không phải header
  if (!token) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ gán toàn bộ payload
    next();
  } catch (error) {
    console.error('❌ Lỗi verify token:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};
