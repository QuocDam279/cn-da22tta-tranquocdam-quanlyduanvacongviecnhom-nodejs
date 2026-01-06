import React, { useState } from "react";
import ReactDOM from "react-dom";
import toast from "react-hot-toast";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import EditTeamPopover from "./EditTeamPopover";
import ConfirmDialog from "../common/ConfirmDialog";
import { useDeleteTeam, useUpdateTeam } from "../../hooks/useTeams";

export default function TeamActions({
  teamId,
  teamData,
  currentUserRole,
  onUpdated,
  onDeleted,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Sử dụng hooks thay vì gọi service trực tiếp
  const deleteTeamMutation = useDeleteTeam();
  const updateTeamMutation = useUpdateTeam();

  if (currentUserRole !== "leader") return null;

  const handleDeleteConfirm = async () => {
    setError("");
    const loadingToast = toast.loading("Đang xóa nhóm...");

    try {
      await deleteTeamMutation.mutateAsync(teamId);

      // ✅ Thông báo thành công
      toast.success(`Đã xóa nhóm thành công`, {
        icon: "🗑️",
        duration: 3000,
      });

      setMenuOpen(false);
      setShowConfirm(false);

      // ⏳ Gọi callback sau 500ms để form kịp close
      setTimeout(() => {
        if (onDeleted) onDeleted();
      }, 500);
    } catch (err) {
      const errorMsg = err.message || "Xóa nhóm thất bại";
      setError(errorMsg);

      toast.error(errorMsg, {
        duration: 3000,
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleEditSave = async (updatedData) => {
    setError("");
    const loadingToast = toast.loading("Đang cập nhật nhóm...");

    try {
      const result = await updateTeamMutation.mutateAsync({
        teamId,
        payload: updatedData,
      });

      // ✅ Thông báo thành công
      toast.success("Cập nhật nhóm thành công ✨", {
        duration: 3000,
      });

      if (onUpdated) onUpdated(result.team || result);
      setShowEdit(false);
    } catch (err) {
      const errorMsg = err.message || "Cập nhật nhóm thất bại";
      setError(errorMsg);

      toast.error(errorMsg, {
        duration: 3000,
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const isLoading =
    deleteTeamMutation.isPending || updateTeamMutation.isPending;

  return (
    <div className="relative inline-block">
      {/* Nút 3 chấm */}
      <button
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
        onClick={() => setMenuOpen(!menuOpen)}
        title="Tùy chọn"
        disabled={isLoading}
      >
        <MoreVertical size={20} className="text-gray-600" />
      </button>

      {/* Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <button
            onClick={() => {
              setShowEdit(true);
              setMenuOpen(false);
            }}
            disabled={isLoading}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-gray-700 disabled:opacity-50 transition-colors duration-200"
          >
            <Edit size={16} className="text-blue-600" />
            <span className="font-medium">Sửa nhóm</span>
          </button>

          <div className="h-px bg-gray-200"></div>

          <button
            onClick={() => {
              setShowConfirm(true);
              setMenuOpen(false);
            }}
            disabled={isLoading}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors duration-200"
          >
            <Trash2 size={16} />
            <span className="font-medium">Xóa nhóm</span>
          </button>
        </div>
      )}

      {/* Modal Confirm Dialog */}
      {showConfirm && (
        <ConfirmDialog
          title="Xóa nhóm"
          message={`Bạn có chắc muốn xóa nhóm ? Hành động này không thể hoàn tác và tất cả dự án liên quan đến nhóm sẽ bị xóa.`}
          confirmText="Xóa"
          cancelText="Hủy"
          isDangerous={true}
          isLoading={deleteTeamMutation.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Popup sửa nhóm - Portal */}
      {showEdit &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-start justify-center pt-20 px-4"
            onClick={() => setShowEdit(false)}
          >
            <EditTeamPopover
              team={teamData}
              onSaved={handleEditSave}
              onClose={() => setShowEdit(false)}
              isLoading={isLoading}
            />
          </div>,
          document.body
        )}

      {error && (
        <div className="absolute top-full right-0 mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-sm shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}