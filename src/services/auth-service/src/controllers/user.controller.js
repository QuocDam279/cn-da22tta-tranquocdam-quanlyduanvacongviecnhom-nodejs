// services/auth-service/src/controllers/user.controller.js
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// 📌 Lấy thông tin profile của user hiện tại
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Lỗi getProfile:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 📌 Cập nhật tên người dùng
export const updateProfile = async (req, res) => {
  try {
    const { full_name } = req.body;

    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ message: 'Tên không được để trống' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { full_name: full_name.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ message: 'Cập nhật tên thành công', user });
  } catch (error) {
    console.error('❌ Lỗi updateProfile:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 📌 Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file ảnh' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Nếu không tìm thấy user, xóa ngay ảnh vừa up lên để tránh rác
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // --- LOGIC XÓA ẢNH CŨ AN TOÀN ---
    // Chỉ xóa nếu ảnh cũ tồn tại VÀ KHÔNG PHẢI là link online (Google/Facebook)
    if (user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('https')) {
      
      // user.avatar đang lưu dạng: "/uploads/filename.jpg" -> Cần lấy tên file
      const oldFileName = path.basename(user.avatar);
      const oldAvatarPath = path.join(process.cwd(), 'uploads', oldFileName);

      // Kiểm tra file có trên ổ cứng không rồi mới xóa
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
          console.log(`Đã xóa avatar cũ: ${oldFileName}`);
        } catch (err) {
          console.error("Lỗi khi xóa ảnh cũ:", err);
        }
      }
    }
    // --------------------------------

    // Lưu đường dẫn mới (đường dẫn tương đối để frontend truy cập)
    const avatarUrl = `/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
      message: 'Cập nhật avatar thành công', 
      avatar: avatarUrl 
    });

  } catch (error) {
    // Dọn dẹp file rác nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('❌ Lỗi uploadAvatar:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 📌 Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    // Validate input
    if (!old_password || !new_password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Lấy thông tin user (bao gồm password)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    // Cập nhật mật khẩu mới (sẽ tự động hash qua pre-save hook)
    user.password = new_password;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('❌ Lỗi changePassword:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};