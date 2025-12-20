import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  project_name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
