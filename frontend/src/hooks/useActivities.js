// src/hooks/useActivityQueries.js
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  createActivityLog,
  getUserActivities,
  getTeamActivities,
  getMyActivities,
} from '../services/activityService';

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

/**
 * Hook lấy activities của user hiện tại (đã đăng nhập)
 * @param {Object} params - { limit, page }
 * @returns {QueryResult}
 */
export const useMyActivities = (params = {}) => {
  return useQuery({
    queryKey: ['activities', 'me', params],
    queryFn: () => getMyActivities(params),
    staleTime: 30 * 1000, // 30 giây
    placeholderData: keepPreviousData, // Giữ data cũ khi phân trang để UI mượt hơn
  });
};

/**
 * Hook lấy activities của một user cụ thể
 * @param {string} userId - ID của user
 * @param {Object} params - { limit, page }
 * @returns {QueryResult}
 */
export const useUserActivities = (userId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'user', userId, params],
    queryFn: () => getUserActivities(userId, params),
    enabled: !!userId, // Chỉ chạy khi có userId
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook lấy activities của một team
 * @param {string} teamId - ID của team
 * @param {Object} params - { limit, page }
 * @returns {QueryResult}
 */
export const useTeamActivities = (teamId, params = {}) => {
  return useQuery({
    queryKey: ['activities', 'team', teamId, params],
    queryFn: () => getTeamActivities(teamId, params),
    enabled: !!teamId, // Chỉ chạy khi có teamId
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
};

// ========================
// 🟩 MUTATION HOOKS (POST/PUT/DELETE)
// ========================

/**
 * Hook tạo activity log mới
 * @returns {MutationResult}
 * 
 * @example
 * const createLog = useCreateActivityLog();
 * 
 * createLog.mutate({
 *   user_id: "123",
 *   user_name: "John Doe",
 *   user_avatar: "avatar.jpg",
 *   action: "đã tạo task",
 *   related_id: "task123",
 *   related_name: "Task mới",
 *   team_id: "team456"
 * });
 */
export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createActivityLog,
    onSuccess: (data, variables) => {
      // Invalidate activities của user
      if (variables?.user_id) {
        queryClient.invalidateQueries({
          queryKey: ['activities', 'user', variables.user_id]
        });
        queryClient.invalidateQueries({
          queryKey: ['activities', 'me']
        });
      }

      // Invalidate activities của team
      if (variables?.team_id) {
        queryClient.invalidateQueries({
          queryKey: ['activities', 'team', variables.team_id]
        });
      }
    },
    onError: (error) => {
      console.error('❌ Create activity log failed:', error.message);
    },
  });
};

// ========================
// 🎯 HELPER HOOKS
// ========================

/**
 * Hook lấy activities với auto-refresh
 * Hữu ích cho dashboard cần cập nhật realtime
 * @param {string} teamId - ID của team
 * @param {Object} params - { limit, page }
 * @param {number} refetchInterval - Interval tự động refresh (ms), default 60s
 */
export const useTeamActivitiesLive = (teamId, params = {}, refetchInterval = 60000) => {
  return useQuery({
    queryKey: ['activities', 'team', teamId, params, 'live'],
    queryFn: () => getTeamActivities(teamId, params),
    enabled: !!teamId,
    staleTime: 30 * 1000,
    refetchInterval, // Auto refresh mỗi 60s
    refetchIntervalInBackground: false, // Chỉ refresh khi tab active
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook prefetch activities để tăng tốc navigation
 * @param {string} teamId - ID của team cần prefetch
 */
export const usePrefetchTeamActivities = (teamId) => {
  const queryClient = useQueryClient();

  return () => {
    if (teamId) {
      queryClient.prefetchQuery({
        queryKey: ['activities', 'team', teamId, {}],
        queryFn: () => getTeamActivities(teamId, {}),
        staleTime: 30 * 1000,
      });
    }
  };
};

// ========================
// 📊 DEFAULT EXPORT
// ========================

export default {
  useMyActivities,
  useUserActivities,
  useTeamActivities,
  useCreateActivityLog,
  useTeamActivitiesLive,
  usePrefetchTeamActivities,
};