import { useNavigate } from "react-router-dom";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // Định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const statusColor = (status) => {
    switch (status) {
      case "Planned":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleClick = () => {
    navigate(`/duan/${project._id}`);
  };

  return (
    <div
      className="border p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer bg-white"
      onClick={handleClick}
    >
      {/* Tên project + trạng thái */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-lg text-gray-800">{project.project_name}</h4>
        {project.status && (
          <span className={`px-2 py-0.5 rounded text-sm font-medium ${statusColor(project.status)}`}>
            {project.status}
          </span>
        )}
      </div>

      {/* Mô tả */}
      <p className="text-gray-600 mb-2 truncate">{project.description || "Chưa có mô tả"}</p>

      {/* Thời gian */}
      <p className="text-sm text-gray-500 mb-2">
        {formatDate(project.start_date)} - {formatDate(project.end_date)}
      </p>

      {/* Progress bar chỉ khi In Progress */}
      {project.status === "In Progress" && project.progress !== undefined && (
        <>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-right">{project.progress}% hoàn thành</p>
        </>
      )}
    </div>
  );
}
