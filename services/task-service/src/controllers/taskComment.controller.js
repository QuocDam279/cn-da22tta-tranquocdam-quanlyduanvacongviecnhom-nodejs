import TaskComment from '../models/TaskComment.js';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';

/**
 * 💬 Tạo bình luận mới cho 1 task
 */
export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;     // ✅ Lấy taskId từ URL param
    const { content } = req.body;      // Nội dung comment từ body
    const user_id = req.user.id;

    // 1️⃣ Kiểm tra task tồn tại
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

    // 2️⃣ Tạo comment
    const comment = await TaskComment.create({
      task_id: taskId,   // ✅ dùng taskId từ param
      user_id,
      content
    });

    res.status(201).json({
      message: 'Thêm bình luận thành công',
      comment
    });
  } catch (error) {
    console.error('❌ Lỗi createComment:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy tất cả bình luận theo task
 */
export const getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await TaskComment.find({ task_id: taskId })
      .sort({ created_at: 1 })
      .lean();

    // Gọi Auth Service để lấy user info
    const userIds = [...new Set(comments.map(c => c.user_id.toString()))];
    let users = [];
    if (userIds.length > 0) {
      const { data } = await http.auth.post('/users/info', { ids: userIds });
      users = data;
    }

    const result = comments.map(c => ({
      ...c,
      user: users.find(u => u._id === c.user_id.toString()) || null
    }));

    res.json(result);
  } catch (error) {
    console.error('❌ Lỗi getCommentsByTask:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa bình luận
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;      // commentId
    const user_id = req.user.id;

    const comment = await TaskComment.findById(id);
    if (!comment)
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    const task = await Task.findById(comment.task_id);
    if (
      comment.user_id.toString() !== user_id &&   // người tạo comment
      task.created_by.toString() !== user_id     // người tạo task
    ) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
    }

    await comment.deleteOne();
    res.json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    console.error('❌ Lỗi deleteComment:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
