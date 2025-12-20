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
} from '../services/taskService';

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

// Lấy tất cả task của user hiện tại
export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 3 * 60 * 1000,
  });
};

// Lấy tasks theo project
export const useTasksByProject = (projectId) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
};

// Lấy chi tiết task
export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Lấy thống kê task
export const useTaskStats = (projectId = null) => {
  return useQuery({
    queryKey: projectId ? ['task-stats', projectId] : ['task-stats'],
    queryFn: () => getTaskStats(projectId),
    staleTime: 5 * 60 * 1000,
  });
};

// ========================
// 🟩 MUTATION HOOKS
// ========================

// Tạo task mới
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data, variables) => {
      if (variables.project_id) {
        queryClient.invalidateQueries(['tasks', 'project', variables.project_id]);
        // ✅ Invalidate project để cập nhật progress
        queryClient.invalidateQueries(['projects', variables.project_id]);
      }
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['my-projects']);
      queryClient.invalidateQueries(['task-stats']);
    },
  });
};

// ✅ CẬP NHẬT TASK (ĐÃ TỐI ƯU + ĐỒNG BỘ PROJECT)
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),

    onSuccess: (data, variables) => {
      const updatedTask = data.task ?? data;

      // ✅ 1. Update cache chi tiết task (KHÔNG GET lại)
      queryClient.setQueryData(
        ['tasks', variables.taskId],
        updatedTask
      );

      // ✅ 2. Invalidate danh sách task
      if (updatedTask.project_id) {
        queryClient.invalidateQueries(['tasks', 'project', updatedTask.project_id]);
        
        // ✅ 3. INVALIDATE PROJECT để cập nhật progress/stats
        queryClient.invalidateQueries(['projects', updatedTask.project_id]);
      }

      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['my-projects']);
      queryClient.invalidateQueries(['task-stats']);
    },
  });
};

// Xóa task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    onSuccess: (data, taskId) => {
      const deletedTask = data.task ?? data;

      // ❌ Xóa cache task detail
      queryClient.removeQueries(['tasks', taskId]);

      // 🔄 Refresh list & stats
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['task-stats']);

      // Invalidate toàn bộ project list
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project'],
        exact: false,
      });

      // ✅ INVALIDATE PROJECT nếu biết project_id
      if (deletedTask?.project_id) {
        queryClient.invalidateQueries(['projects', deletedTask.project_id]);
      }
      queryClient.invalidateQueries(['my-projects']);
    },
  });
};