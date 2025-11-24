import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // Định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleClick = () => {
    navigate(`/duan/${project._id}`);
  };

  const progressValue = project.progress || 0;

  return (
    <div
      className="border p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-white"
      onClick={handleClick}
    >
      {/* Tên project */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <h4 className="font-semibold text-lg text-gray-800 truncate flex-1">
          {project.project_name}
        </h4>
      </div>

      {/* Mô tả */}
      <p className="text-gray-600 mb-2 truncate">
        {project.description || "Chưa có mô tả"}
      </p>

      {/* Thời gian */}
      <p className="text-sm text-gray-500 mb-2">
        {formatDate(project.start_date)} - {formatDate(project.end_date)}
      </p>

      {/* Progress luôn hiển thị */}
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${progressValue}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 mt-1 text-right">
        {progressValue}% hoàn thành
      </p>
    </div>
  );
}
