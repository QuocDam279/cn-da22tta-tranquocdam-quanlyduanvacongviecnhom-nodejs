import Notification from '../models/Notification.js';
import http from '../utils/httpClient.js';

// =====================================================================
// 🛠️ PRIVATE HELPERS
// =====================================================================

/**
 * 🌍 Map loại thông báo sang tiêu đề tiếng Việt
 */
const getVietnameseSubject = (type) => {
  const subjectMap = {
    'ASSIGN': '🎯 Bạn được giao công việc mới',
    'INVITE': '👋 Lời mời tham gia nhóm',
    'DEADLINE': '⏰ Nhắc nhở hạn chót',
    'STATUS_CHANGE': '✅ Cập nhật trạng thái công việc',
    'COMMENT': '💬 Bình luận mới',
    'MENTION': '📢 Bạn được nhắc đến',
    'WARNING': '⚠️ Thông báo quan trọng',
    'INFO': '🔔 Thông báo mới'
  };
  
  return subjectMap[type] || '🔔 Thông báo hệ thống';
};

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
      reference_id,
      reference_model,
      type,
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
    // 2️⃣ 📧 Gửi mail async với tiêu đề tiếng Việt
    // ==================================================
    if (should_send_mail) {
      getUserEmailById(user_id, req.headers.authorization)
        .then(email => {
          if (email) {
            const subject = getVietnameseSubject(type); // ✅ SỬ DỤNG HÀM MAP
            dispatchEmail(email, subject, message);
          }
        })
        .catch(err => console.error('❌ Lỗi gửi mail async:', err));
    }

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
      .lean();

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

    let relatedData = null;
    if (notification.reference_model === 'Task') {
      const taskRes = await http.task.get(`/${notification.reference_id}`, {
        headers: { Authorization: req.headers.authorization }
      }).catch(() => ({ data: null }));
      relatedData = taskRes.data;
    }

    const result = {
      ...notification.toObject(),
      related_data: relatedData
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
        read_at: new Date(),
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
    const { user_id, message, type } = req.body;
    
    if (!user_id || !message) {
      return res.status(400).json({ message: 'Thiếu dữ liệu' });
    }

    const email = await getUserEmailById(user_id, req.headers.authorization);
    
    if (!email) {
      return res.status(404).json({ message: 'Không tìm thấy email user' });
    }

    const subject = type ? getVietnameseSubject(type) : '🔔 Thông báo mới';
    await dispatchEmail(email, subject, message);

    res.json({ message: `Đã gửi mail tới ${email}` });
  } catch (error) {
    console.error('❌ Lỗi sendNotificationMailAPI:', error.message);
    res.status(500).json({ message: 'Lỗi gửi mail', error: error.message });
  }
};