// components/task/TaskItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function TaskItem({ task }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/congviec/${task._id}`);
  };

  const statusColors = {
    "To Do": "bg-gray-200 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Review: "bg-yellow-100 text-yellow-800",
    Done: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <div
      onClick={handleClick}
      className="border rounded-xl shadow-sm p-4 bg-white hover:shadow-md transition mb-3 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{task.task_name}</h2>
        <div className="flex gap-2">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[task.status] || "bg-gray-200 text-gray-800"}`}
          >
            {task.status}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[task.priority] || "bg-gray-200 text-gray-800"}`}
          >
            {task.priority}
          </span>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{task.description}</p>
      )}
    </div>
  );
}
