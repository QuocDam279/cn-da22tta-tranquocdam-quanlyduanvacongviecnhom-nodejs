import fs from 'fs';
import path from 'path';
import TaskAttachment from '../models/TaskAttachment.js';
import Task from '../models/Task.js';

/**
 * 📤 Upload file đính kèm vào task
 */
export const uploadAttachmentsMultiple = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    // Kiểm tra task tồn tại
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task không tồn tại' });

    // Lưu metadata cho từng file
    const attachments = [];
    for (const file of req.files) {
      const attachment = await TaskAttachment.create({
        task_id: taskId,
        file_name: file.originalname,
        file_path: file.path.replace(/\\/g, '/'),
        uploaded_by: userId
      });
      attachments.push(attachment);
    }

    return res.status(201).json({
      message: 'Tải file thành công',
      data: attachments
    });
  } catch (error) {
    console.error('Lỗi uploadAttachmentsMultiple:', error);
    res.status(500).json({ message: 'Lỗi server khi tải file' });
  }
};

/**
 * 📄 Lấy danh sách file của task
 */
export const getAttachmentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const attachments = await TaskAttachment.find({ task_id: taskId }).sort({ uploaded_at: -1 });

    res.status(200).json({
      message: 'Lấy danh sách file thành công',
      data: attachments
    });
  } catch (error) {
    console.error('Lỗi getAttachmentsByTask:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách file' });
  }
};

/**
 * ❌ Xóa file đính kèm
 */
export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attachment = await TaskAttachment.findById(id);
    if (!attachment) {
      return res.status(404).json({ message: 'File không tồn tại' });
    }

    // 🔍 Lấy thông tin task để kiểm tra quyền
    const task = await Task.findById(attachment.task_id);
    if (!task) {
      return res.status(404).json({ message: 'Task không tồn tại' });
    }

    // 🔒 Kiểm tra quyền: chỉ người upload hoặc người tạo task mới được xóa
    if (attachment.uploaded_by.toString() !== userId && task.created_by.toString() !== userId) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa file này' });
    }

    // 🗑 Xóa vật lý file
    try {
      fs.unlinkSync(path.resolve(attachment.file_path));
    } catch (err) {
      console.warn('⚠ Không tìm thấy file vật lý để xóa:', err.message);
    }

    // 🧹 Xóa metadata DB
    await attachment.deleteOne();

    res.status(200).json({ message: 'Xóa file thành công' });
  } catch (error) {
    console.error('Lỗi deleteAttachment:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa file' });
  }
};
