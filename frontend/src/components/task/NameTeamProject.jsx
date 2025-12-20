// src/components/task/NameTeamProject.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjectById } from "../../services/projectService";
import { ChevronRight, Users, FolderKanban, Loader2 } from "lucide-react";

export default function NameTeamProject({ task }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const proj = await getProjectById(task.project_id);
        setProject(proj);
      } catch (err) {
        console.error("Lỗi lấy project:", err);
        setError(err.message || "Không thể tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [task]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 animate-fade-in">
      {loading ? (
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span className="text-sm font-medium">Đang tải thông tin...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-bold text-sm">!</span>
          </div>
          <span className="text-sm text-red-700 font-medium">{error}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Breadcrumb Header */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <span className="text-sm font-semibold text-gray-500">Thuộc về:</span>
          </div>

          {/* Link tới nhóm */}
          <Link
            to={`/nhom/${project?.team?._id}`}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all hover:shadow-md"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <Users size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-blue-600 font-semibold">Nhóm</span>
              <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {project?.team?.team_name || "Không xác định"}
              </span>
            </div>
          </Link>

          {/* Separator */}
          <ChevronRight size={20} className="text-gray-300" />

          {/* Link tới dự án */}
          <Link
            to={`/duan/${project?._id}`}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl transition-all hover:shadow-md"
          >
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
              <FolderKanban size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-purple-600 font-semibold">Dự án</span>
              <span className="text-sm font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                {project?.project_name || "Không xác định"}
              </span>
            </div>
          </Link>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}