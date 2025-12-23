import http from '../utils/httpClient.js';
import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import ActivityLogger from '../utils/activityLogger.js';

/**
 * 🧱 Tạo team mới
 * ⚡ Tối ưu: Phản hồi ngay, Log chạy ngầm
 */
export const createTeam = async (req, res) => {
  try {
    const { team_name, description } = req.body;
    const created_by = req.user.id;

    const team = await Team.create({ team_name, description, created_by });
    
    // Tạo leader ngay lập tức
    await TeamMember.create({ team_id: team._id, user_id: created_by, role: 'leader' });

    // ✅ Phản hồi ngay
    res.status(201).json({ message: 'Tạo team thành công', team });

    // ⚡ Log chạy ngầm
    ActivityLogger.logTeamCreated(created_by, team._id, team_name)
      .catch(e => console.warn('Log failed:', e.message));

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

    // 1. Lấy team user tham gia
    const myTeamMembers = await TeamMember.find({ user_id: userId }).lean();
    const teamIds = myTeamMembers.map(tm => tm.team_id);

    // 2. Lấy thông tin team
    const teams = await Team.find({ _id: { $in: teamIds } }).lean();

    // 3. Đếm số thành viên (Chạy song song)
    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return { ...team, memberCount: count };
      })
    );

    res.json(teamsWithMemberCount);
  } catch (error) {
    console.error("❌ Lỗi getMyTeams:", error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết team
 */
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).lean();
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    const members = await TeamMember.find({ team_id: team._id }).lean();
    
    if (members.length === 0) return res.json({ team, members: [] });

    // Gọi Auth service lấy thông tin user
    const userIds = members.map(m => m.user_id);
    const { data: users } = await http.auth.post('/users/info', { ids: userIds });

    const membersWithUser = members.map(m => ({
      ...m,
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
 * ⚡ Tối ưu: Dùng Promise.all thay vì vòng lặp for
 */
export const addMembers = async (req, res) => {
  try {
    const { user_ids, role } = req.body;
    const { id } = req.params; // team_id
    const currentUserId = req.user.id;

    // 1. Lấy thông tin users 1 lần duy nhất (giảm request)
    const { data: users } = await http.auth.post('/users/info', { ids: user_ids });

    const addedMembers = [];
    const logPromises = [];

    // 2. Xử lý song song (Parallel Processing)
    await Promise.all(user_ids.map(async (user_id) => {
        // Check tồn tại (có thể tối ưu hơn bằng cách lấy list existing members trước, nhưng thế này an toàn hơn)
        const exists = await TeamMember.findOne({ team_id: id, user_id });
        if (!exists) {
            const member = await TeamMember.create({ team_id: id, user_id, role });
            addedMembers.push(member);

            // Chuẩn bị log (nhưng chưa chạy ngay để tránh block)
            const user = users.find(u => u._id === user_id);
            const memberName = user ? user.name || user.email : user_id;
            
            logPromises.push(
                ActivityLogger.logTeamMemberAdded(currentUserId, id, memberName)
            );
        }
    }));

    // ✅ Phản hồi ngay
    res.status(201).json({ message: 'Thêm thành viên thành công', members: addedMembers });

    // ⚡ Chạy log ngầm
    Promise.all(logPromises).catch(e => console.warn('Log members failed', e));

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ❌ Xóa thành viên khỏi team
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa thành viên này' });

    // Lấy tên user để log (Không await để block, nhưng cần lấy trước khi xoá nếu cần chính xác)
    // Ở đây ta chấp nhận gọi auth service để lấy tên
    const userPromise = http.auth.post('/users/info', { ids: [uid] }).catch(() => ({ data: [] }));
    
    await TeamMember.findOneAndDelete({ team_id: id, user_id: uid });

    // ✅ Phản hồi ngay
    res.json({ message: 'Xóa thành viên thành công' });

    // ⚡ Log chạy ngầm
    userPromise.then(({ data }) => {
        const memberName = data[0] ? (data[0].name || data[0].email) : uid;
        ActivityLogger.logTeamMemberRemoved(req.user.id, id, memberName).catch(console.warn);
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật thông tin team
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, description } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền sửa team này' });

    const changes = {};
    if (team_name && team_name !== team.team_name) changes.team_name = team_name;
    if (description && description !== team.description) changes.description = description;

    team.team_name = team_name || team.team_name;
    team.description = description || team.description;
    await team.save();

    // ✅ Phản hồi ngay
    res.json({ message: 'Cập nhật team thành công', team });

    // ⚡ Log chạy ngầm
    if (Object.keys(changes).length > 0) {
        ActivityLogger.logTeamUpdated(req.user.id, id, changes).catch(console.warn);
    }

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa team
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Không tìm thấy team' });

    if (team.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa team này' });

    const teamName = team.team_name;

    // 🔥 XÓA SONG SONG: Team, Members, và gọi Project Service xóa projects
    await Promise.all([
      // 1. Xóa team members
      TeamMember.deleteMany({ team_id: id }),
      
      // 2. Xóa team
      team.deleteOne(),
      
      // 3. Gọi Project Service để xóa tất cả projects (và cascade xóa tasks)
      http.project.delete(`/cascade/team/${id}`, {
        headers: { Authorization: req.headers.authorization }
      }).catch(err => {
        console.warn('⚠️ Không xóa được projects của team:', err.message);
        // Không throw error để team vẫn bị xóa
      })
    ]);

    // ✅ Phản hồi ngay
    res.json({ message: 'Xóa team và các dự án liên quan thành công' });

    // ⚡ Log chạy ngầm
    ActivityLogger.logTeamDeleted(req.user.id, id, teamName).catch(console.warn);

  } catch (error) {
    console.error('❌ Lỗi deleteTeam:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🏃 Rời nhóm
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const leaveTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const team = await Team.findById(id);
    const teamName = team ? team.team_name : '';

    const member = await TeamMember.findOneAndDelete({ team_id: id, user_id });

    if (!member) return res.status(404).json({ message: "Bạn không phải thành viên của nhóm" });

    // ✅ Phản hồi ngay
    res.json({ message: "Rời nhóm thành công" });

    // ⚡ Log chạy ngầm
    ActivityLogger.logTeamLeft(user_id, id, teamName).catch(console.warn);

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

    const leaderRecords = await TeamMember.find({ user_id: userId, role: 'leader' }).lean();
    const leaderTeamIds = leaderRecords.map(r => r.team_id);

    const teams = await Team.find({ _id: { $in: leaderTeamIds } }).lean();

    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return { ...team, memberCount: count };
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
 */
export const getTeamsBatch = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });

    const idArray = ids.split(',');
    const teams = await Team.find({ _id: { $in: idArray } }).lean();

    const teamsWithMemberCount = await Promise.all(
      teams.map(async (team) => {
        const count = await TeamMember.countDocuments({ team_id: team._id });
        return { ...team, memberCount: count };
      })
    );

    res.json({ success: true, data: teamsWithMemberCount });
  } catch (err) {
    console.error('❌ Lỗi getTeamsBatch:', err.message);
    res.status(500).json({ success: false, message: 'Failed', error: err.message });
  }
};