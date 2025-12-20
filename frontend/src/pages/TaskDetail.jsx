// ========================================
// 2. TaskDetail.jsx - IMPROVED (No Menu)
// ========================================
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Briefcase } from "lucide-react";

import Header from "../components/common/Header";
import TaskHeader from "../components/task/TaskHeader";
import TaskSidebar from "../components/task/TaskSidebar";
import NameTeamProject from "../components/task/NameTeamProject";

import { useTaskDetail } from "../hooks/useTasks";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const {
    data: task,
    isLoading,
    isError,
    error,
  } = useTaskDetail(id);

  const handleDeleted = () => {
    navigate("/congviec");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Loading State */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-medium">Đang tải chi tiết công việc...</p>
              </div>
            </div>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 font-medium">
                  {error?.message || "Lỗi khi tải công việc"}
                </p>
                <p className="text-gray-500 text-sm">Vui lòng thử lại sau</p>
              </div>
            </div>
          </div>
        ) : !task ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-yellow-800 font-medium">Không tìm thấy công việc</p>
                <p className="text-gray-500 text-sm">Công việc có thể đã bị xóa</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Team & Project Info */}
            <div className="animate-fade-in">
              <NameTeamProject task={task} />
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT: Main Content (2/3) */}
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                <TaskHeader
                  task={task}
                  onUpdated={() => {}}
                  onDeleted={handleDeleted}
                  currentUserId={currentUser?._id}
                />
              </div>

              {/* RIGHT: Sidebar (1/3) */}
              <div className="lg:col-span-1 animate-fade-in">
                <TaskSidebar
                  task={task}
                  onUpdated={() => {}}
                  currentUser={currentUser}
                />
              </div>
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