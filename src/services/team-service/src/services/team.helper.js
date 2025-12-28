import TeamMember from '../models/TeamMember.js';
import http from '../utils/httpClient.js';

// Gắn số lượng thành viên vào danh sách Team (Fix N+1 Query)
export const attachMemberCounts = async (teams) => {
  if (!teams?.length) return [];
  
  const teamIds = teams.map(t => t._id);
  const memberCounts = await TeamMember.aggregate([
    { $match: { team_id: { $in: teamIds } } },
    { $group: { _id: "$team_id", count: { $sum: 1 } } }
  ]);

  const countMap = {};
  memberCounts.forEach(c => countMap[c._id.toString()] = c.count);

  return teams.map(team => ({
    ...team,
    memberCount: countMap[team._id.toString()] || 0
  }));
};

// Populate thông tin User từ Auth Service cho danh sách Members
export const populateMembersWithUsers = async (members, authHeader) => {
  if (!members?.length) return [];
  
  const userIds = members.map(m => m.user_id);
  try {
    const { data: users } = await http.auth.post('/users/info', 
      { ids: userIds },
      { headers: { Authorization: authHeader } }
    );
    
    return members.map(m => {
      const user = users.find(u => u._id === m.user_id.toString());
      return { ...m, user: user || null };
    });
  } catch (e) {
    console.warn('Populate users failed:', e.message);
    return members;
  }
};

/**
 * 🆕 Unassign tất cả Task của user trong các Project thuộc Team
 * @param {String} userId - ID người dùng bị xóa/rời nhóm
 * @param {String} teamId - ID của nhóm
 * @param {String} authHeader - Authorization header
 */
export const unassignUserTasksInTeam = async (userId, teamId, authHeader) => {
  if (!userId || !teamId) return;
  
  try {
    // Gọi Task Service để unassign tất cả task của user trong team này
    await http.task.patch(`/unassign-by-team`, 
      { user_id: userId, team_id: teamId },
      { 
        headers: { 
          Authorization: authHeader,
          'x-api-key': process.env.INTERNAL_API_KEY 
        } 
      }
    );
    
    console.log(`✅ Đã unassign tasks của user ${userId} trong team ${teamId}`);
  } catch (err) {
    console.error(`⚠️ Lỗi unassign tasks cho user ${userId}:`, err.message);
  }
};