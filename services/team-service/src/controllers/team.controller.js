// controllers/team.controller.js
import http from '../utils/httpClient.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';

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
    try {
      await http.activity.post(
        '/',
        {
          user_id: created_by,
          action: `Tạo nhóm mới: ${team_name}`,
          related_id: team._id,
          related_type: 'team'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn('⚠ Không thể ghi activity log (createTeam):', logErr.message);
    }

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
          memberCount: count // số thành viên thực tế
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
    const { user_ids, role } = req.body; // user_ids = [id1, id2,...]
    const { id } = req.params; // team_id

    const addedMembers = [];

    for (const user_id of user_ids) {
      const exists = await TeamMember.findOne({ team_id: id, user_id });
      if (!exists) {
        const member = await TeamMember.create({ team_id: id, user_id, role });
        addedMembers.push(member);
      }
    }

    // ghi log chung
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Thêm thành viên [${user_ids.join(', ')}] vào nhóm ID ${id}`,
          related_id: id,
          related_type: 'team'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn('⚠ Không thể ghi activity log (addMembers):', logErr.message);
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

    await TeamMember.findOneAndDelete({ team_id: id, user_id: uid });

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Xóa thành viên ${uid} khỏi nhóm ID ${id}`,
          related_id: id,
          related_type: 'team'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn('⚠ Không thể ghi activity log (removeMember):', logErr.message);
    }

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

    team.team_name = team_name || team.team_name;
    team.description = description || team.description;
    await team.save();

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Cập nhật thông tin nhóm: ${team.team_name}`,
          related_id: team._id,
          related_type: 'team'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn('⚠ Không thể ghi activity log (updateTeam):', logErr.message);
    }

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

    await TeamMember.deleteMany({ team_id: id });
    await team.deleteOne();

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        '/',
        {
          user_id: req.user.id,
          action: `Xóa nhóm: ${team.team_name}`,
          related_id: id,
          related_type: 'team'
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn('⚠ Không thể ghi activity log (deleteTeam):', logErr.message);
    }

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

    // Xóa bản ghi TeamMember của chính user
    const member = await TeamMember.findOneAndDelete({ team_id: id, user_id });

    if (!member) return res.status(404).json({ message: "Bạn không phải thành viên của nhóm" });

    // 🧾 Ghi log hoạt động
    try {
      await http.activity.post(
        "/",
        {
          user_id,
          action: `Rời nhóm ID ${id}`,
          related_id: id,
          related_type: "team"
        },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (logErr) {
      console.warn("⚠ Không thể ghi activity log (leaveTeam):", logErr.message);
    }

    res.json({ message: "Rời nhóm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};