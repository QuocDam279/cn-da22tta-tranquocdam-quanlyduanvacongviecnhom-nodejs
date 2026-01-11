import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  project_name: { 
    type: String, 
    required: true,
    trim: true  // Loại bỏ khoảng trắng thừa
  },
  description: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// ✅ Compound unique index: Tên dự án phải unique trong 1 team
projectSchema.index({ team_id: 1, project_name: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;