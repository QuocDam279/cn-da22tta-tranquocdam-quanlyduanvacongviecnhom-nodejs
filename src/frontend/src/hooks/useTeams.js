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
import toast from 'react-hot-toast';

// ========================
// 🟦 QUERY HOOKS
// ========================

export const useMyTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: getMyTeams,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, // Tối ưu: Không tự refresh khi chuyển tab
  });
};

export const useTeamDetail = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => getTeamById(teamId),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, 
    refetchOnWindowFocus: false,
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
      // Khi tạo team mới, bắt buộc phải load lại danh sách
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['leader-teams'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, payload }) => updateTeam(teamId, payload),
    onSuccess: (data, variables) => {
      const updatedTeam = data.team || data;
      const { teamId } = variables;

      // ✅ Cập nhật Cache thủ công: Giúp UI cập nhật tên/mô tả ngay lập tức
      if (updatedTeam) {
          queryClient.setQueryData(['teams', teamId], (oldData) => {
              if (!oldData) return oldData;
              // Giữ nguyên members, chỉ update thông tin team
              return { 
                ...oldData, 
                team: { ...oldData.team, ...updatedTeam } 
              };
          });
      }

      // Chỉ invalidate danh sách team bên ngoài, không invalidate chi tiết team này nữa (vì đã setQueryData rồi)
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['leader-teams'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (data, teamId) => {
      // Xóa hẳn team khỏi cache để tránh lỗi
      queryClient.removeQueries({ queryKey: ['teams', teamId] });
      
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['leader-teams'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveTeam,
    onSuccess: (data, teamId) => {
      queryClient.removeQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // 🔥 THÊM: Invalidate tasks để cập nhật assigned_to
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
    },
  });
};

// --- MEMBERS (Phần quan trọng sửa lỗi Refetch Storm) ---

export const useAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userIds }) => addMembers(teamId, userIds),
    onSuccess: (data, variables) => {
      // Với Add Member: Ta bắt buộc phải invalidate để lấy thông tin đầy đủ của User (avatar, name) từ server về
      // NHƯNG: Chỉ invalidate đúng team này.
      queryClient.invalidateQueries({ 
        queryKey: ['teams', variables.teamId] 
      });
      
      // Activities là phụ, invalidate cũng được
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err) => {
       toast.error(err.response?.data?.message || "Thêm thành viên thất bại");
    }
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, userId }) => removeMember(teamId, userId),
    onSuccess: (data, variables) => {
      const { teamId, userId } = variables;

      // Cập nhật cache members
      queryClient.setQueryData(['teams', teamId], (oldData) => {
        if (!oldData || !oldData.members) return oldData;
        return {
          ...oldData,
          members: oldData.members.filter(m => m.user?._id !== userId)
        };
      });

      // 🔥 THÊM: Invalidate tasks của user bị xóa
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success("Đã xóa thành viên");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xóa thành viên thất bại");
    }
  });
};