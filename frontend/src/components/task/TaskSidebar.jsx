// src/components/task/TaskSidebar.jsx
import React from "react";
import TaskProgressBar from "./TaskProgressBar";
import { updateTask } from "../../services/taskService";

export default function TaskSidebar({ task, onUpdated }) {
  const updateField = async (field, value) => {
    const updatedData = { [field]: value };

    // Đồng bộ status <-> progress
    if (field === "status") {
      if (value === "Done") updatedData.progress = 100;
      else if (value === "To Do") updatedData.progress = 0;
      else if (task.progress === 100) updatedData.progress = 99; 
    } else if (field === "progress") {
      const num = Number(value);
      if (num === 100) updatedData.status = "Done";
      else if (num === 0) updatedData.status = "To Do";
      else if (task.status === "Done" || task.status === "To Do") updatedData.status = "In Progress";
    }

    try {
      const res = await updateTask(task._id, updatedData);
      const updatedTask = res.task;
      onUpdated(updatedTask);
    } catch (err) {
      console.error("Lỗi cập nhật task:", err);
    }
  };

  return (
    <div className="w-80 bg-white rounded-2xl shadow p-6 space-y-6">
      {/* Status & Priority */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Trạng thái</label>
          <select
            value={task.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Review</option>
            <option>Done</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Độ ưu tiên</label>
          <select
            value={task.priority}
            onChange={(e) => updateField("priority", e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      {/* Progress */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">Tiến độ</label>
        <TaskProgressBar
          progress={task.progress}
          onChange={(val) => updateField("progress", val)}
        />
      </div>

      {/* Dates */}
      <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Ngày bắt đầu</span>
          <span>{task.start_date ? new Date(task.start_date).toLocaleDateString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Hạn hoàn thành</span>
          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Ngày tạo</span>
          <span>{task.created_at ? new Date(task.created_at).toLocaleString() : "-"}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Cập nhật</span>
          <span>{task.updated_at ? new Date(task.updated_at).toLocaleString() : "-"}</span>
        </div>
      </div>

      {/* Users */}
      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-400 rounded-full text-white flex items-center justify-center font-semibold">
              {task.created_by?.full_name?.[0] || "C"}
            </span>
            <div>
              <p className="font-semibold text-blue-700">Người tạo</p>
              <p className="text-blue-600 text-sm">{task.created_by?.full_name || task.created_by || "-"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-green-400 rounded-full text-white flex items-center justify-center font-semibold">
              {task.assigned_to?.full_name?.[0] || "A"}
            </span>
            <div>
              <p className="font-semibold text-green-700">Người được giao</p>
              <p className="text-green-600 text-sm">{task.assigned_to?.full_name || task.assigned_to || "-"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
