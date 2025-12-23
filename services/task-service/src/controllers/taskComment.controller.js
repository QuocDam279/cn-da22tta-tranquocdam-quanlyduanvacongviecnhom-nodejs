import TaskComment from '../models/TaskComment.js';
import Task from '../models/Task.js';
import http from '../utils/httpClient.js';

/**
 * 💬 Tạo bình luận mới (Có kiểm tra thành viên)
 */
export const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 1️⃣ Kiểm tra task tồn tại
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Không tìm thấy công việc' });

    // 2️⃣ (MỚI) Kiểm tra quyền: User có thuộc Team của Project này không?
    try {
        // Lấy thông tin Project để biết Team ID
        const { data: project } = await http.project.get(`/${task.project_id}`, {
            headers: { Authorization: req.headers.authorization }
        });

        if (!project || !project.team_id) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin dự án' });
        }

        // Lấy thông tin Team để kiểm tra danh sách thành viên
        const { data: teamData } = await http.team.get(`/${project.team_id}`, {
            headers: { Authorization: req.headers.authorization }
        });

        // Kiểm tra ID user có trong danh sách members không
        const members = teamData.members || [];
        // Lưu ý: member.user_id có thể là object hoặc string tùy vào populate bên team service
        const isMember = members.some(m => {
            const mId = m.user_id._id || m.user_id;
            return mId.toString() === userId;
        });

        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải thành viên của dự án này' });
        }

    } catch (err) {
        console.error("❌ Lỗi check quyền comment:", err.message);
        return res.status(500).json({ message: 'Lỗi xác thực quyền bình luận' });
    }

    // 3️⃣ Tạo comment
    const comment = await TaskComment.create({
      task_id: taskId,
      user_id: userId,
      content
    });

    // 4️⃣ (Tùy chọn) Populate thông tin user ngay để trả về frontend hiển thị luôn
    // Ở đây mình fake object user để frontend đỡ phải fetch lại
    const commentWithUser = {
        ...comment.toObject(),
        user: { _id: userId, name: "Bạn" } // Frontend sẽ tự load lại hoặc dùng cache user hiện tại
    };

    res.status(201).json({
      message: 'Thêm bình luận thành công',
      comment: commentWithUser
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

    if (comments.length === 0) return res.json([]);

    // Gọi Auth Service để lấy user info (Batch request)
    const userIds = [...new Set(comments.map(c => c.user_id.toString()))];
    
    let users = [];
    if (userIds.length > 0) {
      try {
          const { data } = await http.auth.post('/users/info', { ids: userIds });
          users = data;
      } catch (e) {
          console.warn("⚠️ Không lấy được thông tin user comment", e.message);
      }
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
    const { id } = req.params; // commentId
    const userId = req.user.id;

    const comment = await TaskComment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Không tìm thấy bình luận' });

    const task = await Task.findById(comment.task_id);
    
    // Quyền xóa: (Người viết comment) HOẶC (Người tạo task)
    // Nâng cao: Có thể check thêm (Leader Team) nếu muốn
    const isAuthor = comment.user_id.toString() === userId;
    const isTaskCreator = task && task.created_by.toString() === userId;

    if (!isAuthor && !isTaskCreator) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này' });
    }

    await comment.deleteOne();
    res.json({ message: 'Xóa bình luận thành công', id }); // Trả về ID để frontend filter
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};