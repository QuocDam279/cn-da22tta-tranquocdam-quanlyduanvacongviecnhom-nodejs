// =====================================================
// 📁 src/hooks/useNotifications.js
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification
} from '../services/notificationService';

// ========================
// 🔔 MAIN HOOK: Danh sách thông báo
// ========================

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // 1. Lấy danh sách thông báo
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    refetchInterval: 30 * 1000, // Polling 30s
    staleTime: 10 * 1000,
  });

  // 2. Tính toán số lượng chưa đọc (Derived State)
  const notifications = query.data || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ========================
  // 🟩 MUTATIONS
  // ========================

  // 3. Đánh dấu đã đọc
  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onMutate: async (id) => {
      // Cancel các refetch đang chạy để không ghi đè dữ liệu ta tự sửa
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      // Lưu lại dữ liệu cũ để rollback nếu lỗi
      const previousNotifications = queryClient.getQueryData(['notifications']);
      // Tự sửa cache: Tìm notification có ID đó và đổi is_read = true
      queryClient.setQueryData(['notifications'], (old) => 
        old?.map(n => n._id === id ? { ...n, is_read: true } : n)
      );
      return { previousNotifications };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['notifications'], context.previousNotifications);
    },
    // KHÔNG dùng invalidateQueries ở đây nữa để tránh refetch
  });

  // ⭐ NEW: Đánh dấu tất cả đã đọc
  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previousNotifications = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old) => 
        old?.map(n => ({ ...n, is_read: true }))
      );
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['notifications'], context.previousNotifications);
    },
  });

  // 4. Xóa thông báo
  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // ⭐ NEW: Tạo thông báo (Manual)
  const createMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  return {
    notifications,
    unreadCount, // ⭐ Rename từ count
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Actions
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate, // ⭐ NEW
    deleteNoti: deleteMutation.mutate,
    createNotification: createMutation.mutate, // ⭐ NEW
    
    // Mutation states (nếu cần loading indicators)
    isMarkingRead: markReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

// ========================
// ⭐ NEW HOOK: Chi tiết thông báo
// ========================

export const useNotificationDetail = (id) => {
  return useQuery({
    queryKey: ['notification', id],
    queryFn: () => getNotificationById(id),
    enabled: !!id, // Chỉ fetch khi có ID
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });
};

// ========================
// ⭐ NEW HOOK: Unread Counter (Lightweight)
// ========================

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30 * 1000, // Polling 30s
    select: (data) => data.unread_count, // Extract count từ response
  });
};