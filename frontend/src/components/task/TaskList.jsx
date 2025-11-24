import React from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onTaskUpdated }) {
  if (!tasks?.length) return <p>Không có công việc nào.</p>;

  return (
    <div className="grid gap-4">
      {tasks.map((t) => (
        <TaskItem key={t._id} task={t} onTaskUpdated={onTaskUpdated} />
      ))}
    </div>
  );
}
