import React from "react";
import TaskProgressBar from "./TaskProgressBar";
import TaskMeta from "./TaskMeta";
import { updateTask } from "../../services/taskService";

export default function TaskInfo({ task }) {
  const handleProgressUpdate = async (value) => {
    try {
      await updateTask(task._id, { progress: value });
    } catch (err) {
      console.error("Lỗi cập nhật tiến độ:", err.message);
    }
  };

  return (
    <div className="space-y-6">
        <TaskProgressBar
        progress={task.progress}
        onChange={(newValue) => updateTask(task._id, { progress: newValue })}
        />

      <TaskMeta task={task} />
    </div>
  );
}
