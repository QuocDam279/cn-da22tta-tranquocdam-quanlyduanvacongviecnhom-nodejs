import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCommentsByTask, 
  createComment, 
  deleteComment 
} from '../services/taskCommentService';

// 📋 Lấy danh sách comment
export const useTaskComments = (taskId) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => getCommentsByTask(taskId),
    enabled: !!taskId,
    staleTime: 60 * 1000, 
  });
};

// 💬 Gửi comment mới (Optimistic Update)
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }) => createComment(taskId, content),

    // 🔥 1. Trước khi gọi API: Hiển thị ngay (Fake)
    onMutate: async ({ taskId, content }) => {
      await queryClient.cancelQueries(['comments', taskId]);
      const previousComments = queryClient.getQueryData(['comments', taskId]);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      // Tạo comment giả
      const newOptimisticComment = {
        _id: `temp-${Date.now()}`,
        content,
        user_id: currentUser._id || currentUser.id,
        user: currentUser, // Có Avatar
        created_at: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(['comments', taskId], (old = []) => {
        return [...old, newOptimisticComment];
      });

      return { previousComments };
    },

    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', variables.taskId], context.previousComments);
      }
    },

    // ✅ 2. FIX MẠNH TAY TẠI ĐÂY
    onSuccess: (data, variables) => {
      // 1. Lấy dữ liệu thật từ Server
      // API có thể trả về: { data: {...} } hoặc trực tiếp {...}
      let realComment = data.comment || data; 

      // 2. Lấy User hiện tại từ LocalStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

      console.log("🔥 [DEBUG] Server trả về:", realComment);

      // 3. FORCE PATCH: "Cưỡng ép" ghép thông tin User vào
      // Không cần kiểm tra realComment.user thiếu hay đủ.
      // Vì đây là comment MÌNH vừa viết, nên User chắc chắn là MÌNH.
      realComment = {
        ...realComment,
        // Đảm bảo user_id chuẩn
        user_id: realComment.user_id || currentUser._id, 
        // Gán luôn object currentUser vào user (đè lên mọi thứ server trả về)
        user: currentUser 
      };

      console.log("✅ [DEBUG] Comment sau khi ghép User:", realComment);

      // 4. Cập nhật Cache
      queryClient.setQueryData(['comments', variables.taskId], (old = []) => {
        return old.map(c => 
          // Tìm comment giả (temp-...) có nội dung giống để thay thế
          c._id.startsWith('temp-') && c.content === realComment.content 
            ? realComment 
            : c
        );
      });
    },
  });
};

// ... (Giữ nguyên phần useDeleteComment)
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onMutate: async ({ commentId, taskId }) => {
      if (!taskId) return;
      await queryClient.cancelQueries(['comments', taskId]);
      const previousComments = queryClient.getQueryData(['comments', taskId]);
      queryClient.setQueryData(['comments', taskId], (old = []) => {
        return old.filter(c => c._id !== commentId);
      });
      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (variables.taskId && context?.previousComments) {
        queryClient.setQueryData(['comments', variables.taskId], context.previousComments);
      }
    },
  });
};