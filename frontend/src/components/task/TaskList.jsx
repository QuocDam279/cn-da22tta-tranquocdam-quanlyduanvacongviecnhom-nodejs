import React from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onEdit, refresh }) {
  if (!tasks || tasks.length === 0) {
    return <p>Chưa có công việc nào.</p>;
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onEdit={() => onEdit(task)}
          refresh={refresh}
        />
      ))}
    </div>
  );
}
