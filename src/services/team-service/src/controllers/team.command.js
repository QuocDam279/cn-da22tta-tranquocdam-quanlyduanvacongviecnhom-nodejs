import Team from '../models/Team.js';
import TeamMember from '../models/TeamMember.js';
import http from '../utils/httpClient.js';

// --- CREATE ---
export const createTeam = async (req, res) => {
  let createdTeam = null;
  try {
    const { team_name, description } = req.body;
    const created_by = req.user.id;

    // Manual Transaction: Create Team -> Create Leader
    const newTeam = await Team.create({ team_name, description, created_by });
    createdTeam = newTeam; 
    
    await TeamMember.create({ team_id: newTeam._id, user_id: created_by, role: 'leader' });

    res.status(201).json({ message: 'Tạo team thành công', team: newTeam });
  } catch (error) {
    // Manual Rollback
    if (createdTeam) await Team.findByIdAndDelete(createdTeam._id).catch(() => {});
    res.status(500).json({ message: 'Lỗi tạo team', error: error.message });
  }
};

// --- MEMBER ACTIONS ---
export const addMembers = async (req, res) => {
  try {
    const { user_ids, role } = req.body;
    const { id: team_id } = req.params;
    const authHeader = req.headers.authorization;

    if (!Array.isArray(user_ids) || !user_ids.length) return res.status(400).json({ message: 'Invalid user_ids' });

    const team = await Team.findById(team_id).select('team_name');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // 1️⃣ Logic thêm thành viên vào DB (Giữ nguyên)
    const membersToInsert = user_ids.map(uid => ({ team_id, user_id: uid, role: role || 'member' }));
    
    let addedCount = 0;
    try {
      const result = await TeamMember.insertMany(membersToInsert, { ordered: false });
      addedCount = result.length;
    } catch (e) {
      addedCount = e.insertedDocs ? e.insertedDocs.length : 0;
    }

    res.status(201).json({ message: 'Added members', addedCount, skippedCount: user_ids.length - addedCount });

    // =================================================================
    // 🔥 SỬA ĐOẠN NÀY: Lấy tên Leader để thông báo cho đẹp
    // =================================================================
    let leaderName = req.user.email; // Mặc định dùng email (fallback)

    try {
      // Gọi Auth Service lấy thông tin người đang thao tác (chính là req.user.id)
      const { data: users } = await http.auth.post('/users/info', { 
        ids: [req.user.id] 
      }, { 
        headers: { Authorization: authHeader, 'x-api-key': process.env.INTERNAL_API_KEY } 
      });
      
      if (users && users[0] && users[0].full_name) {
        leaderName = users[0].full_name;
      }
    } catch (err) {
      console.warn('⚠️ Không lấy được tên leader, dùng email thay thế:', err.message);
    }

    // 2️⃣ Gửi Notification với tên chuẩn (Async)
    user_ids.forEach(uid => {
      if (uid === req.user.id) return;
      
      http.notification.post('/', {
        user_id: uid, 
        reference_id: team_id, 
        reference_model: 'Team', 
        type: 'INVITE',
        // ✅ Dùng leaderName thay vì req.user.name
        message: `${leaderName} đã thêm bạn vào nhóm "${team.team_name}"`, 
        should_send_mail: true
      }, { 
        headers: { Authorization: authHeader, 'x-api-key': process.env.INTERNAL_API_KEY } 
      }).catch(err => console.error("Notify failed:", err.message));
    });

  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Server Error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id: team_id, uid: user_id } = req.params;
    const team = await Team.findById(team_id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.created_by.toString() !== req.user.id) return res.status(403).json({ message: 'Only Leader can remove members' });

    await TeamMember.findOneAndDelete({ team_id, user_id });

    res.json({ message: 'Member removed' });

    // Async Notify (Giữ lại để user biết mình bị xóa)
    http.notification.post('/', {
      user_id, reference_id: team_id, reference_model: 'Team', type: 'WARNING',
      message: `Bạn đã bị xóa khỏi nhóm "${team.team_name}"`, should_send_mail: true
    }, { headers: { Authorization: req.headers.authorization } }).catch(() => {});

  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const leaveTeam = async (req, res) => {
  try {
    const { id: team_id } = req.params;
    const deleted = await TeamMember.findOneAndDelete({ team_id, user_id: req.user.id });
    
    if (!deleted) return res.status(404).json({ message: "Not a member" });
    res.json({ message: "Left team successfully" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- UPDATE & DELETE ---
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, description } = req.body;
    const team = await Team.findById(id);
    
    if (!team) return res.status(404).json({ message: 'Not found' });
    if (team.created_by.toString() !== req.user.id) return res.status(403).json({ message: 'No permission' });

    const changes = {};
    if (team_name && team_name !== team.team_name) changes.team_name = team_name;
    if (description && description !== team.description) changes.description = description;

    if (Object.keys(changes).length > 0) {
      Object.assign(team, changes);
      await team.save();
    }

    res.json({ message: 'Updated', team });
  } catch (e) { res.status(500).json({ message: 'Server Error' }); }
};

export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Not found' });
    if (team.created_by.toString() !== req.user.id) return res.status(403).json({ message: 'No permission' });

    // Cascade Delete
    await Promise.all([
      team.deleteOne(),
      TeamMember.deleteMany({ team_id: id }),
      http.project.delete(`/cascade/team/${id}`, { headers: { Authorization: req.headers.authorization } }).catch(() => {})
    ]);

    res.json({ message: 'Team and related data deleted' });
  } catch (e) { res.status(500).json({ message: 'Server Error' }); }
};