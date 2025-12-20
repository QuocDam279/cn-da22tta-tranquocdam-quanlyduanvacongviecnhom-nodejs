// src/components/project/ProjectCard.jsx
import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { useTasksByProject } from "../../hooks/useTasks";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // ✅ Fetch tasks bằng React Query hook
  const { data: tasks = [], isLoading: loadingTasks } = useTasksByProject(project._id);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleClick = () => navigate(`/duan/${project._id}`);
  const progressValue = project.progress || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-1 bg-gradient-to-r from-indigo-50 to-white">
        <h4 className="text-md font-semibold text-gray-800 truncate">
          {project.project_name}
        </h4>
      </div>

      {/* Dates */}
      <div className="px-3 py-1 flex items-center gap-1 text-gray-500 text-xs">
        <Calendar size={14} />
        <span>
          {formatDate(project.start_date)} - {formatDate(project.end_date)}
        </span>
      </div>

      {/* Progress */}
      <div className="px-3 pb-2">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <p className="text-right text-[10px] text-gray-500 mt-1">
          {progressValue}% hoàn thành
        </p>
      </div>

      {/* Tasks Preview */}
      <div className="px-3 pb-3 text-xs text-gray-700 space-y-1">
        <p className="font-medium text-gray-600 mb-1">Công việc:</p>

        {loadingTasks ? (
          <p className="text-gray-400">Đang tải...</p>
        ) : tasks.length > 0 ? (
          tasks.slice(0, 3).map((task) => (
            <p key={task._id} className="truncate">• {task.task_name}</p>
          ))
        ) : (
          <p className="text-gray-400">Chưa có công việc</p>
        )}
      </div>
    </div>
  );
}