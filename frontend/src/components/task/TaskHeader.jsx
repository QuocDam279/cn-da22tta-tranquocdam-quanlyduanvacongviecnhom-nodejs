// src/components/task/TaskHeader.jsx
import React from "react";

export default function TaskHeader({ task }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h1 className="text-3xl font-bold mb-3">{task.task_name}</h1>

      {task.description && (
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {task.description}
        </p>
      )}
    </div>
  );
}
