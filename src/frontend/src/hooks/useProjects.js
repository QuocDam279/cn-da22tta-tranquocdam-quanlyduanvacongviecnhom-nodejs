import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProject,
  getMyProjects,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  updateProjectStatus,
  deleteProject,
  recalcProjectProgress,
} from '../services/projectService';

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

export const useMyProjects = () => {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000, // ✅ Tốt: Cache 5 phút
  });
};

export const useProjectsByTeam = (teamId) => {
  return useQuery({
    queryKey: ['projects', 'team', teamId],
    queryFn: () => getProjectsByTeam(teamId),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectDetail = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // ✅ Tốt: Cache 2 phút
  });
};

// ========================
// 🔥 HELPER: CẬP NHẬT CACHE TOÀN DIỆN 🔥
// ========================
const updateProjectInCache = (queryClient, updatedProject) => {
  if (!updatedProject || !updatedProject._id) return;

  // 1. Cập nhật trang chi tiết (Detail View)
  queryClient.setQueryData(['projects', updatedProject._id], (oldData) => {
    if (!oldData) return updatedProject;
    return { ...oldData, ...updatedProject };
  });

  // 2. Cập nhật trong danh sách "My Projects" (List View)
  queryClient.setQueryData(['my-projects'], (oldList) => {
    if (!oldList) return oldList;
    return oldList.map(p => p._id === updatedProject._id ? { ...p, ...updatedProject } : p);
  });

  // 3. Cập nhật trong danh sách "Projects By Team" (List View)
  if (updatedProject.team_id) {
    queryClient.setQueryData(['projects', 'team', updatedProject.team_id], (oldList) => {
      if (!oldList) return oldList;
      return oldList.map(p => p._id === updatedProject._id ? { ...p, ...updatedProject } : p);
    });
  }
};

// ========================
// 🟩 MUTATION HOOKS
// ========================

// Tạo project mới
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data, variables) => {
      const newProject = data.project || data;

      // ✅ FIX: Chèn thủ công vào danh sách thay vì load lại
      queryClient.setQueryData(['my-projects'], (oldList) => {
        return oldList ? [newProject, ...oldList] : [newProject];
      });

      if (variables.team_id) {
        queryClient.setQueryData(['projects', 'team', variables.team_id], (oldList) => {
          return oldList ? [newProject, ...oldList] : [newProject];
        });
      }

      // Activity log: Có thể comment lại nếu muốn chặn tuyệt đối log
      // queryClient.invalidateQueries(['activities']);
    },
  });
};

// Cập nhật project đầy đủ
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: (data) => {
      const updatedProject = data.project || data;
      updateProjectInCache(queryClient, updatedProject); // ✅ Dùng helper
    },
  });
};

// Cập nhật trạng thái project
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, status }) => updateProjectStatus(projectId, status),
    onSuccess: (data) => {
      const updatedProject = data.project || data;
      updateProjectInCache(queryClient, updatedProject); // ✅ Dùng helper
    },
  });
};

// Xóa project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (data, projectId) => {
      // Xóa cache chi tiết
      queryClient.removeQueries(['projects', projectId]);
      
      // ✅ FIX: Lọc bỏ khỏi danh sách thủ công (Filter)
      queryClient.setQueryData(['my-projects'], (oldList) => 
        oldList ? oldList.filter(p => p._id !== projectId) : oldList
      );
      
      // Xóa khỏi list team nếu có cache
      // (Lưu ý: hơi khó vì deleteProject đôi khi không trả về team_id, 
      // nên invalidate ở đây là chấp nhận được nếu cần thiết)
      queryClient.invalidateQueries(['projects', 'team']);
    },
  });
};

// Tính lại tiến độ project (QUAN TRỌNG NHẤT)
export const useRecalcProjectProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recalcProjectProgress,
    onSuccess: (data) => {
      // Backend trả về: { progress: 50, project: { ... } }
      const updatedProject = data.project;
      
      if (updatedProject) {
        // Merge progress mới vào project
        const finalProject = { ...updatedProject, progress: data.progress };
        
        // ✅ FIX: Cập nhật cache thủ công -> UI nhảy số ngay, KHÔNG gọi API danh sách
        updateProjectInCache(queryClient, finalProject);
      }
    },
  });
};