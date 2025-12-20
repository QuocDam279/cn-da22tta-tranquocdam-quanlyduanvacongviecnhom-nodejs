// ========================================
// 1. TaskHeader.jsx - IMPROVED
// ========================================
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit, Trash2, Check, X, FileText } from "lucide-react";
import { useUpdateTask, useDeleteTask } from "../../hooks/useTasks";

export default function TaskHeader({ task, onUpdated, onDeleted, currentUserId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.task_name);
  const [editedDesc, setEditedDesc] = useState(task.description || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const canDelete =
    currentUserId &&
    (task.created_by?._id?.toString() === currentUserId.toString() ||
      task.created_by?.toString() === currentUserId.toString());

  const isDeleting = deleteTaskMutation.isPending;

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

  const handleSave = async () => {
    setError(null);
    try {
      await updateTaskMutation.mutateAsync({
        taskId: task._id,
        payload: { task_name: editedName, description: editedDesc },
      });
      setIsEditing(false);
      onUpdated({ ...task, task_name: editedName, description: editedDesc });
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setError(err.message || "Không thể cập nhật công việc");
    }
  };

  const handleCancel = () => {
    setEditedName(task.task_name);
    setEditedDesc(task.description || "");
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    setError(null);
    try {
      await deleteTaskMutation.mutateAsync(task._id);
      onDeleted();
    } catch (err) {
      console.error("Lỗi xóa task:", err);
      setError(err.message || "Không thể xóa công việc");
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 relative animate-fade-in">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold">⚠</span>
            </div>
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Menu 3 chấm */}
        {!isEditing && canDelete && (
          <div className="absolute top-6 right-6" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tùy chọn"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-10 animate-scale-in">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors text-gray-700 font-medium"
                >
                  <Edit size={16} className="text-blue-600" />
                  <span>Chỉnh sửa</span>
                </button>

                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors text-red-600 font-medium"
                >
                  <Trash2 size={16} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {isEditing ? (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText size={16} className="text-blue-500" />
                Tên công việc
              </label>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full text-xl font-bold border-2 border-blue-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText size={16} className="text-purple-500" />
                Mô tả
              </label>
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                rows={6}
                className="w-full border-2 border-purple-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                placeholder="Thêm mô tả chi tiết..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={updateTaskMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {updateTaskMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={updateTaskMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
              >
                <X size={18} />
                Hủy
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-800">
                {task.task_name}
              </h1>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-gray-600" size={18} />
                <h3 className="text-sm font-semibold text-gray-700">Mô tả công việc</h3>
              </div>
              {task.description ? (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Chưa có mô tả cho công việc này
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Trash2 className="text-white" size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Xóa công việc?</h3>
                <p className="text-sm text-gray-500 mt-1">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-red-50/30 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-800 font-semibold">{task.task_name}</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Xóa công việc
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-shake { animation: shake 0.3s ease-out; }
      `}</style>
    </>
  );
}