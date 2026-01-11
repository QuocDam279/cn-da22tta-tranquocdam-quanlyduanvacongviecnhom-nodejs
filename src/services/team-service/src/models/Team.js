import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  team_name: { 
    type: String, 
    required: true,
    unique: true,  // ✅ Đảm bảo tên không trùng ở DB level
    trim: true     // Loại bỏ khoảng trắng thừa
  },
  description: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

// Index để tìm kiếm nhanh hơn
teamSchema.index({ team_name: 1 });

export default mongoose.model('Team', teamSchema);