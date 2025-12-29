//services/api-gateway/src/middleware/verifyToken.js
import { verifyTokenSync } from '../utils/jwt.js';

/**
 * Middleware dùng để kiểm tra token trước khi proxy.
 * Nếu token hợp lệ thì thêm req.user và cho phép tiếp.
 * Nếu không hợp lệ -> 401
 */
export const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = verifyTokenSync(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ', error: err.message });
  }
};
