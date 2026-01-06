import TaskComment from '../models/TaskComment.js';
import Task from '../models/Task.js'; // Task Model nằm chung trong Task Service? (Nếu tách service thì phải gọi HTTP)
import http from '../utils/httpClient.js';

/**
 * 💬 Tạo bình luận mới
 */
export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 1️⃣ Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }

    // 2️⃣ Check Task tồn tại
    const task = await Task.findById(taskId)
      .select('project_id created_by assigned_to task_name');

    if (!task) {
      return res.status(404).json({ message: 'Công việc không tồn tại' });
    }

    // 3️⃣ Create Comment
    const comment = await TaskComment.create({
      task_id: taskId,
      user_id: userId,
      content
    });

    // 4️⃣ Snapshot user (từ Gateway)
    const userSnapshot = {
      _id: userId,
      name: req.user.name || req.user.email || 'Bạn',
      avatar: req.user.avatar || null
    };

    const result = {
      ...comment.toObject(),
      user: userSnapshot
    };

    // ✅ Response ngay
    res.status(201).json({
      message: 'Bình luận thành công',
      comment: result
    });

    // ==================================================
    // 🔔 NOTIFICATION: COMMENT (async)
    // ==================================================
    const notifyUserIds = new Set();

    if (task.assigned_to) notifyUserIds.add(task.assigned_to.toString());
    if (task.created_by) notifyUserIds.add(task.created_by.toString());

    // Không gửi cho chính người comment
    notifyUserIds.delete(userId);

    notifyUserIds.forEach(targetUserId => {
      http.notification.post('/', {
        user_id: targetUserId,
        reference_id: task._id,
        reference_model: 'Task',
        type: 'COMMENT',
        message: `${userSnapshot.name} đã bình luận trong công việc "${task.task_name}"`,
        should_send_mail: false
      }, {
        // 🔥 THÊM DÒNG NÀY - Forward token từ request gốc
        headers: { Authorization: req.headers.authorization }
      }).catch(console.warn);
    });

  } catch (error) {
    console.error('❌ Lỗi createComment:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};

/**
 * 📋 Lấy danh sách comment
 */
export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await TaskComment.find({ task_id: taskId })
      .sort({ created_at: 1 }) // Cũ nhất lên đầu (kiểu chat)
      .lean();

    if (comments.length === 0) return res.json([]);

    // 1. Lấy danh sách User ID cần fetch info
    const userIds = [...new Set(comments.map(c => c.user_id.toString()))];

    // 2. Gọi Auth Service (Bulk)
    let users = [];
    try {
        const { data } = await http.auth.post('/users/info', 
            { ids: userIds },
            { headers: { Authorization: req.headers.authorization } } // Forward token
        );
        users = data;
    } catch (e) {
        console.warn('⚠️ Fetch users for comments failed:', e.message);
        // Không return error, vẫn trả comment nhưng thiếu info user
    }

    // 3. Map user info vào comment
    const result = comments.map(c => {
        const user = users.find(u => u._id === c.user_id.toString());
        return {
            ...c,
            user: user || { _id: c.user_id, name: 'Người dùng ẩn' } // Fallback
        };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa comment
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await TaskComment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    // Check quyền: Chỉ chủ comment mới được xóa
    // (Bỏ qua check Task Creator để giảm query, trừ khi cần thiết)
    if (comment.user_id.toString() !== userId) {
        return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    await comment.deleteOne();
    res.json({ message: 'Đã xóa bình luận', id });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};