import mongoose from 'mongoose';

const taskAttachmentSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  file_name: { type: String, required: true },
  file_path: { type: String, required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaded_at: { type: Date, default: Date.now }
});

taskAttachmentSchema.index({ task_id: 1 });

export default mongoose.models.TaskAttachment || mongoose.model('TaskAttachment', taskAttachmentSchema);
