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
    staleTime: 0, // Comment nên realtime nhất có thể (hoặc cache ngắn 30s)
  });
};

// 💬 Gửi comment mới
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, content }) => createComment(taskId, content),
    onSuccess: (data, variables) => {
      // Refresh danh sách comment của task này
      queryClient.invalidateQueries(['comments', variables.taskId]);
      
      // (Tùy chọn) Cập nhật activity log
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// 🗑️ Xóa comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: (data, commentId) => {
      // Vì API delete không trả về taskId, ta nên invalidate rộng hơn
      // Hoặc cách tốt nhất: Backend trả về taskId, hoặc Frontend truyền taskId vào mutation context
      queryClient.invalidateQueries({ queryKey: ['comments'] }); 
    },
  });
};