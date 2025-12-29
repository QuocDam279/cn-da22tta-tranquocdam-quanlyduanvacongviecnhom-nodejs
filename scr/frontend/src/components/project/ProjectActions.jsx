import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useUpdateProject, useDeleteProject } from "../../hooks/useProjects";
import ConfirmDialog from "../common/ConfirmDialog";

export default function ProjectActions({ project, onUpdated }) {
  const navigate = useNavigate();
  
  // ✅ Lấy user ID từ localStorage hoặc sessionStorage
  const userId = 
    localStorage.getItem("user_id") || 
    sessionStorage.getItem("user_id") ||
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId");

  // ✅ Kiểm tra quyền: creator hoặc team leader
  const isCreator = 
    project?.created_by?._id === userId || 
    project?.created_by === userId;
  
  const isTeamLeader = 
    project?.team?.leader?._id === userId || 
    project?.team?.leader === userId;
  
  const hasPermission = isCreator || isTeamLeader;

  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    project_name: project?.project_name || "",
    description: project?.description || "",
    start_date: project?.start_date?.slice(0, 10) || "",
    end_date: project?.end_date?.slice(0, 10) || "",
  });

  const containerRef = useRef(null);
  const popupRef = useRef(null);

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const loading = updateProjectMutation.isPending || deleteProjectMutation.isPending;

  useEffect(() => {
    if (!menuOpen && !showPopup) return;

    const handleClick = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) {
        return;
      }
      if (popupRef.current && popupRef.current.contains(e.target)) {
        return;
      }

      setMenuOpen(false);
      setShowPopup(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [menuOpen, showPopup]);

  const handleDelete = async () => {
    setError("");
    const loadingToast = toast.loading("Đang xóa dự án...");

    try {
      await deleteProjectMutation.mutateAsync(project._id);

      toast.dismiss(loadingToast);
      toast.success(`Đã xóa dự án "${project.project_name}" thành công! 🗑️`, {
        duration: 3000,
      });

      setMenuOpen(false);
      setShowConfirm(false);

      // ✅ Chuyển về trang nhóm (nơi dự án tạo ra)
      setTimeout(() => {
        const teamId = project.team?._id;
        if (teamId) {
          navigate(`/nhom/${teamId}`);
        } else {
          navigate("/nhom");
        }
      }, 500);
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.message || "Xóa dự án thất bại";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 2000 });
    }
  };

  const handleUpdate = async () => {
    if (!form.project_name.trim()) {
      setError("Tên dự án không được bỏ trống");
      toast.error("Vui lòng nhập tên dự án", { duration: 2000 });
      return;
    }

    setError("");
    const loadingToast = toast.loading("Đang cập nhật dự án...");

    try {
      const result = await updateProjectMutation.mutateAsync({
        projectId: project._id,
        payload: form,
      });

      toast.dismiss(loadingToast);
      toast.success("Cập nhật dự án thành công! ✨", {
        duration: 3000,
        icon: "🎯",
      });

      if (onUpdated) onUpdated(result.project || result);
      setShowPopup(false);
      setError("");
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.message || "Cập nhật dự án thất bại";
      setError(errorMsg);
      toast.error(errorMsg, { duration: 2000 });
    }
  };

  if (!hasPermission || !userId) {
    return null;
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Nút 3 chấm */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        disabled={loading}
        title="Tùy chọn"
      >
        <MoreVertical size={20} className="text-gray-600" />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-[50] overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(true);
              setMenuOpen(false);
            }}
            disabled={loading}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-gray-700 disabled:opacity-50 transition-colors"
          >
            <Edit size={16} className="text-blue-600" />
            <span className="font-medium">Sửa dự án</span>
          </button>

          <div className="h-px bg-gray-200"></div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
              setMenuOpen(false);
            }}
            disabled={loading}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            <span className="font-medium">Xóa dự án</span>
          </button>
        </div>
      )}

      {/* Popup Sửa */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 z-[9999] animate-in fade-in zoom-in-95"
        >
          <h3 className="font-bold text-lg text-gray-800 mb-4">Chỉnh sửa dự án</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                value={form.project_name}
                onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                disabled={loading}
                placeholder="Nhập tên dự án"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading}
                placeholder="Nhập mô tả dự án"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setError("");
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                Hủy
              </button>

              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog - Xóa dự án */}
      {showConfirm && (
        <ConfirmDialog
          title="Xóa dự án"
          message={`Bạn có chắc muốn xóa dự án "${project.project_name}"? Hành động này không thể hoàn tác và tất cả công việc liên quan đến dự án sẽ bị xóa.`}
          confirmText="Xóa"
          cancelText="Hủy"
          isDangerous={true}
          isLoading={deleteProjectMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}