// ============================================================
// 📁 hooks/useTasks.js - FIX ĐƠN GIẢN
// ============================================================
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
// QUERY HOOKS - KHÔNG ĐỔI
// ============================================================
export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTasksByProject = (projectId) => {
  return useQuery({
    queryKey: ['tasks', 'project', projectId],
    queryFn: () => getTasksByProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTaskDetail = (taskId) => {
  return useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTaskStats = (projectId = null) => {
  return useQuery({
    queryKey: projectId ? ['task-stats', projectId] : ['task-stats'],
    queryFn: () => getTaskStats(projectId),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ============================================================
// HELPER: UPDATE TASK IN CACHE
// ============================================================
const updateTaskInCache = (queryClient, updatedTask) => {
  if (!updatedTask || !updatedTask._id) return;

  queryClient.setQueryData(['tasks', updatedTask._id], (oldData) => {
    if (!oldData) return updatedTask;
    return { ...oldData, ...updatedTask };
  });

  if (updatedTask.project_id) {
    queryClient.setQueryData(['tasks', 'project', updatedTask.project_id], (oldList) => {
      if (!oldList) return oldList;
      return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
    });
  }

  queryClient.setQueryData(['my-tasks'], (oldList) => {
    if (!oldList) return oldList;
    return oldList.map((t) => (t._id === updatedTask._id ? { ...t, ...updatedTask } : t));
  });
};

// 🔥 HELPER MỚI: Invalidate project queries để refetch progress
const invalidateProjectProgress = (queryClient, projectId) => {
  if (!projectId) return;
  
  // Invalidate tất cả queries liên quan đến project
  queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  queryClient.invalidateQueries({ queryKey: ['my-projects'] });
  queryClient.invalidateQueries({ queryKey: ['projects', 'team'] });
};

// ============================================================
// MUTATION HOOKS
// ============================================================

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask, variables) => {
      const taskAdded = newTask.task || newTask;

      if (variables.project_id) {
        queryClient.setQueryData(['tasks', 'project', variables.project_id], (oldList) => {
          return oldList ? [taskAdded, ...oldList] : [taskAdded];
        });
        
        queryClient.invalidateQueries({ queryKey: ['task-stats', variables.project_id] });
        
        // 🔥 THÊM: Invalidate project để refetch progress
        invalidateProjectProgress(queryClient, variables.project_id);
      }

      queryClient.setQueryData(['my-tasks'], (oldList) => {
         return oldList ? [taskAdded, ...oldList] : [taskAdded];
      });

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
       
       // 🔥 THÊM: Invalidate project để refetch progress
       if (taskData.project_id) {
         invalidateProjectProgress(queryClient, taskData.project_id);
       }
       
       queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data, taskId) => {
      // Lấy projectId từ cache trước khi xóa
      const taskCache = queryClient.getQueryData(['tasks', taskId]);
      const projectId = taskCache?.project_id;

      queryClient.removeQueries({ queryKey: ['tasks', taskId] });
      
      queryClient.setQueriesData({ queryKey: ['tasks', 'project'] }, (oldList) => {
         return oldList ? oldList.filter(t => t._id !== taskId) : oldList;
      });
      
      queryClient.setQueryData(['my-tasks'], (oldList) => {
         return oldList ? oldList.filter(t => t._id !== taskId) : oldList;
      });

      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // 🔥 THÊM: Invalidate project để refetch progress
      if (projectId) {
        invalidateProjectProgress(queryClient, projectId);
      }
    },
  });
};

// ============================================================
// 🔥 SPECIFIC UPDATE HOOKS - THÊM INVALIDATE PROJECT
// ============================================================

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, progress }) => updateTaskStatus(taskId, status, progress),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      
      // 🔥 THÊM: Invalidate project để refetch progress
      if (taskData.project_id) {
        invalidateProjectProgress(queryClient, taskData.project_id);
      }
    },
  });
};

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, progress, status }) => updateTaskProgress(taskId, progress, status),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      
      // 🔥 THÊM: Invalidate project để refetch progress
      if (taskData.project_id) {
        invalidateProjectProgress(queryClient, taskData.project_id);
      }
    },
  });
};

export const useUpdateTaskPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, priority }) => updateTaskPriority(taskId, priority),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      // Priority không ảnh hưởng progress
    },
  });
};

export const useUpdateTaskAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId }) => updateTaskAssignee(taskId, userId),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      // Assignee không ảnh hưởng progress
    },
  });
};

export const useUpdateTaskDueDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, dueDate }) => updateTaskDueDate(taskId, dueDate),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      // Due date không ảnh hưởng progress
    },
  });
};

export const useUpdateTaskStartDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, startDate }) => updateTask(taskId, { start_date: startDate }),
    onSuccess: (data) => {
      const taskData = data.task ?? data;
      updateTaskInCache(queryClient, taskData);
      // Start date không ảnh hưởng progress
    },
  });
};