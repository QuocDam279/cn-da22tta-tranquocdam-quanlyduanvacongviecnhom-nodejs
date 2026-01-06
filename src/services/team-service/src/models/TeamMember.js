import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['leader', 'member'], default: 'member' },
  joined_at: { type: Date, default: Date.now }
});

teamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true });

export default mongoose.model('TeamMember', teamMemberSchema);
