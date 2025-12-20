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

    // Không trả password về client
    const userResponse = {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      avatar: user.avatar,
      created_at: user.created_at
    };

    res.status(201).json({ message: 'Đăng ký thành công', token, user: userResponse });
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
    
    // Không trả password về client
    const userResponse = {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      avatar: user.avatar,
      created_at: user.created_at,
      last_login: user.last_login
    };

    res.json({ message: 'Đăng nhập thành công', token, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 📌 Lấy thông tin nhiều user theo danh sách ID (dùng cho microservice khác)
export const getUsersInfo = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ' });
    }

    // Lấy danh sách user tương ứng
    const users = await User.find(
      { _id: { $in: ids } },
      '_id full_name email avatar created_at'
    );

    res.json(users);
  } catch (error) {
    console.error('❌ Lỗi getUsersInfo:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 📌 Tìm user theo email (dùng cho các microservice)
export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    const user = await User.findOne(
      { email },
      "_id full_name email avatar created_at"
    );

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({ user });
  } catch (error) {
    console.error("❌ Lỗi findUserByEmail:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};