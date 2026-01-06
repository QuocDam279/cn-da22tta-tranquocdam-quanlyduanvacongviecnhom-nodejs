import http from '../utils/httpClient.js';

// Helper: Lấy thông tin User (Creator) cho danh sách Project
export const populateProjectsWithUsers = async (projects, authHeader) => {
  if (!projects?.length) return [];
  
  const userIds = new Set();
  projects.forEach(p => {
    if (p.created_by) userIds.add(p.created_by.toString());
  });

  if (userIds.size === 0) return projects;

  try {
    const { data: users } = await http.auth.post('/users/info', 
      { ids: Array.from(userIds) },
      { headers: { Authorization: authHeader } }
    );

    return projects.map(project => {
      const p = project.toObject ? project.toObject() : project; 
      const user = users.find(u => u._id === p.created_by?.toString());
      p.created_by = user || p.created_by;
      return p;
    });
  } catch (error) {
    console.warn('⚠️ Populate users failed:', error.message);
    return projects;
  }
};