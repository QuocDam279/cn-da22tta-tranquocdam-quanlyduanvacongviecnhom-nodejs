import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // 🔥 Reference linh hoạt đến Task, Team, Project, Comment
  reference_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true // ID của Task, Team, hoặc Project
  },
  reference_model: { 
    type: String, 
    required: true, 
    enum: ['Task', 'Team', 'Project', 'Comment'] // Để biết ID trên thuộc bảng nào
  },
  type: {
    type: String,
    enum: [
      'INFO',           // Thông tin chung
      'WARNING',        // Cảnh báo
      'DEADLINE',       // Sắp đến hạn
      'INVITE',         // Mời vào team/project
      'MENTION',        // Nhắc đến (@mention)
      'COMMENT',        // 🔥 THÊM: Bình luận mới
      'ASSIGN',         // 🔥 THÊM: Giao việc
      'STATUS_CHANGE'   // 🔥 THÊM (tùy chọn): Thay đổi trạng thái
    ],
    default: 'INFO'
  },
  message: { 
    type: String, 
    required: true 
  },
  // 🔥 THÊM field này để hỗ trợ gửi email
  should_send_mail: {
    type: Boolean,
    default: false
  },
  is_read: { 
    type: Boolean, 
    default: false 
  },
  // 🔥 THÊM field để track thời điểm đọc
  read_at: {
    type: Date,
    default: null
  },
  sent_at: { 
    type: Date,
    default: Date.now // Tự động set thời gian gửi
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Index để tối ưu query
notificationSchema.index({ user_id: 1, is_read: 1 });
notificationSchema.index({ user_id: 1, created_at: -1 }); // 🔥 THÊM: Sort theo thời gian

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);