// src/components/task/TaskSidebar.jsx
import React, { useState } from "react";
import { Calendar, Lock, User, UserCheck, AlertCircle, Activity } from "lucide-react";
import TaskProgressBar from "./TaskProgressBar";
import { useUpdateTask } from "../../hooks/useTasks";

export default function TaskSidebar({ task, onUpdated, currentUser }) {
  const [editingDate, setEditingDate] = useState(null);
  const [error, setError] = useState(null);

  const updateTaskMutation = useUpdateTask();

  const getAvatarUrl = (user) => {
    if (!user) return null;
    
    if (user.avatar) {
      return `${import.meta.env.VITE_API_URL}${user.avatar}`;
    }
    
    const name = user.full_name || user.email || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
  };

  const canEdit = () => {
    if (!currentUser) return false;
    if (currentUser.role === "Leader") return true;
    if (task.assigned_to?._id === currentUser._id || task.assigned_to === currentUser._id) {
      return true;
    }
    return false;
  };

  const hasEditPermission = canEdit();

  const statusMap = {
    "Chưa thực hiện": "To Do",
    "Đang thực hiện": "In Progress",
    "Đã hoàn thành": "Done",
  };

  const priorityMap = {
    Thấp: "Low",
    "Trung bình": "Medium",
    Cao: "High",
  };

  const updateField = async (field, value) => {
    if (!hasEditPermission) {
      setError("Bạn không có quyền chỉnh sửa task này!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const updatedData = {};

    if (field === "status") {
      updatedData.status = statusMap[value];
      if (value === "Đã hoàn thành") updatedData.progress = 100;
      else if (value === "Chưa thực hiện") updatedData.progress = 0;
      else if (task.progress === 100) updatedData.progress = 99;
    } else if (field === "progress") {
      const num = Number(value);
      updatedData.progress = num;
      if (num === 100) updatedData.status = "Done";
      else if (num === 0) updatedData.status = "To Do";
      else if (task.status === "Done" || task.status === "To Do") updatedData.status = "In Progress";
    } else if (field === "priority") {
      updatedData.priority = priorityMap[value];
    } else if (field === "start_date" || field === "due_date") {
      updatedData[field] = value;
    }

    try {
      const res = await updateTaskMutation.mutateAsync({ taskId: task._id, payload: updatedData });
      onUpdated(res.task);
      setEditingDate(null);
      setError(null);
    } catch (err) {
      console.error("Lỗi cập nhật task:", err);
      setError(err.message || "Không thể cập nhật task. Vui lòng thử lại!");
      setTimeout(() => setError(null), 3000);
    }
  };

  const statusValue = Object.keys(statusMap).find((k) => statusMap[k] === task.status) || "Chưa thực hiện";
  const priorityValue = Object.keys(priorityMap).find((k) => priorityMap[k] === task.priority) || "Trung bình";

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Thấp": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Trung bình": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Cao": return "text-rose-600 bg-rose-50 border-rose-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Chưa thực hiện": return "text-gray-600 bg-gray-50 border-gray-200";
      case "Đang thực hiện": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Đã hoàn thành": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in sticky top-24">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="text-white" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Thông tin công việc</h3>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-800 text-sm font-medium flex-1">{error}</p>
          </div>
        )}

        {/* Permission Notice */}
        {!hasEditPermission && (
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="text-yellow-700" size={16} />
            </div>
            <span className="text-sm text-yellow-800 font-medium">
              Chỉ có quyền xem
            </span>
          </div>
        )}

        {/* Status & Priority Section */}
        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={statusValue}
                onChange={(e) => updateField("status", e.target.value)}
                disabled={!hasEditPermission || updateTaskMutation.isPending}
                className={`w-full border-2 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm appearance-none ${
                  getStatusColor(statusValue)
                } ${!hasEditPermission ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-md"}`}
              >
                <option>Chưa thực hiện</option>
                <option>Đang thực hiện</option>
                <option>Đã hoàn thành</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Độ ưu tiên
            </label>
            <div className="relative">
              <select
                value={priorityValue}
                onChange={(e) => updateField("priority", e.target.value)}
                disabled={!hasEditPermission || updateTaskMutation.isPending}
                className={`w-full border-2 rounded-xl p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-sm appearance-none ${
                  getPriorityColor(priorityValue)
                } ${!hasEditPermission ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:shadow-md"}`}
              >
                <option>Thấp</option>
                <option>Trung bình</option>
                <option>Cao</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
          <TaskProgressBar
            progress={task.progress}
            onChange={(val) => updateField("progress", val)}
            disabled={!hasEditPermission || updateTaskMutation.isPending}
          />
        </div>

        {/* Dates Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-gray-700">Thời gian</h4>
          </div>

          {/* Start Date */}
          <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3 transition-all ${
            hasEditPermission ? "hover:shadow-md cursor-pointer" : ""
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">Ngày bắt đầu</span>
              </div>
              {editingDate === "start_date" && hasEditPermission ? (
                <input
                  type="date"
                  value={formatDateForInput(task.start_date)}
                  onChange={(e) => updateField("start_date", e.target.value)}
                  onBlur={() => setEditingDate(null)}
                  autoFocus
                  className="border-2 border-blue-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div
                  onClick={() => hasEditPermission && setEditingDate("start_date")}
                  className={`text-sm font-medium ${hasEditPermission ? "text-blue-600 hover:text-blue-700" : "text-gray-600"}`}
                >
                  {formatDateTime(task.start_date)}
                </div>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div className={`bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-3 transition-all ${
            hasEditPermission ? "hover:shadow-md cursor-pointer" : ""
          }`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">Hạn hoàn thành</span>
              </div>
              {editingDate === "due_date" && hasEditPermission ? (
                <input
                  type="date"
                  value={formatDateForInput(task.due_date)}
                  onChange={(e) => updateField("due_date", e.target.value)}
                  onBlur={() => setEditingDate(null)}
                  autoFocus
                  className="border-2 border-purple-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div
                  onClick={() => hasEditPermission && setEditingDate("due_date")}
                  className={`text-sm font-medium ${hasEditPermission ? "text-purple-600 hover:text-purple-700" : "text-gray-600"}`}
                >
                  {formatDateTime(task.due_date)}
                </div>
              )}
            </div>
          </div>

          {/* Created At */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Ngày tạo</span>
              <span className="text-sm text-gray-600">
                {formatDateTime(task.created_at)}
              </span>
            </div>
          </div>

          {/* Updated At */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Cập nhật</span>
              <span className="text-sm text-gray-600">
                {formatDateTime(task.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* People Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h4 className="text-sm font-bold text-gray-700">Người liên quan</h4>
          </div>

          {/* Creator */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={getAvatarUrl(task.created_by)}
                  alt={task.created_by?.full_name || "Creator"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(task.created_by?.full_name || "C")}&background=3b82f6&color=fff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <User className="text-white" size={12} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-600 mb-1">Người tạo</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {task.created_by?.full_name || task.created_by || "-"}
                </p>
                {task.created_by?.email && (
                  <p className="text-xs text-gray-500 truncate">{task.created_by.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Assignee */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={getAvatarUrl(task.assigned_to)}
                  alt={task.assigned_to?.full_name || "Assignee"}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(task.assigned_to?.full_name || "A")}&background=10b981&color=fff`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                  <UserCheck className="text-white" size={12} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Người được giao</p>
                <p className="text-sm font-bold text-gray-800 truncate">
                  {task.assigned_to?.full_name || task.assigned_to || "-"}
                </p>
                {task.assigned_to?.email && (
                  <p className="text-xs text-gray-500 truncate">{task.assigned_to.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-out; }
      `}</style>
    </div>
  );
}