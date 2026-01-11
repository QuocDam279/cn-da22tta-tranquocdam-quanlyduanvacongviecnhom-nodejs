import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MessageSquare, Layout, Clock } from "lucide-react";

// Components
import Header from "../components/common/Header";
import TaskHeader from "../components/task/TaskHeader";
import TaskSidebar from "../components/task/TaskSidebar";
import NameTeamProject from "../components/task/NameTeamProject";
import TaskComments from "../components/task/TaskComments";

// Hooks
import { useTaskDetail } from "../hooks/useTasks";
import { useProjectDetail } from "../hooks/useProjects";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // XÓA state này đi, không cần thiết
  // const [task, setTask] = useState(null); 

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setCurrentUser(JSON.parse(userData));
  }, []);

  const {
    data: taskData, // Đổi tên biến này để dùng trực tiếp
    isLoading: taskLoading,
    isError: taskError,
    error: taskErrorData,
    refetch: refetchTask,
  } = useTaskDetail(id);

  // Gán task bằng chính taskData từ React Query
  const task = taskData; 

  const projectId = task?.project_id; // Sửa lại cách lấy projectId
  const { data: projectData, isLoading: projectLoading } = useProjectDetail(projectId);

  const handleTaskUpdated = (updatedTask) => {

    refetchTask(); 
    toast.success("Đã cập nhật công việc");
  };

  const handleTaskDeleted = () => {
    toast.success("Đã xóa công việc");
    navigate("/congviec");
  };

  const isLoading = taskLoading || (projectId && projectLoading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20">
      <Header />

      <main className="pt-20 pb-12 px-4 max-w-[1600px] mx-auto">
        {isLoading ? (
          <LoadingView />
        ) : taskError ? (
          <ErrorView message={taskErrorData?.message} onRetry={refetchTask} />
        ) : !task ? (
          <NotFoundView />
        ) : (
          <div className="space-y-4 animate-fade-in">
            
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-between">
               <NameTeamProject task={task} />
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-400 shadow-sm">
                <Clock size={14} className="text-blue-500" />
                <span className="text-xs text-gray-500">
                  Cập nhật lần cuối vào
                </span>
                <span className="text-xs font-semibold text-gray-800">
                  {new Date(task.updated_at).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Main Layout: 2 cột (3 phần trái + 2 phần phải) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              
              {/* CỘT TRÁI: 3 phần (Task Info + Comments) */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* Task Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                   <TaskHeader
                      task={task}
                      onUpdated={handleTaskUpdated}
                      onDeleted={handleTaskDeleted}
                      currentUserId={currentUser?._id}
                    />
                </div>

                {/* Task Comments */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden flex flex-col" style={{maxHeight: 'calc(100vh - 20rem)', minHeight: '400px'}}>
                  <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <MessageSquare size={16} />
                    <span className="font-semibold text-sm">Thảo luận</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <TaskComments 
                        task={task} 
                        currentUser={currentUser} 
                    />
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: 2 phần (Sidebar) */}
              <div className="lg:col-span-2 lg:sticky lg:top-20 h-fit">
                <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 text-white flex items-center gap-2">
                        <Layout size={16} />
                        <span className="font-semibold text-sm">Chi tiết</span>
                    </div>
                    <TaskSidebar
                      task={task}
                      onUpdated={handleTaskUpdated}
                      currentUser={currentUser}
                      members={projectData?.team_members || []} 
                      project={projectData}
                    />
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// --- SUB COMPONENTS ---
const LoadingView = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
  </div>
);

const ErrorView = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-4xl">⚠️</span>
    </div>
    <h3 className="text-xl font-bold text-gray-800">Đã xảy ra lỗi</h3>
    <p className="text-red-600">{message || "Không thể tải thông tin"}</p>
    <button onClick={onRetry} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Thử lại</button>
  </div>
);

const NotFoundView = () => (
  <div className="text-center py-20">
    <p className="text-gray-500 text-lg">Không tìm thấy công việc này.</p>
  </div>
);