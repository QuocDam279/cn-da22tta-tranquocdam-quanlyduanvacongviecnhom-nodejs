// src/hooks/useTeams.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeam,
  getMyTeams,
  getTeamById,
  addMembers,
  removeMember,
  updateTeam,
  deleteTeam,
  leaveTeam,
  getLeaderTeams,
} from '../services/teamService';

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

// Lấy tất cả team của user hiện tại
export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: getMyTeams,
    staleTime: 5 * 60 * 1000, // cache 5 phút
  });
};

// Lấy chi tiết 1 team
export const useTeamDetail = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 3 * 60 * 1000, // detail thường thay đổi nhanh hơn
  });
};

// Lấy các team do user hiện tại tạo
export const useLeaderTeams = () => {
  return useQuery({
    queryKey: ['leader-teams'],
    queryFn: getLeaderTeams,
    staleTime: 5 * 60 * 1000,
  });
};

// ========================
// 🟩 MUTATION HOOKS (CREATE, UPDATE, DELETE)
// ========================

// Tạo team mới
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
    },
  });
};

// Cập nhật thông tin team
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }) => updateTeam(teamId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['teams', variables.teamId]);
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
    },
  });
};

// Xóa team
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (data, teamId) => {
      queryClient.removeQueries(['teams', teamId]);
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
    },
  });
};

// Rời team
export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-teams']);
    },
  });
};

// Thêm thành viên vào team
export const useAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userIds }) => addMembers(teamId, userIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['teams', variables.teamId]);
    },
  });
};

// Xóa thành viên khỏi team
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }) => removeMember(teamId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['teams', variables.teamId]);
    },
  });
};