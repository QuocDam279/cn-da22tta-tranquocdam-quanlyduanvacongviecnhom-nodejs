// controllers/project.controller.js
import Project from '../models/Project.js';
import http from '../utils/httpClient.js';

/**
 * 🧱 Tạo project mới
 */
export const createProject = async (req, res) => {
  try {
    const { team_id, project_name, description, start_date, end_date } = req.body;
    const created_by = req.user.id;

    const project = await Project.create({
      team_id,
      project_name,
      description,
      start_date,
      end_date,
      created_by
    });

    res.status(201).json({ message: 'Tạo dự án thành công', project });
  } catch (error) {
    console.error('❌ Lỗi createProject:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 📋 Lấy danh sách project theo team
 */
export const getProjectsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const projects = await Project.find({ team_id: teamId }).sort({ created_at: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔍 Lấy chi tiết 1 project
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // ✅ Gọi Team Service
    const { data: teamData } = await http.team.get(`/${project.team_id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    // ✅ Gọi Auth Service để lấy thông tin người tạo
    const { data: users } = await http.auth.post(
      '/users/info',
      { ids: [project.created_by] },
      { headers: { Authorization: req.headers.authorization } }
    );

    const creator = users[0] || null;

    const result = {
      ...project.toObject(),
      team: teamData.team,
      team_members: teamData.members,
      created_by: creator
    };

    res.json(result);
  } catch (error) {
    console.error('❌ Lỗi getProjectById:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * ✏️ Cập nhật project
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, description, start_date, end_date, status, progress } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // ✅ Chỉ người tạo mới được sửa
    if (project.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền sửa dự án này' });

    // Cập nhật thông tin
    if (project_name) project.project_name = project_name;
    if (description) project.description = description;
    if (start_date) project.start_date = start_date;
    if (end_date) project.end_date = end_date;
    if (status) project.status = status;
    if (progress !== undefined) project.progress = progress;

    project.updated_at = new Date();
    await project.save();

    res.json({ message: 'Cập nhật dự án thành công', project });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa project
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    if (project.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa dự án này' });

    await project.deleteOne();

    res.json({ message: 'Xóa dự án thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🧭 Lấy tất cả project mà user tham gia (qua team)
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // ✅ Gọi Team Service để lấy danh sách team mà user đang tham gia
    const { data: teams } = await http.team.get('/', {
      headers: { Authorization: req.headers.authorization } // gửi token cho Team Service
    });

    const teamIds = teams.map(t => t._id);

    // ✅ Lấy tất cả project thuộc các team đó
    const projects = await Project.find({ team_id: { $in: teamIds } }).sort({ created_at: -1 });

    res.json(projects);
  } catch (error) {
    console.error('❌ Lỗi getMyProjects:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
