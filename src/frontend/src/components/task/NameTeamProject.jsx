import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getProjectById } from "../../services/projectService";
import { ChevronRight, Users, FolderKanban, Loader2 } from "lucide-react";

export default function NameTeamProject({ task }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadedProjectId = useRef(null);

  useEffect(() => {
    if (!task || !task.project_id) return;
    
    if (loadedProjectId.current === task.project_id) {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const proj = await getProjectById(task.project_id);
        setProject(proj);
        loadedProjectId.current = task.project_id;
      } catch (err) {
        console.error("Lỗi lấy project:", err);
        setError(err.message || "Không thể tải thông tin dự án");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [task?.project_id]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2.5 inline-flex items-center gap-2">
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 size={14} className="animate-spin text-blue-500" />
          <span className="text-xs font-medium">Đang tải...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold text-xs">!</span>
          </div>
          <span className="text-xs text-red-700 font-medium">{error}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          
          <Link
            to={`/nhom/${project?.team?._id}`}
            className="group flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
          >
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <Users size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {project?.team?.team_name || "N/A"}
            </span>
          </Link>

          <ChevronRight size={14} className="text-gray-300" />

          <Link
            to={`/duan/${project?._id}`}
            className="group flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all"
          >
            <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
              <FolderKanban size={12} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
              {project?.project_name || "N/A"}
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}