import React, { useState } from "react";
import { Check, X } from "lucide-react";

export default function EditTaskForm({
  task,
  onSave,
  onCancel,
  isLoading = false,
}) {
  const [editedName, setEditedName] = useState(task.task_name);
  const [editedDesc, setEditedDesc] = useState(task.description || "");
  const [error, setError] = useState(null);

  const handleSave = () => {
    if (!editedName.trim()) {
      setError("Tên công việc không được bỏ trống");
      return;
    }

    setError(null);
    onSave({
      task_name: editedName,
      description: editedDesc,
    });
  };

  return (
    <div className="space-y-3 animate-in fade-in">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tên công việc */}
      <input
        type="text"
        value={editedName}
        onChange={(e) => setEditedName(e.target.value)}
        className="w-full text-lg font-bold border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
        disabled={isLoading}
        autoFocus
        placeholder="Tên công việc"
      />

      {/* Mô tả */}
      <textarea
        value={editedDesc}
        onChange={(e) => setEditedDesc(e.target.value)}
        rows={4}
        className="w-full border-2 border-purple-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm transition-all disabled:opacity-50"
        disabled={isLoading}
        placeholder="Mô tả công việc..."
      />

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Lưu
            </>
          ) : (
            <>
              <Check size={16} />
              Lưu
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
        >
          <X size={16} />
          Hủy
        </button>
      </div>
    </div>
  );
}