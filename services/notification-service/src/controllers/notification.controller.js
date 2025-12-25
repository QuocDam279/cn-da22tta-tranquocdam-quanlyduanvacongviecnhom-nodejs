import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';

// =====================================================================
// 🛠️ PRIVATE HELPERS
// =====================================================================

/**
 * 📧 Helper: Logic gửi email thực tế (Tách biệt để dùng chung)
 * Hỗ trợ nhận sẵn email để tránh query lại User Service
 */
export const dispatchEmail = async (userEmail, subject, text) => {
  if (!userEmail) return null;
  try {
    const { data: mailRes } = await http.mail.post('/send', {
      to: userEmail,
      subject,
      text
    });
    return mailRes;
  } catch (error) {
    console.warn(`⚠️ Gửi mail thất bại tới ${userEmail}:`, error.message);
    return null;
  }
};

/**
 * 👥 Helper: Lấy thông tin User để gửi mail (nếu chưa có email)
 */
const getUserEmailById = async (userId, authHeader) => {
  try {
    const { data: users } = await http.auth.post('/users/info', 
      { ids: [userId] },
      { headers: authHeader ? { Authorization: authHeader } : {} }
    );
    return users?.[0]?.email || null;
  } catch (error) {
    console.warn('⚠️ Fetch user email failed:', error.message);
    return null;
  }
};

// =====================================================================
// 🎮 CONTROLLERS
// =====================================================================

/**
 * 🧱 Tạo thông báo mới
 */
export const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      reference_id,        // thay cho task_id
      reference_model,     // 'Task', 'Team', ...
      type,                // 'INVITE', 'DEADLINE', ...
      message,
      should_send_mail
    } = req.body;

    // 1️⃣ Lưu DB
    const notification = await Notification.create({
      user_id,
      reference_id,
      reference_model,
      type,
      message,
      sent_at: should_send_mail ? new Date() : null
    });

    // ✅ Response ngay
    res.status(201).json({
      message: 'Tạo thông báo thành công',
      notification
    });

    // ==================================================
    // 2️⃣ 📧 Gửi mail async (không await)
    // ==================================================
    if (should_send_mail) {
      getUserEmailById(user_id, req.headers.authorization)
        .then(email => {
          if (email) {
            dispatchEmail(
              email,
              `🔔 Thông báo mới: ${type}`,
              message
            );
          }
        })
        .catch(err => console.error('❌ Lỗi gửi mail async:', err));
    }

    // ⚠️ NOTE: Không log activity ở đây
    // Activity đã được log bởi service gọi notification (Task/Project/Team Service)

  } catch (error) {
    console.error('❌ Lỗi createNotification:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
};

/**
 * 📬 Lấy tất cả thông báo của user hiện tại
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user_id: userId })
      .sort({ created_at: -1 })
      .lean(); // Dùng lean() để query nhanh hơn nếu chỉ đọc

    res.json(notifications);
  } catch (error) {
    console.error('❌ Lỗi getMyNotifications:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết 1 thông báo (Kèm info Task)
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    }

    // 🔥 SỬA: Dùng reference_id thay vì task_id
    // Chỉ fetch task nếu reference_model là 'Task'
    let relatedData = null;
    if (notification.reference_model === 'Task') {
      const taskRes = await http.task.get(`/${notification.reference_id}`, {
        headers: { Authorization: req.headers.authorization }
      }).catch(() => ({ data: null }));
      relatedData = taskRes.data;
    }

    const result = {
      ...notification.toObject(),
      related_data: relatedData // Thay vì task, dùng tên chung hơn
    };

    res.json(result);
  } catch (error) {
    console.error('❌ Lỗi getNotificationById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { 
        is_read: true, 
        read_at: new Date(), // 🔥 Thêm read_at
        updated_at: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
    }

    res.json({ message: 'Đã đánh dấu đã đọc', notification });
  } catch (error) {
    console.error('❌ Lỗi markAsRead:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✅ Đánh dấu tất cả đã đọc
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { 
        is_read: true,
        read_at: new Date(),
        updated_at: new Date()
      }
    );

    res.json({
      message: 'Đã đánh dấu tất cả thông báo đã đọc',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Lỗi markAllAsRead:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa thông báo
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Notification.deleteOne({ _id: id, user_id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hoặc không có quyền' });
    }

    res.json({ message: 'Xóa thông báo thành công' });
  } catch (error) {
    console.error('❌ Lỗi deleteNotification:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📊 Lấy số lượng thông báo chưa đọc
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      user_id: userId,
      is_read: false
    });

    res.json({ unread_count: count });
  } catch (error) {
    console.error('❌ Lỗi getUnreadCount:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📢 Controller gửi mail thông báo (Manual Trigger)
 * Wrapper gọi logic gửi mail
 */
export const sendNotificationMailAPI = async (req, res) => {
  try {
    const { user_id, message } = req.body;
    
    if (!user_id || !message) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' });
    }

    // 1. Lấy email user
    const email = await getUserEmailById(user_id, req.headers.authorization);
    
    if (!email) {
      return res.status(404).json({ message: 'Không tìm thấy email user' });
    }

    // 2. Gửi mail
    await dispatchEmail(email, '🔔 Thông báo mới', message);

    res.json({ message: `Đã gửi mail tới ${email}` });
  } catch (error) {
    console.error('❌ Lỗi sendNotificationMailAPI:', error.message);
    res.status(500).json({ message: 'Lỗi gửi mail', error: error.message });
  }
};