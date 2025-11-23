// src/components/task/TaskMeta.jsx
import React from "react";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskPriorityBadge from "./TaskPriorityBadge";

export default function TaskMeta({ task }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm border space-y-4">

      {/* Status + Priority */}
      <div className="flex items-center gap-3">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
      </div>

      {/* Creator & Assignee */}
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium">Người tạo:</span>{" "}
          {task.created_by?.full_name || "-"}
        </p>
        <p>
          <span className="font-medium">Giao cho:</span>{" "}
          {task.assigned_to?.full_name || "-"}
        </p>
      </div>

      {/* Dates */}
      <div className="space-y-1 text-sm">
        {task.start_date && (
          <p>
            <span className="font-medium">Ngày bắt đầu:</span>{" "}
            {new Date(task.start_date).toLocaleDateString()}
          </p>
        )}

        {task.due_date && (
          <p>
            <span className="font-medium">Ngày kết thúc:</span>{" "}
            {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
