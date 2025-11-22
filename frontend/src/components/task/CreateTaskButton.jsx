// components/task/CreateTaskButton.jsx
import React, { useState } from "react";
import TaskForm from "./TaskForm";

export default function CreateTaskButton({ projectId, onCreated, members = [] }) {
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        + Tạo công việc
      </button>

      {showForm && (
        <TaskForm
          projectId={projectId}
          members={members}
          onClose={() => {
            handleClose();
            onCreated?.();
          }}
        />
      )}
    </>
  );
}
