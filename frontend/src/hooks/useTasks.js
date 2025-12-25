import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats,
  getMyTasks,
  updateTaskStatus,
  updateTaskProgress,
  updateTaskPriority,
  updateTaskAssignee,
  updateTaskDueDate,
} from '../services/taskService';

// --- QUERY HOOKS (Giữ nguyên) ---

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 3 * 60 * 1000,
  });
};

export const useTasksByProject = (projectId) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTaskStats = (projectId = null) => {
  return useQuery({
    queryKey: projectId ? ['task-stats', projectId] : ['task-stats'],
    queryFn: () => getTaskStats(projectId),
    staleTime: 5 * 60 * 1000,
  });
};

// --- 🔥 HELPER: CẬP NHẬT CACHE THÔNG MINH 🔥 ---

/**
 * Hàm này sẽ tìm Task trong danh sách đã cache và cập nhật nó
 * thay vì bắt server gửi lại toàn bộ danh sách.
 */
const updateTaskInCache = (queryClient, updatedTask) => {
  if (!updatedTask) return;

  // 1. Cập nhật trang chi tiết task (nếu đang mở)
  queryClient.setQueryData(['tasks', updatedTask._id], (oldData) => {
    // Nếu cache chi tiết chưa có, hoặc khác ID, giữ nguyên
    if (!oldData) return updatedTask;
    return { ...oldData, ...updatedTask };
  });

  // 2. Cập nhật trong danh sách Task của Project (QUAN TRỌNG NHẤT)
  if (updatedTask.project_id) {
    queryClient.setQueryData(['tasks', 'project', updatedTask.project_id], (oldList) => {
      if (!oldList) return oldList;
      // Tìm và thay thế task trong mảng
      return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
    });
  }

  // 3. Cập nhật trong danh sách "My Tasks"
  queryClient.setQueryData(['my-tasks'], (oldList) => {
    if (!oldList) return oldList;
    return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
  });

  // 4. Activity Logs: KHÔNG invalidate ngay lập tức với các thay đổi nhỏ (như progress)
  // Chỉ invalidate khi cần thiết hoặc chấp nhận độ trễ để giảm tải
  // queryClient.invalidateQueries(['activities']); // <-- Tạm tắt hoặc debounce cái này
};

// --- MUTATION HOOKS ---

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data, variables) => {
      // Create thì bắt buộc phải invalidate để lấy ID mới và sort lại
      if (variables.project_id) {
        queryClient.invalidateQueries(['tasks', 'project', variables.project_id]);
        queryClient.invalidateQueries(['task-stats', variables.project_id]); // Cập nhật thống kê
      }
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// 🔥 Sửa useUpdateTask để dùng Helper
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: (data) => {
        // Backend trả về { message, task } hoặc object task trực tiếp
        const taskData = data.task || data; 
        updateTaskInCache(queryClient, taskData);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data, taskId) => {
      // Xóa cache chi tiết
      queryClient.removeQueries(['tasks', taskId]);
      
      // Xóa task khỏi cache danh sách (Không cần gọi API lại)
      queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (oldList) => {
         if (!oldList) return oldList;
         return oldList.filter(t => t._id !== taskId);
      });

      // Vẫn nên invalidate stats vì số lượng thay đổi
      queryClient.invalidateQueries(['task-stats']);
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// --- SPECIFIC UPDATE HOOKS (Đã tối ưu) ---

// Các hook này giờ gọi updateTaskInCache thay vì invalidate toàn bộ

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 🔥 SỬA: Nhận thêm biến progress từ object variables
    mutationFn: ({ taskId, status, progress }) => updateTaskStatus(taskId, status, progress),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // 🔥 SỬA: Nhận thêm biến status từ object variables
    mutationFn: ({ taskId, progress, status }) => updateTaskProgress(taskId, progress, status),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, priority }) => updateTaskPriority(taskId, priority),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId }) => updateTaskAssignee(taskId, userId),
    onSuccess: (data) => {
        updateTaskInCache(queryClient, data.task ?? data);
        // Riêng Assignee thay đổi có thể cần reload activities để hiện thông báo
        queryClient.invalidateQueries(['activities']); 
    },
  });
};

export const useUpdateTaskDueDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, dueDate }) => updateTaskDueDate(taskId, dueDate),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskStartDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, startDate }) => updateTask(taskId, { start_date: startDate }),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};