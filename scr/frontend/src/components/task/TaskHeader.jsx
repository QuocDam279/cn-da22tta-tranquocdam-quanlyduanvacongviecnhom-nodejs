import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Edit, Trash2, FileText } from "lucide-react";
import { useUpdateTask, useDeleteTask } from "../../hooks/useTasks";
import EditTaskForm from "../task/EditTaskForm";
import ConfirmDialog from "../common/ConfirmDialog";

export default function TaskHeader({ task, onUpdated, onDeleted, currentUserId }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const canDelete =
    currentUserId &&
    (task.created_by?._id?.toString() === currentUserId.toString() ||
      task.created_by?.toString() === currentUserId.toString());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleSaveTask = async (payload) => {
    try {
      const result = await updateTaskMutation.mutateAsync({
        taskId: task._id,
        payload,
      });

      setIsEditing(false);
      onUpdated(result.task || { ...task, ...payload });
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task._id);

      setShowDeleteConfirm(false);

      const projectId = task.project_id;
      setTimeout(() => {
        if (projectId) {
          navigate(`/duan/${projectId}`);
        } else {
          navigate("/duan");
        }
      }, 300);

      onDeleted();
    } catch (err) {
      console.error("Error deleting task:", err);
      throw err;
    }
  };

  return (
    <>
      <div className="bg-white p-5 relative">
        
        {!isEditing && canDelete && (
          <div className="absolute top-4 right-4" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tùy chọn"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-10 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-blue-50 transition-colors text-gray-700 text-sm"
                >
                  <Edit size={14} className="text-blue-600" />
                  <span>Chỉnh sửa</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-red-50 transition-colors text-red-600 text-sm"
                >
                  <Trash2 size={14} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <EditTaskForm
            task={task}
            onSave={handleSaveTask}
            onCancel={() => setIsEditing(false)}
            isLoading={updateTaskMutation.isPending}
          />
        ) : (
          <div className="animate-in fade-in">
            <h1 className="text-xl font-bold text-gray-800 mb-4 pr-8">
              {task.task_name}
            </h1>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="text-gray-500" size={16} />
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Mô tả</h3>
              </div>
              {task.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Chưa có mô tả
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Xóa công việc?"
          message={`Bạn có chắc muốn xóa công việc "${task.task_name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          isDangerous={true}
          isLoading={deleteTaskMutation.isPending}
          onConfirm={handleDeleteTask}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in-95 {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation: fade-in 0.3s ease-out;
        }
        .zoom-in-95 {
          animation: zoom-in-95 0.3s ease-out;
        }
      `}</style>
    </>
  );
}