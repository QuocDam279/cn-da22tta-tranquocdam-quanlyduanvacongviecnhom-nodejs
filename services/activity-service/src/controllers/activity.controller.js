import ActivityLog from '../models/ActivityLog.js';
import http from '../utils/httpClient.js';

// ==================================================================
// CREATE LOG (Được gọi từ Task Service)
// ==================================================================
export const createActivityLog = async (req, res) => {
  try {
    const { 
      user_id, user_name, user_avatar, 
      action, 
      related_id, related_name,
      team_id 
    } = req.body;

    // Validate cơ bản
    if (!user_id || !action || !team_id) {
       return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc (user_id, action, team_id)' });
    }

    const activityLog = await ActivityLog.create({
      user_id,
      user_name,
      user_avatar,
      action,
      related_id,
      related_type: 'task',
      related_name,
      team_id // Quan trọng: lưu cái này để filter theo nhóm
    });

    res.status(201).json({ success: true, data: activityLog });
  } catch (error) {
    console.error('❌ Create activity log error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================================================================
// GET TEAM ACTIVITIES (Trưởng nhóm/Thành viên xem log của nhóm)
// ==================================================================
export const getTeamActivities = async (req, res) => {
  try {
    const { team_id } = req.params;
    const { limit = 30, page = 1 } = req.query;
    const authHeader = req.headers.authorization;

    // 🔒 BƯỚC 1: KIỂM TRA QUYỀN (Gọi sang Team Service)
    // Activity Service không biết ai thuộc nhóm nào, nên phải hỏi Team Service
    try {
      // Gọi API lấy chi tiết team (bao gồm members)
      const { data: teamData } = await http.team.get(`/${team_id}`, {
        headers: { Authorization: authHeader }
      });

      // Cấu trúc response thường là { members: [...] } hoặc { team: { members: [...] } }
      // Bạn cần kiểm tra log response của Team Service để trỏ đúng
      const members = teamData.members || teamData.team?.members || [];
      
      const isMember = members.some(m => 
        (m.user_id._id || m.user_id).toString() === req.user.id
      );

      if (!isMember) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không phải thành viên của nhóm này' 
        });
      }
    } catch (teamError) {
      console.error('❌ Lỗi khi gọi Team Service:', teamError.message);
      // Nếu Team Service chết hoặc trả về 404
      if (teamError.response?.status === 404) {
         return res.status(404).json({ success: false, message: 'Nhóm không tồn tại' });
      }
      return res.status(500).json({ success: false, message: 'Không thể xác thực quyền truy cập nhóm' });
    }

    // 🔒 BƯỚC 2: QUERY DATABASE
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityLog.find({ team_id })
      .sort({ created_at: -1 }) // Mới nhất lên đầu
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments({ team_id });

    // Format dữ liệu trả về
    const formattedData = activities.map(act => ({
      _id: act._id,
      action: act.action,
      created_at: act.created_at,
      related_info: {
        id: act.related_id,
        name: act.related_name,
        type: act.related_type
      },
      user_info: {
        _id: act.user_id,
        full_name: act.user_name,
        avatar: act.user_avatar
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        page: parseInt(page),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get team activities error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================================================================
// GET USER ACTIVITIES (Cá nhân xem log của mình)
// ==================================================================
export const getUserActivities = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 30, page = 1 } = req.query;

    // 🔒 Security Check
    if (req.user.id !== user_id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await ActivityLog.find({ user_id })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityLog.countDocuments({ user_id });

    const formattedData = activities.map(act => ({
      ...act,
      user_info: {
        full_name: act.user_name,
        avatar: act.user_avatar
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        page: parseInt(page),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};