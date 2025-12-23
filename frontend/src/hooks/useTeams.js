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
// 🟦 QUERY HOOKS
// ========================

export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: getMyTeams,
    staleTime: 5 * 60 * 1000, 
  });
};

export const useTeamDetail = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, 
  });
};

export const useLeaderTeams = () => {
  return useQuery({
    queryKey: ['leader-teams'],
    queryFn: getLeaderTeams,
    staleTime: 5 * 60 * 1000,
  });
};

// ========================
// 🟩 MUTATION HOOKS
// ========================

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
      
      // ✅ Cập nhật Timeline
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }) => updateTeam(teamId, payload),
    onSuccess: (data, variables) => {
      // ✅ Cập nhật cache trực tiếp (Backend trả về { message, team })
      const updatedTeam = data.team || data;
      
      if (updatedTeam) {
          queryClient.setQueryData(['teams', variables.teamId], (oldData) => {
              if (!oldData) return updatedTeam;
              // API getTeamById trả về { team: {...}, members: [...] }
              // Nên ta chỉ update phần 'team' bên trong object đó
              return { ...oldData, team: { ...oldData.team, ...updatedTeam } };
          });
      }

      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
      
      // ✅ Cập nhật Timeline
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (data, teamId) => {
      queryClient.removeQueries(['teams', teamId]);
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['leader-teams']);
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-teams']);
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// --- MEMBERS ---

export const useAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userIds }) => addMembers(teamId, userIds),
    onSuccess: (data, variables) => {
      // Refresh chi tiết team để hiện thành viên mới
      queryClient.invalidateQueries(['teams', variables.teamId]);
      
      // ✅ Cập nhật Timeline (quan trọng)
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }) => removeMember(teamId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['teams', variables.teamId]);
      
      // ✅ Cập nhật Timeline
      queryClient.invalidateQueries(['activities']);
    },
  });
};