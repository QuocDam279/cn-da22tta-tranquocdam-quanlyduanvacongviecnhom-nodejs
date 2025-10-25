// services/auth-service/src/controllers/auth.controller.js
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// Đăng ký người dùng mới
export const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const user = await User.create({ full_name, email, password });
    const token = generateToken(user);

    res.status(201).json({ message: 'Đăng ký thành công', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Đăng nhập người dùng
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Sai mật khẩu' });

    user.last_login = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({ message: 'Đăng nhập thành công', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
