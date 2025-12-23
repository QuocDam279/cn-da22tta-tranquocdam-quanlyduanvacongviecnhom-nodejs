// ========================================
// TaskForm.jsx - SIMPLE & VALIDATED
// ========================================
import React, { useState } from "react";
import { X, Plus, Calendar, User, Flag, AlignLeft, Info } from "lucide-react";
import { useCreateTask } from "../../hooks/useTasks";
import toast from "react-hot-toast";

export default function TaskForm({
  onClose,
  projectId,
  members = [],
  onTaskCreated,
  projectStartDate, // ✅ Nhận ngày bắt đầu dự án (YYYY-MM-DD)
  projectEndDate,   // ✅ Nhận ngày kết thúc dự án (YYYY-MM-DD)
}) {
  // Lấy ngày hôm nay làm mặc định (nếu nằm trong khoảng dự án)
  const todayStr = new Date().toISOString().slice(0, 10);
  
  // Logic chọn ngày mặc định thông minh
  const defaultStart = (projectStartDate && todayStr < projectStartDate) 
    ? projectStartDate 
    : (projectEndDate && todayStr > projectEndDate) 
      ? projectEndDate 
      : todayStr;

  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const priorities = {
    Low: { label: "Thấp", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    Medium: { label: "Trung bình", color: "bg-amber-100 text-amber-700 border-amber-200" },
    High: { label: "Cao", color: "bg-rose-100 text-rose-700 border-rose-200" },
  };

  const createTaskMutation = useCreateTask();
  const isSubmitting = createTaskMutation.isPending;

  // Format ngày để hiển thị (DD/MM/YYYY)
  const formatDateVN = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const handleCreate = async () => {
    setError("");

    // 1. Validate cơ bản
    if (!taskName.trim()) return setError("Vui lòng nhập tên công việc!");
    if (!assignedTo) return setError("Vui lòng chọn người thực hiện!");
    
    // 2. Validate Logic Ngày tháng
    if (startDate && dueDate && startDate > dueDate) {
      return setError("Ngày kết thúc không thể trước ngày bắt đầu!");
    }

    // Kiểm tra với hạn dự án
    if (projectStartDate && startDate < projectStartDate) {
      return setError(`Ngày bắt đầu không được sớm hơn dự án (${formatDateVN(projectStartDate)})`);
    }
    if (projectEndDate && dueDate > projectEndDate) {
      return setError(`Ngày kết thúc không được trễ hơn dự án (${formatDateVN(projectEndDate)})`);
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

      toast.success("Đã tạo công việc mới!");
      onTaskCreated?.();
      onClose();
    } catch (err) {
      setError(err?.message || "Tạo công việc thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* HEADER - Đơn giản & Sạch */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Tạo công việc mới</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <Info size={16} /> {error}
            </div>
          )}

          {/* Tên công việc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc <span className="text-red-500">*</span></label>
            <input
              autoFocus
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Ví dụ: Thiết kế trang chủ..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>

          {/* KHU VỰC NGÀY THÁNG - Có thông báo hạn dự án */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-blue-700 mb-3 font-medium">
              <Info size={14} />
              <span>Thời gian dự án: {formatDateVN(projectStartDate)} - {formatDateVN(projectEndDate)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bắt đầu</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    min={projectStartDate} // 🔒 Chặn lịch HTML
                    max={projectEndDate}   // 🔒 Chặn lịch HTML
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hạn chót</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="date"
                    value={dueDate}
                    min={startDate || projectStartDate} // 🔒 Không được nhỏ hơn ngày bắt đầu
                    max={projectEndDate}                // 🔒 Không được lớn hơn ngày kết thúc dự án
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grid: Độ ưu tiên & Giao cho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ ưu tiên</label>
              <div className="flex gap-2">
                {Object.entries(priorities).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      priority === key ? color : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giao cho <span className="text-red-500">*</span></label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="">-- Chọn thành viên --</option>
                {members.map((m) => (
                  <option key={m.user?._id} value={m.user?._id}>
                    {m.user?.full_name} ({m.user?.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <div className="relative">
              <AlignLeft size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Nhập mô tả..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
              />
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isSubmitting ? "Đang tạo..." : "Tạo công việc"}
          </button>
        </div>

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}