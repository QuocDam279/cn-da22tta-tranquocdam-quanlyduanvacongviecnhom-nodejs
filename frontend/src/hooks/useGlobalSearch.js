import { useState, useMemo } from 'react';
import { useMyTeams } from './useTeams';
import { useMyProjects } from './useProjects';
import { useMyTasks } from './useTasks';

export const useGlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy dữ liệu từ Cache (React Query sẽ tự cache, không gọi API liên tục)
  const { data: teams = [] } = useMyTeams();
  const { data: projects = [] } = useMyProjects();
  const { data: tasks = [] } = useMyTasks();

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return { teams: [], projects: [], tasks: [] };

    const lowerTerm = searchTerm.toLowerCase();

    // 1. Lọc Team
    const filteredTeams = teams.filter(t => 
      t.team_name?.toLowerCase().includes(lowerTerm)
    ).slice(0, 5); // Giới hạn 5 kết quả

    // 2. Lọc Project
    const filteredProjects = projects.filter(p => 
      p.project_name?.toLowerCase().includes(lowerTerm)
    ).slice(0, 5);

    // 3. Lọc Task
    const filteredTasks = tasks.filter(t => 
      t.task_name?.toLowerCase().includes(lowerTerm)
    ).slice(0, 5);

    return {
      teams: filteredTeams,
      projects: filteredProjects,
      tasks: filteredTasks,
      hasResults: filteredTeams.length > 0 || filteredProjects.length > 0 || filteredTasks.length > 0
    };
  }, [searchTerm, teams, projects, tasks]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults
  };
};