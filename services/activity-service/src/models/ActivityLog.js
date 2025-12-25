import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  user_name: { type: String, required: false }, 
  user_avatar: { type: String, required: false },

  action: { type: String, required: true, trim: true },
  
  related_id: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },
  related_type: { type: String, default: 'task' }, 
  related_name: { type: String, required: false },

  team_id: { type: mongoose.Schema.Types.ObjectId, required: false, index: true },

  created_at: { type: Date, default: Date.now }
});

// Indexes
activityLogSchema.index({ user_id: 1, created_at: -1 });
activityLogSchema.index({ team_id: 1, created_at: -1 });
activityLogSchema.index({ related_id: 1, related_type: 1 });
activityLogSchema.index({ created_at: 1 }, { expireAfterSeconds: 7776000 }); // 90 ngày

// 🔥 QUAN TRỌNG: Kiểm tra model đã tồn tại chưa để tránh lỗi "OverwriteModelError" khi hot-reload
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// 🔥 QUAN TRỌNG: Phải dùng export default
export default ActivityLog;