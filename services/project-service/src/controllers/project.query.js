import Project from '../models/Project.js';
import http from '../utils/httpClient.js';
import { populateProjectsWithUsers } from '../services/project.helper.js';

export const getProjectsByTeam = async (req, res) => {
  try {
    const projects = await Project.find({ team_id: req.params.teamId }).sort({ created_at: -1 });
    const enrichedProjects = await populateProjectsWithUsers(projects, req.headers.authorization);
    res.json(enrichedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    // 1. Gọi Team Service để lấy danh sách team của user
    const { data: teams } = await http.team.get('/', { headers: { Authorization: req.headers.authorization } });
    const teamIds = teams.map(t => t._id);

    // 2. Query Project DB
    const projects = await Project.find({ team_id: { $in: teamIds } }).sort({ created_at: -1 });
    
    // 3. Enrich User Info
    const enrichedProjects = await populateProjectsWithUsers(projects, req.headers.authorization);
    res.json(enrichedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });

    // Parallel Fetching: Team Service + Auth Service
    const [teamRes, authRes] = await Promise.all([
        http.team.get(`/${project.team_id}`, { headers: { Authorization: req.headers.authorization } }).catch(() => ({ data: null })), 
        http.auth.post('/users/info', { ids: [project.created_by] }, { headers: { Authorization: req.headers.authorization } }).catch(() => ({ data: [] }))
    ]);

    const result = {
      ...project.toObject(),
      team: teamRes?.data?.team || null,
      team_members: teamRes?.data?.members || [],
      created_by: authRes?.data?.[0] || project.created_by
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const batchGetProjects = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });
    
    const projects = await Project.find({ _id: { $in: ids.split(',').filter(Boolean) } })
      .select('project_name description progress created_by created_at')
      .lean();
    
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
};