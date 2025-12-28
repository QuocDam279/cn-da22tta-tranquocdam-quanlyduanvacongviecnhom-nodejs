// src/hooks/useTasks.js
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

// ============================================================
// 🟦 QUERY HOOKS (GET DATA)
// ============================================================

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnWindowFocus: false, // 🛑 Chặn refetch khi Alt+Tab
  });
};

export const useTasksByProject = (projectId) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // 🛑 Chặn refetch khi đóng Modal
  });
};

export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false, // 🛑 Chặn refetch
  });
};

export const useTaskStats = (projectId = null) => {
  return useQuery({
    queryKey: projectId ? ['task-stats', projectId] : ['task-stats'],
    queryFn: () => getTaskStats(projectId),
    staleTime: 10 * 60 * 1000, // Stats ít thay đổi, cache lâu hơn
    refetchOnWindowFocus: false,
  });
};

// ============================================================
// 🔥 HELPER: MANUAL CACHE UPDATE (OPTIMISTIC UI) 🔥
// ============================================================

/**
 * Hàm này cập nhật trực tiếp vào Cache của React Query 
 * giúp UI thay đổi ngay lập tức mà không cần gọi API tải lại danh sách.
 */
const updateTaskInCache = (queryClient, updatedTask) => {
  if (!updatedTask || !updatedTask._id) return;

  // 1. Cập nhật trang chi tiết task (nếu đang mở)
  queryClient.setQueryData(['tasks', updatedTask._id], (oldData) => {
    if (!oldData) return updatedTask;
    return { ...oldData, ...updatedTask };
  });

  // 2. Cập nhật trong danh sách Task của Project
  if (updatedTask.project_id) {
    queryClient.setQueryData(['tasks', 'project', updatedTask.project_id], (oldList) => {
      if (!oldList) return oldList;
      return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
    });
  }

  // 3. Cập nhật trong danh sách "My Tasks"
  queryClient.setQueryData(['my-tasks'], (oldList) => {
    if (!oldList) return oldList;
    return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
  });

  // Lưu ý: Không invalidate 'activities' ở đây để tránh spam request với các thay đổi nhỏ (progress, status)
};

// ============================================================
// 🟩 MUTATION HOOKS (CREATE, UPDATE, DELETE)
// ============================================================

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask, variables) => {
      // Backend thường trả về { message, task } hoặc object task
      const taskAdded = newTask.task || newTask; 

      // 1. Chèn vào cache danh sách Task của Project
      if (variables.project_id) {
        queryClient.setQueryData(['tasks', 'project', variables.project_id], (oldList) => {
          return oldList ? [taskAdded, ...oldList] : [taskAdded];
        });
        
        // Stats cần tính lại (nhẹ)
        queryClient.invalidateQueries({ queryKey: ['task-stats', variables.project_id] });
      }

      // 2. Chèn vào cache danh sách "My Tasks"
      queryClient.setQueryData(['my-tasks'], (oldList) => {
         return oldList ? [taskAdded, ...oldList] : [taskAdded];
      });

      // 3. Activity Logs: Cần hiện ngay log tạo mới
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: (data) => {
       const taskData = data.task || data; 
       updateTaskInCache(queryClient, taskData);
       // Với update full, có thể cần cập nhật log
       queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data, taskId) => {
      // 1. Xóa cache chi tiết
      queryClient.removeQueries({ queryKey: ['tasks', taskId] });
      
      // 2. Lọc bỏ task khỏi các danh sách (Project & My Tasks)
      // Dùng setQueriesData để quét qua tất cả các key khớp pattern
      queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (oldList) => {
         return oldList ? oldList.filter(t => t._id !== taskId) : oldList;
      });
      
      queryClient.setQueryData(['my-tasks'], (oldList) => {
         return oldList ? oldList.filter(t => t._id !== taskId) : oldList;
      });

      // 3. Cập nhật Stats & Activity
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

// ============================================================
// 🟧 SPECIFIC UPDATE HOOKS (Partial Updates)
// ============================================================

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, progress }) => updateTaskStatus(taskId, status, progress),
    onSuccess: (data) => updateTaskInCache(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
        // Người được assign thay đổi -> Cần báo cho user -> Invalidate activities
        queryClient.invalidateQueries({ queryKey: ['activities'] }); 
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