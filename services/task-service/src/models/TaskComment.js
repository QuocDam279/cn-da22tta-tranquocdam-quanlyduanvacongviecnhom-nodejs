import mongoose from 'mongoose';

const taskCommentSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// 🔍 Index để tối ưu truy vấn comment theo task
taskCommentSchema.index({ task_id: 1 });

export default mongoose.models.TaskComment || mongoose.model('TaskComment', taskCommentSchema);
