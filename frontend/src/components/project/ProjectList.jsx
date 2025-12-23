import ProjectCard from "./ProjectCard";
import { AlertCircle, FolderX, Zap } from "lucide-react";

export default function ProjectList({ projects, loading, error }) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Đang tải dự án...</p>
          <p className="text-xs text-gray-400 mt-1">Vui lòng chờ một chút</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 mb-1">Lỗi tải dự án</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <FolderX size={48} className="text-gray-300" />
            <Zap size={20} className="absolute -bottom-1 -right-1 text-yellow-400 bg-white rounded-full p-0.5" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          Chưa có dự án nào
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Hãy tạo dự án đầu tiên để bắt đầu quản lý công việc nhóm của bạn!
        </p>
        <p className="text-xs text-gray-400 mt-3">
          💡 Bấm nút "Tạo dự án" ở dưới để bắt đầu
        </p>
      </div>
    );
  }

  // Projects grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
        />
      ))}
    </div>
  );
}