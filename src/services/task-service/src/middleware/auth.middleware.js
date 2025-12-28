import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // 1️⃣ CÁCH 1: Kiểm tra Header từ Gateway (Ưu tiên số 1)
  const gatewayUserId = req.headers['x-user-id'];
  
  if (gatewayUserId) {
    // 🔥 Xử lý tên tiếng Việt từ Gateway
    let userName = 'Người dùng'; // Giá trị mặc định
    const rawName = req.headers['x-user-name'];
    
    if (rawName) {
      try {
        // Decode URI component (Gateway đã encode khi gửi)
        userName = decodeURIComponent(rawName);
      } catch (e) {
        // Nếu decode lỗi, dùng giá trị gốc
        console.warn('⚠️ Không thể decode x-user-name:', rawName);
        userName = rawName;
      }
    }

    // Tái tạo req.user từ headers
    req.user = {
      id: gatewayUserId,
      _id: gatewayUserId, // Để tương thích với code cũ dùng _id
      role: req.headers['x-user-role'] || 'user',
      email: req.headers['x-user-email'] || '',
      name: userName, // ✅ TÊN ĐÃ ĐƯỢC DECODE
      full_name: userName // ✅ Thêm full_name để tương thích
    };
    
    return next();
  }

  // 2️⃣ CÁCH 2: Fallback - Verify JWT (cho gọi nội bộ giữa services)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token xác thực' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🔥 Đảm bảo req.user có đủ thông tin
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id,
      role: decoded.role || 'user',
      email: decoded.email || '',
      name: decoded.name || decoded.full_name || decoded.email?.split('@')[0] || 'Người dùng',
      full_name: decoded.full_name || decoded.name || decoded.email?.split('@')[0] || 'Người dùng'
    };
    
    next();
  } catch (error) {
    console.error('❌ Token không hợp lệ:', error.message);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};