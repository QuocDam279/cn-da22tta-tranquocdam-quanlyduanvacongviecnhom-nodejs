// services/task-service/src/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  project_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  task_name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String 
  },
  assigned_to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  created_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  start_date: { 
    type: Date 
  },
  due_date: { 
    type: Date 
  },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Done'], 
    default: 'To Do' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  progress: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  // 🔥 THÊM MỚI: team_id để ghi log theo nhóm
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false, // Sẽ tự động điền khi tạo task
    index: true
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// ✅ Index giúp tăng tốc truy vấn
taskSchema.index({ project_id: 1 });
taskSchema.index({ assigned_to: 1 });
taskSchema.index({ team_id: 1 }); // 🔥 Index mới cho team_id

export default mongoose.models.Task || mongoose.model('Task', taskSchema);