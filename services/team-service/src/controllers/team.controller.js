// controllers/team.controller.js
import http from '../utils/httpClient.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import ActivityLogger from '../utils/activityLogger.js';


/**
 * 🧱 Tạo team mới
 */
export const createTeam = async (req, res) => {
  try {
    const { team_name, description } = req.body;
    const created_by = req.user.id;

    const team = await Team.create({ team_name, description, created_by });
    await TeamMember.create({ team_id: team._id, user_id: created_by, role: 'leader' });

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTeamCreated(created_by, team._id, team_name);

    res.status(201).json({ message: 'Tạo team thành công', team });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy danh sách team của user
 */
export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Lấy các team mà user đang tham gia
    const myTeamMembers = await TeamMember.find({ user_id: userId });
    const teamIds = myTeamMembers.map(tm => tm.team_id);

    // 2️⃣ Lấy thông tin team
    const teams = await Team.find({ _id: { $in: teamIds } });

    // 3️⃣ Đếm số thành viên cho từng team
    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return {
          ...team.toObject(),
          memberCount: count
        };
      })
    );

    res.json(teamsWithMemberCount);
  } catch (error) {
    console.error("❌ Lỗi getMyTeams:", error.message);
    res.status(500).json({ message: 'Lỗi của server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết team
 */
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    const members = await TeamMember.find({ team_id: team._id });
    if (members.length === 0) return res.json({ team, members: [] });

    const userIds = members.map(m => m.user_id);
    const { data: users } = await http.auth.post('/users/info', { ids: userIds });

    const membersWithUser = members.map(m => ({
      ...m.toObject(),
      user: users.find(u => u._id === m.user_id.toString()) || null
    }));

    res.json({ team, members: membersWithUser });
  } catch (error) {
    console.error('❌ Lỗi getTeamById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ➕ Thêm thành viên vào team
 */
export const addMembers = async (req, res) => {
  try {
    const { user_ids, role } = req.body;
    const { id } = req.params; // team_id

    const addedMembers = [];

    // Lấy thông tin user để có tên
    const { data: users } = await http.auth.post('/users/info', { ids: user_ids });

    for (const user_id of user_ids) {
      const exists = await TeamMember.findOne({ team_id: id, user_id });
      if (!exists) {
        const member = await TeamMember.create({ team_id: id, user_id, role });
        addedMembers.push(member);

        // Ghi log cho từng thành viên được thêm
        const user = users.find(u => u._id === user_id);
        const memberName = user ? user.name || user.email : user_id;
        await ActivityLogger.logTeamMemberAdded(req.user.id, id, memberName);
      }
    }

    res.status(201).json({ message: 'Thêm thành viên thành công', members: addedMembers });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ❌ Xóa thành viên khỏi team
 */
export const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params; // id = team_id, uid = user_id

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    // Chỉ người tạo nhóm mới được xóa thành viên
    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên này' });

    // Lấy thông tin user trước khi xóa
    const { data: users } = await http.auth.post('/users/info', { ids: [uid] });
    const memberName = users[0] ? (users[0].name || users[0].email) : uid;

    await TeamMember.findOneAndDelete({ team_id: id, user_id: uid });

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTeamMemberRemoved(req.user.id, id, memberName);

    res.json({ message: 'Xóa thành viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật thông tin team
 */
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, description } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền sửa team này' });

    // Lưu các thay đổi
    const changes = {};
    if (team_name && team_name !== team.team_name) changes.team_name = team_name;
    if (description && description !== team.description) changes.description = description;

    team.team_name = team_name || team.team_name;
    team.description = description || team.description;
    await team.save();

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTeamUpdated(req.user.id, id, changes);

    res.json({ message: 'Cập nhật team thành công', team });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa team
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa team này' });

    const teamName = team.team_name;

    await TeamMember.deleteMany({ team_id: id });
    await team.deleteOne();

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTeamDeleted(req.user.id, id, teamName);

    res.json({ message: 'Xóa team thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🏃 Rời nhóm (cho thành viên bình thường)
 */
export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params; // id = team_id
    const user_id = req.user.id;

    // Lấy thông tin team trước khi rời
    const team = await Team.findById(id);
    const teamName = team ? team.team_name : '';

    // Xóa bản ghi TeamMember của chính user
    const member = await TeamMember.findOneAndDelete({ team_id: id, user_id });

    if (!member) return res.status(404).json({ message: "Bạn không phải thành viên của nhóm" });

    // 🧾 Ghi log hoạt động
    await ActivityLogger.logTeamLeft(user_id, id, teamName);

    res.json({ message: "Rời nhóm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * 👑 Lấy danh sách team mà user là leader
 */
export const getLeaderTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Tìm các team mà user là leader
    const leaderRecords = await TeamMember.find({
      user_id: userId,
      role: 'leader'
    });

    const leaderTeamIds = leaderRecords.map(r => r.team_id);

    // 2️⃣ Lấy thông tin team
    const teams = await Team.find({ _id: { $in: leaderTeamIds } });

    // 3️⃣ Đếm số thành viên
    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return {
          ...team.toObject(),
          memberCount: count
        };
      })
    );

    res.json(teamsWithMemberCount);
  } catch (error) {
    console.error("❌ Lỗi getLeaderTeams:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * GET /batch?ids=...
 * Lấy nhiều team theo danh sách id, kèm số lượng thành viên
 */
export const getTeamsBatch = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });

    const idArray = ids.split(',');
    const teams = await Team.find({ _id: { $in: idArray } });

    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return {
          ...team.toObject(),
          memberCount: count
        };
      })
    );

    res.json({ success: true, data: teamsWithMemberCount });
  } catch (err) {
    console.error('❌ Lỗi getTeamsBatch:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch teams', error: err.message });
  }
};