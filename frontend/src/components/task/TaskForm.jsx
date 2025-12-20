// ========================================
// 1. TaskForm.jsx - IMPROVED
// ========================================
import React, { useState } from "react";
import { X, Plus, Calendar, User, Flag, FileText } from "lucide-react";
import { useCreateTask } from "../../hooks/useTasks";

export default function TaskForm({
  onClose,
  projectId,
  members = [],
  onTaskCreated,
}) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const priorities = {
    Low: { label: "Thấp", color: "bg-emerald-500", hoverColor: "hover:bg-emerald-600" },
    Medium: { label: "Trung bình", color: "bg-amber-500", hoverColor: "hover:bg-amber-600" },
    High: { label: "Cao", color: "bg-rose-500", hoverColor: "hover:bg-rose-600" },
  };

  const createTaskMutation = useCreateTask();
  const isSubmitting = createTaskMutation.isPending;

  const handleCreate = async () => {
    setError("");

    if (!taskName.trim()) {
      return setError("Vui lòng nhập tên công việc!");
    }
    if (!assignedTo) {
      return setError("Vui lòng chọn người được giao!");
    }
    if (startDate && dueDate && startDate > dueDate) {
      return setError("Ngày kết thúc phải sau ngày bắt đầu!");
    }

    try {
      await createTaskMutation.mutateAsync({
        task_name: taskName,
        description,
        priority,
        assigned_to: assignedTo,
        project_id: projectId,
        start_date: startDate || null,
        due_date: dueDate || null,
      });

      onTaskCreated?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Tạo công việc thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* HEADER với gradient */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Plus className="text-white" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tạo công việc mới</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={22} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-shake">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Tên công việc */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FileText size={16} className="text-blue-500" />
              Tên công việc *
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Nhập tên công việc..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
              <FileText size={16} className="text-purple-500" />
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Thêm mô tả chi tiết..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
            />
          </div>

          {/* Ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="text-blue-500" />
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <Calendar size={16} className="text-purple-500" />
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={dueDate}
                min={startDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700">
              <Flag size={16} className="text-rose-500" />
              Độ ưu tiên
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(priorities).map(([key, { label, color, hoverColor }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all transform ${
                    priority === key
                      ? `${color} text-white border-transparent shadow-lg scale-105`
                      : `bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Thành viên */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700">
              <User size={16} className="text-indigo-500" />
              Giao cho *
            </label>
            <div className="border-2 border-gray-200 rounded-xl p-3 max-h-56 overflow-y-auto space-y-2">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Chưa có thành viên</p>
                </div>
              ) : (
                members.map((m) => {
                  const user = m.user;
                  if (!user) return null;

                  const selected = assignedTo === user._id;

                  return (
                    <div
                      key={user._id}
                      onClick={() => setAssignedTo(user._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        selected
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 shadow-md"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                          selected ? "bg-gradient-to-br from-blue-500 to-purple-500" : "bg-gray-400"
                        }`}
                      >
                        {user.full_name?.[0]?.toUpperCase() || "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {user.full_name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {selected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M5 13l4 4L19 7"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all"
          >
            Hủy
          </button>

          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Plus size={20} />
                Tạo công việc
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-out; }
      `}</style>
    </div>
  );
}