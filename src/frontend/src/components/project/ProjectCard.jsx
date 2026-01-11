import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  };

  const handleClick = () => navigate(`/duan/${project._id}`);
  const progressValue = project.progress || 0;

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      {/* Header & Tên dự án */}
      <div className="px-4 pt-4 pb-2 bg-gradient-to-r from-indigo-50 to-white group-hover:from-indigo-100 transition-colors">
        <h4 
          className="text-base font-semibold text-gray-800 truncate group-hover:text-indigo-700" 
          title={project.project_name}
        >
          {project.project_name}
        </h4>
      </div>

      {/* Ngày tháng */}
      <div className="px-4 py-2 flex items-center gap-2 text-gray-500 text-xs">
        <Calendar size={14} className="flex-shrink-0" />
        <span className="truncate">
          {formatDate(project.start_date)} - {formatDate(project.end_date)}
        </span>
      </div>

      {/* Thanh tiến độ */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Tiến độ</span>
          <span className="text-xs font-bold text-indigo-600">{Math.round(progressValue)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}