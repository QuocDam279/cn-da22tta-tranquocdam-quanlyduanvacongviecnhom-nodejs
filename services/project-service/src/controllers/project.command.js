import Project from '../models/Project.js';
import http from '../utils/httpClient.js';

// --- CREATE ---
export const createProject = async (req, res) => {
  try {
    const { team_id, project_name, description, start_date, end_date } = req.body;
    
    const project = await Project.create({
      team_id, 
      project_name, 
      description, 
      start_date, 
      end_date, 
      created_by: req.user.id
    });

    res.status(201).json({ message: 'Tạo dự án thành công', project });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- UPDATE ---
export const updateProject = async (req, res) => {
  try {
    const { project_name, description, start_date, end_date, progress } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.created_by.toString() !== req.user.id) return res.status(403).json({ message: 'No permission' });

    if (project_name) project.project_name = project_name;
    if (description) project.description = description;
    if (start_date) project.start_date = start_date;
    if (end_date) project.end_date = end_date;
    if (progress !== undefined) project.progress = progress;
    project.updated_at = new Date();

    await project.save();
    res.json({ message: 'Updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- SPECIAL UPDATE (Called by Task Service) ---
export const recalcProjectProgress = async (req, res) => {
  try {
    const { progress } = req.body; 
    if (progress === undefined) return res.status(400).json({ message: 'Missing progress' });

    const updated = await Project.findByIdAndUpdate(req.params.id, { progress, updated_at: new Date() }, { new: true });
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
    if (project.created_by.toString() !== req.user.id) return res.status(403).json({ message: 'No permission' });

    const { _id } = project;

    // Parallel Delete: DB + Task Service Cascade
    await Promise.all([
      project.deleteOne(),
      http.task.delete(`/cascade/project/${_id}`, { headers: { Authorization: req.headers.authorization } }).catch(() => {})
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
    if (!projects.length) return res.json({ message: 'No projects', deletedCount: 0 });

    // Bulk Delete Strategy
    await Promise.allSettled([
      Project.deleteMany({ team_id: teamId }),
      ...projects.map(p => http.task.delete(`/cascade/project/${p._id}`, { headers: { Authorization: req.headers.authorization } }))
    ]);

    res.json({ message: `Deleted ${projects.length} projects`, deletedCount: projects.length });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};