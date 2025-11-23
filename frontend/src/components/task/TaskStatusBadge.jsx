// src/components/task/TaskStatusBadge.jsx
import React from "react";

const colors = {
  "To Do": "bg-gray-200 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Review: "bg-yellow-100 text-yellow-700",
  Done: "bg-green-100 text-green-700",
};

export default function TaskStatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}
