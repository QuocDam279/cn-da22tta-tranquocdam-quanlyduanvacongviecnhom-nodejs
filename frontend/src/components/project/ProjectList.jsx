// src/components/project/ProjectList.jsx
import ProjectCard from "./ProjectCard";
import { useNavigate } from "react-router-dom";

export default function ProjectList({ projects, loading, error }) {
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải dự án...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">Chưa có dự án nào</p>
        <p className="text-sm text-gray-500 mt-2">
          Hãy tạo dự án đầu tiên để bắt đầu!
        </p>
      </div>
    );
  }

  // Projects grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onClick={() => navigate(`/duan/${project._id}`)}
        />
      ))}
    </div>
  );
}