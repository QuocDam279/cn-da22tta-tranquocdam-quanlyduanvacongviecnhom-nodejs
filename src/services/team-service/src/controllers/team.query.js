import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import { attachMemberCounts, populateMembersWithUsers } from '../services/team.helper.js';

export const getMyTeams = async (req, res) => {
  try {
    const myMemberships = await TeamMember.find({ user_id: req.user.id }).select('team_id').lean();
    if (!myMemberships.length) return res.json([]);

    const teams = await Team.find({ _id: { $in: myMemberships.map(m => m.team_id) } }).lean();
    const result = await attachMemberCounts(teams);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getLeaderTeams = async (req, res) => {
  try {
    const leaderRecords = await TeamMember.find({ user_id: req.user.id, role: 'leader' }).select('team_id').lean();
    if (!leaderRecords.length) return res.json([]);

    const teams = await Team.find({ _id: { $in: leaderRecords.map(r => r.team_id) } }).lean();
    const result = await attachMemberCounts(teams);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getTeamsBatch = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });

    const teams = await Team.find({ _id: { $in: ids.split(',').filter(Boolean) } }).lean();
    const result = await attachMemberCounts(teams);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const [team, members] = await Promise.all([
      Team.findById(id).lean(),
      TeamMember.find({ team_id: id }).lean()
    ]);

    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    const membersWithUser = await populateMembersWithUsers(members, req.headers.authorization);
    res.json({ team, members: membersWithUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};