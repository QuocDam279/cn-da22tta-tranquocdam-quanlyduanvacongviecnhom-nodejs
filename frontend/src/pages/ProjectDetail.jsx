// src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/common/Header";
import ProjectInfo from "../components/project/ProjectInfo";
import TaskList from "../components/task/TaskList";
import CreateTaskButton from "../components/task/CreateTaskButton";
import { Users } from "lucide-react";

// Import hooks
import { useProjectDetail } from "../hooks/useProjects";
import { useTasksByProject } from "../hooks/useTasks";

export default function ProjectDetail() {
  const { id } = useParams();

  // ✅ Fetch project với React Query
  const {
    data: project,
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

  // ✅ Refetch khi component mount hoặc id thay đổi
  useEffect(() => {
    refetchProject();
    refetchTasks();
  }, [id, refetchProject, refetchTasks]);

  // Handle task updated - React Query sẽ tự động refetch
  const handleTaskUpdated = () => {
    // Không cần làm gì - React Query mutations đã invalidate queries
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
                <p className="text-gray-500 text-sm">Dự án có thể đã bị xóa hoặc bạn không có quyền truy cập</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ✨ IMPROVED BREADCRUMB - Đồng bộ với NameTeamProject */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-5 animate-fade-in">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Back Arrow + Label */}
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-500">Quay lại:</span>
                </div>

                {/* Link tới nhóm */}
                <Link
                  to={`/nhom/${project.team?._id}`}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all hover:shadow-md"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-600 font-semibold">Nhóm</span>
                    <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {project.team?.team_name || "Không xác định"}
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Project Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              <ProjectInfo 
                project={project} 
                tasks={tasks} 
                taskLoading={taskLoading} 
              />
            </div>

            {/* Task List Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-800">Danh sách công việc</h3>
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
                    <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
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
                onCreated={handleTaskUpdated}
                members={project.team_members || []}
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