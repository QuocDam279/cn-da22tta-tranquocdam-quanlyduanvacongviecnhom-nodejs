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

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: getMyNotifications,
    // 👇 Đây là dòng khiến log xuất hiện mỗi 30s. 
    // Nếu bạn muốn Realtime mà không spam log, hãy dùng WebSocket (Socket.io). 
    // Còn dùng API định kỳ thì log này là bắt buộc.
    refetchInterval: 30 * 1000, 
    staleTime: 10 * 1000,
  });

  const notifications = query.data || [];
  
  // Tính toán số lượng chưa đọc từ danh sách đã tải
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ========================
  // 🟩 MUTATIONS (Đã tối ưu Optimistic Update)
  // ========================

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onMutate: async (id) => {
      // 1. Cancel fetch đang chạy
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['unreadCount'] }); // Cancel cả count

      // 2. Snapshot dữ liệu cũ
      const prevNotis = queryClient.getQueryData(['notifications']);
      const prevCount = queryClient.getQueryData(['unreadCount']);

      // 3. Update Cache giả lập (Optimistic)
      if (prevNotis) {
        queryClient.setQueryData(['notifications'], (old) => 
          old?.map(n => n._id === id ? { ...n, is_read: true } : n)
        );
      }
      
      // Update luôn cả cache của Badge số lượng (nếu đang dùng hook useUnreadCount)
      if (prevCount) {
         queryClient.setQueryData(['unreadCount'], (old) => ({
            ...old,
            unread_count: Math.max(0, old.unread_count - 1)
         }));
      }

      return { prevNotis, prevCount };
    },
    onError: (err, id, context) => {
      // Rollback nếu lỗi
      if (context?.prevNotis) queryClient.setQueryData(['notifications'], context.prevNotis);
      if (context?.prevCount) queryClient.setQueryData(['unreadCount'], context.prevCount);
    },
    onSettled: () => {
      // Sau khi xong xuôi (dù lỗi hay không) thì fetch lại cho chắc ăn (đồng bộ dữ liệu thật)
      // Nhưng vì staleTime bạn để cao, có thể bỏ qua dòng này nếu muốn tiết kiệm request
      // queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['unreadCount'] });

      const prevNotis = queryClient.getQueryData(['notifications']);
      
      queryClient.setQueryData(['notifications'], (old) => 
        old?.map(n => ({ ...n, is_read: true }))
      );
      
      // Reset count về 0
      queryClient.setQueryData(['unreadCount'], { unread_count: 0 });

      return { prevNotis };
    },
    onError: (err, variables, context) => {
        if (context?.prevNotis) queryClient.setQueryData(['notifications'], context.prevNotis);
        queryClient.invalidateQueries(['unreadCount']);
    },
  });

  // Xóa và Tạo giữ nguyên logic Invalidate
  const deleteMutation = useMutation({
      mutationFn: deleteNotification,
      
      // 🔥 OPTIMISTIC UPDATE: Cập nhật giao diện TRƯỚC khi server trả lời
      onMutate: async (id) => {
        // 1. Hủy các request đang chạy để tránh xung đột
        await queryClient.cancelQueries({ queryKey: ['notifications'] });
        await queryClient.cancelQueries({ queryKey: ['unreadCount'] });

        // 2. Lưu lại dữ liệu cũ (để back-up nếu lỗi)
        const previousNotifications = queryClient.getQueryData(['notifications']);
        const previousCount = queryClient.getQueryData(['unreadCount']);

        // 3. Tự xóa item khỏi danh sách Cache
        if (previousNotifications) {
          queryClient.setQueryData(['notifications'], (old) => 
            old?.filter(n => n._id !== id)
          );
        }

        // 4. Nếu item bị xóa là "Chưa đọc", tự giảm số lượng Cache đi 1
        const deletedItem = previousNotifications?.find(n => n._id === id);
        if (previousCount && deletedItem && !deletedItem.is_read) {
          queryClient.setQueryData(['unreadCount'], (old) => ({
            ...old,
            unread_count: Math.max(0, (old?.unread_count || 0) - 1)
          }));
        }

        return { previousNotifications, previousCount };
      },

      // Nếu có lỗi thì hoàn tác lại dữ liệu cũ
      onError: (err, id, context) => {
        if (context?.previousNotifications) {
          queryClient.setQueryData(['notifications'], context.previousNotifications);
        }
        if (context?.previousCount) {
          queryClient.setQueryData(['unreadCount'], context.previousCount);
        }
      },

      // ✅ QUAN TRỌNG: Không cần invalidateQueries ở onSuccess nữa
      // onSuccess: () => { ... } -> XÓA HOẶC COMMENT LẠI
    });

  const createMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['unreadCount']);
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    deleteNoti: deleteMutation.mutate,
    createNotification: createMutation.mutate,
  };
};

// ========================
// 🔔 HOOK: Chỉ lấy số lượng (Dùng cho Header Badge)
// ========================
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30 * 1000,
    // Tránh fetch nếu danh sách notification đã có sẵn dữ liệu mới nhất
    // (Optional optimization)
    enabled: true, 
  });
};