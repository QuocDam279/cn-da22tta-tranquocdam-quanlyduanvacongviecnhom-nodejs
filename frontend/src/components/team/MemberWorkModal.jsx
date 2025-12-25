// src/components/teams/MemberWorkModal.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom"; // 🔥 Import Link để điều hướng
import { X, Briefcase, Clock, AlertCircle } from "lucide-react";
import { useProjectsByTeam } from "../../hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { getTasksByProject } from "../../services/taskService";

// --- CONFIGURATION ---
const statusConfig = {
  "To Do": { label: "Chưa bắt đầu", color: "gray" },
  "In Progress": { label: "Đang làm", color: "blue" },
  "Done": { label: "Hoàn thành", color: "green" },
  "Pending": { label: "Tạm dừng", color: "yellow" },
  "not-started": { label: "Chưa bắt đầu", color: "gray" },
  "in-progress": { label: "Đang làm", color: "blue" },
  "completed": { label: "Hoàn thành", color: "green" },
  "pending": { label: "Tạm dừng", color: "yellow" },
};

const priorityConfig = {
  Low: { label: "Thấp", color: "green" },
  Medium: { label: "Trung bình", color: "yellow" },
  High: { label: "Cao", color: "orange" },
  Urgent: { label: "Khẩn cấp", color: "red" },
  low: { label: "Thấp", color: "green" },
  medium: { label: "Trung bình", color: "yellow" },
  high: { label: "Cao", color: "orange" },
  urgent: { label: "Khẩn cấp", color: "red" },
};

// --- SUB COMPONENTS ---

// 1. UserAvatar Component
const UserAvatar = ({ user, className = "w-10 h-10" }) => {
  const [imgError, setImgError] = useState(false);

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith("http")) {
      return user.avatar.replace("http://", "https://");
    }
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "").replace(/\/$/, "") || "";
    return `${baseUrl}${user.avatar}`;
  }, [user]);

  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.full_name || user?.name || "User"
  )}&background=random&color=fff`;

  return (
    <div className={`${className} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200`}>
      <img
        src={(!imgError && avatarSrc) ? avatarSrc : fallbackSrc}
        alt={user?.full_name || "Avatar"}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

// 2. TaskItem Component (Đã cập nhật Link)
const TaskItem = ({ task, onCloseModal }) => {
  const status = statusConfig[task.status] || { label: task.status, color: "gray" };
  const priority = priorityConfig[task.priority] || { label: task.priority, color: "gray" };

  return (
    <Link
      to={`/congviec/${task._id}`} // 🔥 Đường dẫn tới trang chi tiết công việc
      onClick={onCloseModal} // (Tuỳ chọn) Đóng modal khi click để chuyển trang mượt hơn
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-blue-200 group"
    >
      <div className="flex-1">
        <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
            {task.task_name}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className={`px-2 py-0.5 rounded-md ${
            status.color === 'gray' ? 'bg-gray-100 text-gray-700' :
            status.color === 'blue' ? 'bg-blue-100 text-blue-700' :
            status.color === 'green' ? 'bg-green-100 text-green-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {status.label}
          </span>
          <span className={`px-2 py-0.5 rounded-md ${
            priority.color === 'green' ? 'bg-green-100 text-green-700' :
            priority.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            priority.color === 'orange' ? 'bg-orange-100 text-orange-700' :
            priority.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {priority.label}
          </span>
          {task.progress !== undefined && (
            <span className="text-gray-600">Tiến độ: {task.progress}%</span>
          )}
        </div>
      </div>
      {task.due_date && (
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock size={12} />
          {new Date(task.due_date).toLocaleDateString("vi-VN")}
        </div>
      )}
    </Link>
  );
};

// 3. ProjectSection Component
const ProjectSection = ({ project, member, onCloseModal }) => {
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', 'project', project._id],
    queryFn: () => getTasksByProject(project._id),
    staleTime: 2 * 60 * 1000,
  });

  const memberTasks = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.filter(task => task.assigned_to?._id === member._id);
  }, [tasksData, member._id]);

  if (memberTasks.length === 0) return null;

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center gap-3 mb-3">
        <Briefcase size={18} className="text-blue-600" />
        <h4 className="font-semibold text-gray-800">{project.project_name || project.name}</h4>
        <span className="text-sm text-gray-500">
          ({memberTasks.length} công việc)
        </span>
      </div>

      <div className="space-y-2">
        {memberTasks.map(task => (
          <TaskItem key={task._id} task={task} onCloseModal={onCloseModal} />
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function MemberWorkModal({ member, teamId, onClose }) {
  const { data: projectsData, isLoading: loadingProjects } = useProjectsByTeam(teamId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UserAvatar user={member} className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Công việc của {member.full_name}
              </h3>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : projectsData && projectsData.length > 0 ? (
            <div className="space-y-4">
              {projectsData.map(project => (
                <ProjectSection 
                    key={project._id} 
                    project={project} 
                    member={member} 
                    onCloseModal={onClose} // Truyền onClose xuống để đóng modal khi click task
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <AlertCircle size={48} className="mb-3" />
              <p className="text-lg">Không có dự án nào trong nhóm</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}