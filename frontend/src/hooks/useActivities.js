import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createActivityLog,
  getUserActivities,
  getRelatedActivities,
  getTaskActivities,
  getProjectActivities,
  getTeamActivities,
  deleteActivityLog,
  getMyActivities,
} from '../services/activityService';

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

// Lấy activity của user hiện tại
export const useMyActivities = (params = {}) => {
  return useQuery({
    queryKey: ['activities', 'me', params],
    queryFn: () => getMyActivities(params),
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy activity theo userId
export const useUserActivities = (userId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'user', userId, params],
    queryFn: () => getUserActivities(userId, params),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy activity theo entity bất kỳ (task / project / team)
export const useRelatedActivities = (relatedType, relatedId, params = {}) => {
  return useQuery({
    queryKey: ['activities', relatedType, relatedId, params],
    queryFn: () => getRelatedActivities(relatedType, relatedId, params),
    enabled: !!relatedType && !!relatedId,
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy activity của task
export const useTaskActivities = (taskId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'task', taskId, params],
    queryFn: () => getTaskActivities(taskId, params),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy activity của project
export const useProjectActivities = (projectId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'project', projectId, params],
    queryFn: () => getProjectActivities(projectId, params),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy activity của team
export const useTeamActivities = (teamId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'team', teamId, params],
    queryFn: () => getTeamActivities(teamId, params),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000,
  });
};

// ========================
// 🟩 MUTATION HOOKS
// ========================

// Tạo activity log
export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivityLog,
    onSuccess: (_, variables) => {
      // invalidate theo entity liên quan
      if (variables?.related_type && variables?.related_id) {
        queryClient.invalidateQueries([
          'activities',
          variables.related_type,
          variables.related_id,
        ]);
      }

      queryClient.invalidateQueries(['activities', 'me']);
    },
  });
};

// Xóa activity log
export const useDeleteActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteActivityLog,
    onSuccess: () => {
      // Activity thường chỉ để đọc → invalidate toàn bộ
      queryClient.invalidateQueries(['activities']);
    },
  });
};
