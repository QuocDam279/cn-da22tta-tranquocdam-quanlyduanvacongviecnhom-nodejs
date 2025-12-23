import Project from '../models/Project.js';
import http from '../utils/httpClient.js';
import ActivityLogger from '../utils/activityLogger.js';

/**
 * 🧱 Tạo project mới
 * ⚡ Tối ưu: Phản hồi ngay, Log chạy ngầm
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

    // ✅ Phản hồi ngay lập tức
    res.status(201).json({ message: 'Tạo dự án thành công', project });

    // ⚡ Log chạy ngầm
    ActivityLogger.logProjectCreated(
      created_by, 
      project._id, 
      project_name, 
      req.headers.authorization
    ).catch(console.warn);

  } catch (error) {
    console.error('❌ Lỗi createProject:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server', error: error.message });
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
 * ⚡ Tối ưu: Dùng Promise.all để gọi Team Service và Auth Service song song
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // ⚡ GỌI SONG SONG 2 SERVICE (Giảm thời gian chờ)
    const [teamRes, authRes] = await Promise.all([
        http.team.get(`/${project.team_id}`, {
            headers: { Authorization: req.headers.authorization }
        }).catch(err => ({ data: null })), // Catch lỗi để không crash nếu 1 service chết

        http.auth.post('/users/info', 
            { ids: [project.created_by] },
            { headers: { Authorization: req.headers.authorization } }
        ).catch(err => ({ data: [] }))
    ]);

    const teamData = teamRes?.data || {};
    const creator = authRes?.data?.[0] || null;

    const result = {
      ...project.toObject(),
      team: teamData.team || null,
      team_members: teamData.members || [],
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
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { project_name, description, start_date, end_date, status, progress } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    if (project.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền sửa dự án này' });

    if (project_name) project.project_name = project_name;
    if (description) project.description = description;
    if (start_date) project.start_date = start_date;
    if (end_date) project.end_date = end_date;
    if (progress !== undefined) project.progress = progress;

    project.updated_at = new Date();
    await project.save();

    // ✅ Phản hồi ngay
    res.json({ message: 'Cập nhật dự án thành công', project });

    // ⚡ Log chạy ngầm
    ActivityLogger.logProjectUpdated(
      req.user.id,
      project._id,
      project.project_name,
      req.headers.authorization
    ).catch(console.warn);

  } catch (error) {
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🗑️ Xóa project và cascade xóa tất cả tasks
 * ⚡ Tối ưu: Xóa tasks song song, phản hồi ngay, log chạy ngầm
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    if (project.created_by.toString() !== req.user.id)
      return res.status(403).json({ message: 'Bạn không có quyền xóa dự án này' });

    const projectName = project.project_name;
    const projectId = project._id;

    // 🔥 XÓA SONG SONG: Project (DB) và Tasks (Task Service)
    await Promise.all([
      project.deleteOne(),
      
      // Gọi Task Service để xóa tất cả tasks thuộc project
      http.task.delete(`/cascade/project/${projectId}`, {
        headers: { Authorization: req.headers.authorization }
      }).catch(err => {
        console.warn('⚠️ Không xóa được tasks:', err.message);
        // Không throw error để project vẫn bị xóa
      })
    ]);

    // ✅ Phản hồi ngay
    res.json({ message: 'Xóa dự án và các công việc liên quan thành công' });

    // ⚡ Log chạy ngầm
    ActivityLogger.logProjectDeleted(
      req.user.id,
      projectId,
      projectName,
      req.headers.authorization
    ).catch(console.warn);

  } catch (error) {
    console.error('❌ Lỗi deleteProject:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🧭 Lấy tất cả project mà user tham gia
 */
