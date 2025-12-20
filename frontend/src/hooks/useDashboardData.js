// frontend/src/hooks/useDashboardData.js
import { useQuery } from '@tanstack/react-query';
import { getMyTasks } from '../services/taskService';
import { getMyTeams } from '../services/teamService';
import { getMyProjects } from '../services/projectService';
import { getMyActivities } from '../services/activityService';

export const useTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeams = () => {
  return useQuery({
    queryKey: ['my-teams'],
    queryFn: getMyTeams,
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: getMyProjects,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook cho activities
export const useActivities = (limit = 5, page = 1) => {
  return useQuery({
    queryKey: ['my-activities', limit, page],
    queryFn: () => getMyActivities({ limit, page }),
    staleTime: 2 * 60 * 1000, // Activities thay đổi nhanh hơn, cache 2 phút
    select: (data) => data.data || [], // Lấy data.data luôn
  });
};

// Hook tổng hợp cho Dashboard
export const useDashboardData = () => {
  const tasksQuery = useTasks();
  const teamsQuery = useTeams();
  const projectsQuery = useProjects();
  const activitiesQuery = useActivities(5, 1);

  return {
    tasks: tasksQuery.data || [],
    teams: teamsQuery.data || [],
    projects: projectsQuery.data || [],
    activities: activitiesQuery.data || [],
    loading: tasksQuery.isLoading || teamsQuery.isLoading || projectsQuery.isLoading || activitiesQuery.isLoading,
    error: tasksQuery.error || teamsQuery.error || projectsQuery.error || activitiesQuery.error,
    refetch: () => {
      tasksQuery.refetch();
      teamsQuery.refetch();
      projectsQuery.refetch();
      activitiesQuery.refetch();
    },
  };
};