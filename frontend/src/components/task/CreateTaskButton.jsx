import React, { useState } from "react";
import { Plus } from "lucide-react";
import TaskForm from "./TaskForm";

// ✅ Cập nhật props nhận vào
export default function CreateTaskButton({ 
  projectId, 
  onCreated, 
  members = [], 
  projectStartDate, // Nhận từ ProjectDetail
  projectEndDate    // Nhận từ ProjectDetail
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 font-semibold group z-40"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform">
          <Plus size={20} />
        </div>
        <span>Tạo công việc</span>
      </button>

      {showForm && (
        <TaskForm
          projectId={projectId}
          members={members}
          onClose={() => setShowForm(false)}
          onTaskCreated={() => {
            onCreated?.();
            setShowForm(false);
          }}
          // ✅ CHUYỂN TIẾP dữ liệu xuống TaskForm
          projectStartDate={projectStartDate}
          projectEndDate={projectEndDate}
        />
      )}
    </>
  );
}