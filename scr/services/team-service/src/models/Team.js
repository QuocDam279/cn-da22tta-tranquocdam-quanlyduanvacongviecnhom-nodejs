import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  team_name: { type: String, required: true },
  description: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('Team', teamSchema);
