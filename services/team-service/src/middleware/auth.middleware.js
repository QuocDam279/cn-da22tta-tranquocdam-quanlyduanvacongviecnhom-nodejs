import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1️⃣ CÁCH 1: Kiểm tra Header từ Gateway (Ưu tiên số 1 - Hiệu năng cao)
  const gatewayUserId = req.headers['x-user-id'];
  
  if (gatewayUserId) {
    // Tái tạo req.user từ thông tin Gateway gửi xuống
    req.user = {
      id: gatewayUserId,
      _id: gatewayUserId, // Map cả 2 trường để code cũ/mới đều chạy
      role: req.headers['x-user-role'],
      email: req.headers['x-user-email']
    };
    return next(); // ✅ Cho qua ngay, không cần verify token tốn CPU
  }

  // 2️⃣ CÁCH 2: Fallback cho gọi nội bộ (Internal Call không qua Gateway)
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Không có thông tin xác thực' });
  }

  try {
    // Nếu gọi nội bộ thì chịu khó verify token chút
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Lỗi auth nội bộ:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};