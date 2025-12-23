// frontend/src/hooks/useProjects.js
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
    staleTime: 5 * 60 * 1000, 
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
    staleTime: 2 * 60 * 1000, // Cache 2 phút
  });
};

// ========================
// 🟩 MUTATION HOOKS (CREATE, UPDATE, DELETE)
// ========================

// Tạo project mới
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (data, variables) => {
      // Refresh danh sách dự án
      queryClient.invalidateQueries(['my-projects']);
      
      if (variables.team_id) {
        queryClient.invalidateQueries(['projects', 'team', variables.team_id]);
      }

      // ✅ Cập nhật Timeline
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// Helper: Cập nhật cache ngay lập tức (Direct Update)
const updateProjectCache = (queryClient, updatedProject) => {
  if (!updatedProject || !updatedProject._id) return;

  // 1. Cập nhật trang chi tiết (nếu đang xem)
  queryClient.setQueryData(['projects', updatedProject._id], (oldData) => {
    if (!oldData) return updatedProject;
    return { ...oldData, ...updatedProject }; // Merge dữ liệu mới
  });

  // 2. Refresh danh sách để cập nhật sort/filter (nếu cần)
  queryClient.invalidateQueries(['my-projects']);
  
  // 3. Cập nhật Timeline
  queryClient.invalidateQueries(['activities']);
};

// Cập nhật project đầy đủ
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: (data) => {
      // Backend trả về: { message, project }
      const updatedProject = data.project || data;
      updateProjectCache(queryClient, updatedProject);
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
      updateProjectCache(queryClient, updatedProject);
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
      
      // Refresh danh sách
      queryClient.invalidateQueries(['my-projects']);
      queryClient.invalidateQueries(['projects', 'team']);
      
      // ✅ Cập nhật Timeline
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// Tính lại tiến độ project
export const useRecalcProjectProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recalcProjectProgress,
    onSuccess: (data) => {
      // Backend trả về: { progress: 50, project: { ... } }
      const updatedProject = data.project;
      
      if (updatedProject) {
        // Cập nhật cache ngay lập tức -> UI nhảy số ngay
        queryClient.setQueryData(['projects', updatedProject._id], (old) => {
            if(!old) return updatedProject;
            return { ...old, progress: data.progress, ...updatedProject };
        });
      }
      
      // Vẫn invalidate nhẹ danh sách để đồng bộ bên ngoài
      queryClient.invalidateQueries(['my-projects']);
    },
  });
};