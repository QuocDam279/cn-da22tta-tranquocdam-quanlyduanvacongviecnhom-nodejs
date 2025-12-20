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

// Lấy tất cả projects của user
export const useMyProjects = () => {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

// Lấy projects theo team
export const useProjectsByTeam = (teamId) => {
  return useQuery({
    queryKey: ['projects', 'team', teamId],
    queryFn: () => getProjectsByTeam(teamId),
    enabled: !!teamId, // Chỉ gọi khi có teamId
    staleTime: 5 * 60 * 1000,
  });
};

// Lấy chi tiết project
export const useProjectDetail = (projectId) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: !!projectId,
    staleTime: 3 * 60 * 1000, // Cache 3 phút (thay đổi thường xuyên hơn)
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
      // Invalidate các queries liên quan
      queryClient.invalidateQueries(['my-projects']);
      if (variables.team_id) {
        queryClient.invalidateQueries(['projects', 'team', variables.team_id]);
      }
    },
  });
};

// Cập nhật project đầy đủ
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: (data, variables) => {
      // Invalidate project detail
      queryClient.invalidateQueries(['projects', variables.projectId]);
      // Invalidate danh sách projects
      queryClient.invalidateQueries(['my-projects']);
    },
  });
};

// Cập nhật trạng thái project
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, status }) => updateProjectStatus(projectId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['projects', variables.projectId]);
      queryClient.invalidateQueries(['my-projects']);
    },
  });
};

// Xóa project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (data, projectId) => {
      // Xóa cache của project này
      queryClient.removeQueries(['projects', projectId]);
      // Invalidate danh sách
      queryClient.invalidateQueries(['my-projects']);
      queryClient.invalidateQueries(['projects', 'team']);
    },
  });
};

// Tính lại tiến độ project
export const useRecalcProjectProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recalcProjectProgress,
    onSuccess: (data, projectId) => {
      // Refresh project detail để hiển thị progress mới
      queryClient.invalidateQueries(['projects', projectId]);
      queryClient.invalidateQueries(['my-projects']);
    },
  });
};