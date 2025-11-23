import React, { useState, useEffect } from "react";
import { Calendar, Info, Clock, PauseCircle, CheckCircle, ChevronDown } from "lucide-react";
import ProjectActions from "./ProjectActions";
import { getProjectById, updateProjectStatus } from "../../services/projectService";
import SuccessDialog from "../common/SuccessDialog";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

export default function ProjectInfo({ project: initialProject, taskUpdatedFlag }) {
  const userId = localStorage.getItem("userId");
  const isCreator = initialProject.created_by?._id === userId;

  const [project, setProject] = useState(initialProject);
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const statusMap = {
    Planned: { text: "text-gray-700", bg: "bg-gray-200", icon: <Info size={16} /> },
    "In Progress": { text: "text-blue-700", bg: "bg-blue-100", icon: <Clock size={16} /> },
    Completed: { text: "text-green-700", bg: "bg-green-100", icon: <CheckCircle size={16} /> },
    "On Hold": { text: "text-yellow-700", bg: "bg-yellow-100", icon: <PauseCircle size={16} /> },
  };
  const statusOptions = Object.keys(statusMap);
  const statusInfo = statusMap[project.status] || statusMap.Planned;

  // ⚡ Khi taskUpdatedFlag thay đổi, fetch lại project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const updated = await getProjectById(initialProject._id);
        setProject(updated);
      } catch (err) {
        console.error("❌ Lỗi fetch project:", err.message);
      }
    };
    fetchProject();
  }, [taskUpdatedFlag]);

  const handleChangeStatus = async (newStatus) => {
    if (newStatus === project.status) {
      setStatusOpen(false);
      return;
    }
    try {
      setLoading(true);
      await updateProjectStatus(project._id, newStatus);
      setProject({ ...project, status: newStatus });
      setDialogMessage("Cập nhật trạng thái thành công!");
      setDialogOpen(true);
    } catch (err) {
      setDialogMessage(`Lỗi: ${err.message}`);
      setDialogOpen(true);
    } finally {
      setLoading(false);
      setStatusOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{project.project_name}</h2>
          <ProjectActions project={project} />
        </div>

        <div className="bg-gray-50 p-4 rounded-md max-h-32 overflow-y-auto">
          <p className="text-gray-700">{project.description || "Chưa có mô tả dự án"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md shadow-sm">
            <Calendar className="text-blue-500" size={20} />
            <div>
              <p className="text-sm text-gray-500">Thời gian</p>
              <p className="font-medium">
                {formatDate(project.start_date)} → {formatDate(project.end_date)}
              </p>
            </div>
          </div>

          <div className="relative p-3 bg-gray-50 rounded-md shadow-sm">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => isCreator && setStatusOpen(!statusOpen)}
            >
              <div className="flex items-center gap-3">
                {statusInfo.icon}
                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <span className={`px-3 py-1 text-sm rounded-lg ${statusInfo.text} ${statusInfo.bg}`}>
                    {project.status}
                  </span>
                </div>
              </div>
              {isCreator && <ChevronDown size={18} className="text-gray-500" />}
            </div>

            {statusOpen && isCreator && (
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-md z-20 overflow-hidden">
                {statusOptions.map((item) => (
                  <button
                    key={item}
                    disabled={loading}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      item === project.status ? "bg-gray-50 font-semibold" : ""
                    }`}
                    onClick={() => handleChangeStatus(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {project.status === "In Progress" && (
            <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-500" size={20} />
                <p className="text-sm text-gray-500">Tiến độ</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>
              <p className="text-sm font-medium">{project.progress || 0}%</p>
            </div>
          )}
        </div>
      </div>

      <SuccessDialog open={dialogOpen} onClose={() => setDialogOpen(false)} message={dialogMessage} />
    </>
  );
}
