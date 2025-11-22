// components/task/TaskForm.jsx
import React, { useState } from "react";
import { createTask, updateTask } from "../../services/taskService";
import { Users } from "lucide-react";

export default function TaskForm({ task, onClose, projectId, members = [] }) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [taskName, setTaskName] = useState(task?.task_name || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to?._id || "");
  const [startDate, setStartDate] = useState(task?.start_date?.slice(0, 10) || todayStr);
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskName.trim()) return alert("Vui lòng nhập tên công việc!");
    if (!assignedTo) return alert("Vui lòng chọn người được giao!");
    if (startDate && dueDate && startDate > dueDate)
      return alert("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!");

    const payload = {
      task_name: taskName,
      description,
      priority,
      assigned_to: assignedTo,
      project_id: projectId,
      start_date: startDate || null,
      due_date: dueDate || null,
    };

    try {
      if (task) {
        await updateTask(task._id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lưu công việc thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-96 flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold">{task ? "Sửa công việc" : "Tạo công việc"}</h2>

        {/* Tên công việc */}
        <input
          type="text"
          placeholder="Tên công việc"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />

        {/* Mô tả */}
        <textarea
          placeholder="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
        />

        {/* Ngày bắt đầu & ngày kết thúc */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
            <input
              type="date"
              value={dueDate}
              min={startDate || todayStr}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        {/* Ưu tiên */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="Low">Thấp</option>
          <option value="Medium">Trung bình</option>
          <option value="High">Cao</option>
        </select>

        {/* Chọn thành viên */}
        <div className="space-y-2 border rounded-lg p-2 max-h-48 overflow-auto">
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có thành viên nào</p>
          ) : (
            members.map((m) => {
              const user = m.user;
              if (!user) return null;
              const selected = assignedTo === user._id;
              return (
                <div
                  key={user._id}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer 
                    ${selected ? "bg-blue-200 border border-blue-400" : "hover:bg-gray-100"}`}
                  onClick={() => setAssignedTo(user._id)}
                >
                  <Users className="text-purple-500" />
                  <div>
                    <p className="font-medium">{user.full_name || "Unknown"}</p>
                    <p className="text-gray-600 text-sm">{user.email || "-"}</p>
                  </div>
                </div>
              );
            })
          )}
          {!assignedTo && members.length > 0 && (
            <p className="text-gray-400 text-sm italic">Chọn người được giao</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
