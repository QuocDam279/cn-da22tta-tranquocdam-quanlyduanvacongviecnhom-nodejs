import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users } from "lucide-react";
import Header from "../components/common/Header";
import ProjectInfo from "../components/project/ProjectInfo";
import TaskList from "../components/task/TaskList";
import CreateTaskButton from "../components/task/CreateTaskButton";

// Import hooks
import { useProjectDetail } from "../hooks/useProjects";
import { useTasksByProject } from "../hooks/useTasks";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  // ✅ Fetch project với React Query
  const {
    data: projectData,
    isLoading: loading,
    error: projectError,
    refetch: refetchProject,
  } = useProjectDetail(id);

  // ✅ Fetch tasks với React Query
  const {
    data: tasks = [],
    isLoading: taskLoading,
    refetch: refetchTasks,
  } = useTasksByProject(id);

  // ✅ Cập nhật local state từ fetched data
  useEffect(() => {
    if (projectData) {
      setProject(projectData);
    }
  }, [projectData]);

  // ✅ Refetch khi component mount hoặc id thay đổi
  useEffect(() => {
    if (id) {
      refetchProject();
      refetchTasks();
    }
  }, [id, refetchProject, refetchTasks]);

  // ✅ Handle project updated
  const handleProjectUpdated = (updatedProject) => {
    setProject(updatedProject);
    refetchProject();
  };

  // ✅ Handle task updated/created
  const handleTaskChange = () => {
    refetchTasks();
    refetchProject();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Loading state */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-medium">Đang tải chi tiết dự án...</p>
              </div>
            </div>
          </div>
        ) : projectError ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 font-medium">
                  {projectError.message || "Lỗi khi tải chi tiết dự án"}
                </p>
                <p className="text-gray-500 text-sm">Vui lòng thử lại sau</p>
              </div>
            </div>
          </div>
        ) : !project ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-yellow-800 font-medium">Không tìm thấy dự án</p>
                <p className="text-gray-500 text-sm">
                  Dự án có thể đã bị xóa hoặc bạn không có quyền truy cập
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ✨ BREADCRUMB - Nhỏ gọn như NameTeamProject */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2.5 inline-flex items-center gap-2 animate-fade-in">
              <Link
                to={`/nhom/${project.team?._id}`}
                className="group flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
              >
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                  <Users size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {project.team?.team_name || "N/A"}
                </span>
              </Link>
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              <ProjectInfo
                project={project}
                tasks={tasks}
                taskLoading={taskLoading}
                onProjectUpdated={handleProjectUpdated}
              />
            </div>

            {/* Task List Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Danh sách công việc ({tasks.length})
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {taskLoading ? (
                  <div className="flex justify-center items-center h-48">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-500 font-medium">Đang tải công việc...</p>
                    </div>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <TaskList
                      tasks={tasks}
                      onTaskUpdated={handleTaskChange}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-48">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">📝</span>
                      </div>
                      <p className="text-gray-500 font-medium">Chưa có công việc nào</p>
                      <p className="text-gray-400 text-sm">
                        Hãy tạo công việc đầu tiên để bắt đầu!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Task Button */}
            <div className="animate-fade-in">
              <CreateTaskButton
                projectId={id}
                onCreated={handleTaskChange}
                members={project.team_members || []}
                projectStartDate={project.start_date?.slice(0, 10)}
                projectEndDate={project.end_date?.slice(0, 10)}
              />
            </div>
          </>
        )}
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}