export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy list team user tham gia
    const { data: teams } = await http.team.get('/', {
      headers: { Authorization: req.headers.authorization }
    });

    const teamIds = teams.map(t => t._id);

    // Lấy project thuộc các team đó
    const projects = await Project.find({ team_id: { $in: teamIds } }).sort({ created_at: -1 });

    res.json(projects);
  } catch (error) {
    console.error('❌ Lỗi getMyProjects:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * 🔢 Cập nhật tiến độ dự án (Gọi bởi Task Service)
 * ⚡ Tối ưu: Phản hồi ngay
 */
export const recalcProjectProgress = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Không tìm thấy dự án' });

    // Gọi Task Service để lấy tasks (Cần await để tính toán)
    const { data: tasks } = await http.task.get(`/project/${projectId}`, {
      headers: { Authorization: req.headers.authorization }
    });

    let avgProgress = 0;
    if (tasks && tasks.length > 0) {
      const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
      avgProgress = Math.round(totalProgress / tasks.length);
    }

    const updated = await Project.findByIdAndUpdate(
      projectId,
      { progress: avgProgress, updated_at: new Date() },
      { new: true }
    );

    // ✅ Phản hồi ngay cho Task Service (để Task Service kết thúc request của nó)
    res.json({ progress: avgProgress, project: updated });

    // ⚡ Log chạy ngầm
    ActivityLogger.logProjectProgressUpdated(
      req.user.id,
      projectId,
      project.project_name,
      avgProgress,
      req.headers.authorization
    ).catch(console.warn);

  } catch (error) {
    console.error('❌ Lỗi recalcProjectProgress:', error.message);
    if (!res.headersSent) res.status(500).json({ message: 'Lỗi tính toán', error: error.message });
  }
};

/**
 * 📦 Batch endpoint
 */
export const batchGetProjects = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Missing ids' });
    
    const idArray = ids.split(',').filter(id => id.trim());
    if (idArray.length === 0) return res.json({ success: true, data: [] });
    
    const projects = await Project.find({ _id: { $in: idArray } })
      .select('project_name description progress created_by created_at')
      .lean();
    
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
};

/**
 * 🗑️ Xóa TẤT CẢ projects thuộc 1 team (CASCADE DELETE)
 * Được gọi bởi Team Service khi xóa team
 * ⚡ Tối ưu: Xóa projects và tasks song song, phản hồi ngay, log chạy ngầm
 */
export const deleteProjectsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // 1. Lấy danh sách projects thuộc team (để log và xóa tasks)
    const projects = await Project.find({ team_id: teamId }).select('_id project_name');
    
    if (projects.length === 0) {
      return res.json({ 
        message: 'Không có dự án nào thuộc team này',
        deletedCount: 0 
      });
    }

    const projectIds = projects.map(p => p._id);

    // 2. XÓA SONG SONG: Projects (DB) và Tasks (Task Service)
    const deleteResults = await Promise.allSettled([
      // Xóa projects trong DB
      Project.deleteMany({ team_id: teamId }),
      
      // Xóa tasks của từng project (gọi Task Service)
      ...projectIds.map(projectId => 
        http.task.delete(`/cascade/project/${projectId}`, {
          headers: { Authorization: req.headers.authorization }
        }).catch(err => {
          console.warn(`⚠️ Không xóa được tasks của project ${projectId}:`, err.message);
          return null;
        })
      )
    ]);

    const projectDeleteResult = deleteResults[0];
    const deletedCount = projectDeleteResult.status === 'fulfilled' 
      ? projectDeleteResult.value.deletedCount 
      : 0;

    // ✅ Phản hồi ngay
    res.json({ 
      message: `Đã xóa ${deletedCount} dự án và các công việc liên quan`,
      deletedCount 
    });

    // ⚡ Log chạy ngầm (ghi log cho từng project bị xóa)
    if (projects.length > 0) {
      Promise.all(
        projects.map(project => 
          ActivityLogger.logProjectDeleted(
            req.user.id,
            project._id,
            project.project_name,
            req.headers.authorization
          ).catch(console.warn)
        )
      ).catch(console.warn);
    }

  } catch (error) {
    console.error('❌ Lỗi deleteProjectsByTeam:', error.message);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};