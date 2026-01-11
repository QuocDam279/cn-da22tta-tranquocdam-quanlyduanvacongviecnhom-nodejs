import Project from '../models/Project.js';
import http from '../utils/httpClient.js';

// --- CREATE ---
export const createProject = async (req, res) => {
  try {
    const { team_id, project_name, description, start_date, end_date } = req.body;
    
    // ✅ Kiểm tra tên trùng trong team
    const existingProject = await Project.findOne({
      team_id,
      project_name: project_name.trim()
    });
    
    if (existingProject) {
      return res.status(400).json({ 
        message: 'Tên dự án đã tồn tại trong nhóm này',
        field: 'project_name'
      });
    }
    
    const project = await Project.create({
      team_id, 
      project_name: project_name.trim(), 
      description, 
      start_date, 
      end_date, 
      created_by: req.user.id
    });

    res.status(201).json({ 
      message: 'Tạo dự án thành công', 
      project 
    });
  } catch (error) {
    // ✅ Xử lý lỗi unique constraint từ MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Tên dự án đã tồn tại trong nhóm này',
        field: 'project_name'
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// --- UPDATE ---
export const updateProject = async (req, res) => {
  try {
    const { project_name, description, start_date, end_date, progress } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }
    
    if (project.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
    }

    // ✅ Kiểm tra tên trùng nếu có thay đổi tên
    if (project_name && project_name.trim() !== project.project_name) {
      const existingProject = await Project.findOne({
        team_id: project.team_id,
        project_name: project_name.trim(),
        _id: { $ne: req.params.id } // Loại trừ chính dự án đang sửa
      });
      
      if (existingProject) {
        return res.status(400).json({ 
          message: 'Tên dự án đã tồn tại trong nhóm này',
          field: 'project_name'
        });
      }
    }

    // ✅ KIỂM TRA: Nếu thay đổi end_date, phải validate với tasks
    if (end_date && end_date !== project.end_date?.toISOString()) {
      try {
        const newEndDate = new Date(end_date);
        
        // 🔍 Gọi Task Service để kiểm tra tasks vượt deadline
        const response = await http.task.get(`/validate-deadline/${req.params.id}`, {
          params: { end_date: newEndDate.toISOString() },
          headers: { Authorization: req.headers.authorization }
        });

        // ❌ Nếu có task vượt quá, từ chối cập nhật
        if (response.data.hasConflicts) {
          return res.status(400).json({ 
            message: `Không thể thay đổi thời hạn dự án. ${response.data.message}`,
            conflictingTasks: response.data.tasks
          });
        }
      } catch (error) {
        // Nếu endpoint chưa tồn tại hoặc Task Service down
        if (error.response?.status === 404) {
          console.warn('⚠️ Task validation endpoint not found - skipping validation');
        } else {
          console.error('⚠️ Error validating task deadlines:', error.message);
        }
      }
    }

    // ✅ Cập nhật project
    if (project_name) project.project_name = project_name.trim();
    if (description !== undefined) project.description = description;
    if (start_date) project.start_date = start_date;
    if (end_date) project.end_date = end_date;
    if (progress !== undefined) project.progress = progress;
    project.updated_at = new Date();

    await project.save();
    
    res.json({ 
      message: 'Cập nhật thành công', 
      project 
    });
  } catch (error) {
    // ✅ Xử lý lỗi unique constraint
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Tên dự án đã tồn tại trong nhóm này',
        field: 'project_name'
      });
    }
    
    res.status(500).json({ 
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// --- SPECIAL UPDATE (Called by Task Service) ---
export const recalcProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body; 
    if (progress === undefined) {
      return res.status(400).json({ message: 'Missing progress' });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id, 
      { progress, updated_at: new Date() }, 
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ message: 'Not found' });

    res.json({ message: 'Progress updated', progress: updated.progress });
  } catch (error) {
    res.status(500).json({ message: 'Error', error: error.message });
  }
};

// --- DELETE (Cascade) ---
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No permission' });
    }

    const { _id } = project;

    // Parallel Delete: DB + Task Service Cascade
    await Promise.all([
      project.deleteOne(),
      http.task.delete(`/cascade/project/${_id}`, { 
        headers: { Authorization: req.headers.authorization } 
      }).catch(() => {})
    ]);

    res.json({ message: 'Project and tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteProjectsByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const projects = await Project.find({ team_id: teamId }).select('_id');
    if (!projects.length) {
      return res.json({ message: 'No projects', deletedCount: 0 });
    }

    // Bulk Delete Strategy
    await Promise.allSettled([
      Project.deleteMany({ team_id: teamId }),
      ...projects.map(p => 
        http.task.delete(`/cascade/project/${p._id}`, { 
          headers: { Authorization: req.headers.authorization } 
        })
      )
    ]);

    res.json({ 
      message: `Deleted ${projects.length} projects`, 
      deletedCount: projects.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};