// components/task/TaskItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function TaskItem({ task }) {
  const navigate = useNavigate();

  const handleClick = () => navigate(`/congviec/${task._id}`);

  const statusStyle = {
    "To Do": "bg-gray-100 text-gray-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Review: "bg-yellow-100 text-yellow-700",
    Done: "bg-green-100 text-green-700",
  };

  const priorityStyle = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl border shadow-sm bg-white p-5 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{task.task_name}</h2>

        <div className="flex gap-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusStyle[task.status]}`}
          >
            {task.status}
          </span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full font-medium ${priorityStyle[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all"
          style={{ width: `${task.progress}%` }}
        ></div>
      </div>
    </div>
  );
}
