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

// --- QUERY HOOKS ---

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

// --- MUTATION HOOKS ---

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (data, variables) => {
      if (variables.project_id) {
        queryClient.invalidateQueries(['tasks', 'project', variables.project_id]);
        queryClient.invalidateQueries(['projects', variables.project_id]);
      }
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }) => updateTask(taskId, payload),
    onSuccess: (data, variables) => {
      const updatedTask = data.task ?? data;
      queryClient.setQueryData(['tasks', variables.taskId], updatedTask);

      if (updatedTask.project_id) {
        queryClient.invalidateQueries(['tasks', 'project', updatedTask.project_id]);
      }
      queryClient.invalidateQueries(['activities']);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (data, taskId) => {
      queryClient.removeQueries(['tasks', taskId]);
      
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project'],
        exact: false,
      });
      queryClient.invalidateQueries(['activities']);
    },
  });
};

// --- SPECIFIC UPDATE HOOKS & HELPER ---

const invalidateTaskCaches = (queryClient, updatedTask) => {
  if (updatedTask._id) {
    queryClient.setQueryData(['tasks', updatedTask._id], updatedTask);
  }
  if (updatedTask.project_id) {
    queryClient.invalidateQueries(['tasks', 'project', updatedTask.project_id]);
  }
  queryClient.invalidateQueries(['activities']);
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, progress }) => updateTaskProgress(taskId, progress),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskPriority = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, priority }) => updateTaskPriority(taskId, priority),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, userId }) => updateTaskAssignee(taskId, userId),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

export const useUpdateTaskDueDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, dueDate }) => updateTaskDueDate(taskId, dueDate),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

// ✅ ADDED: Hook cho Start Date (Sử dụng updateTask chung)
export const useUpdateTaskStartDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, startDate }) => updateTask(taskId, { start_date: startDate }),
    onSuccess: (data) => invalidateTaskCaches(queryClient, data.task ?? data),
  });
};

// --- OPTIMISTIC UPDATE ---

export const useOptimisticUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates, updateFn }) => updateFn(taskId, updates),
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries(['tasks', taskId]);
      const previousTask = queryClient.getQueryData(['tasks', taskId]);
      queryClient.setQueryData(['tasks', taskId], (old) => ({ ...old, ...updates }));
      return { previousTask };
    },
    onSuccess: (data) => {
      invalidateTaskCaches(queryClient, data.task ?? data);
    },
    onError: (err, { taskId }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(['tasks', taskId], context.previousTask);
      }
    },
    onSettled: (data, error, { taskId }) => {
      queryClient.invalidateQueries(['tasks', taskId]);
    },
  });
};