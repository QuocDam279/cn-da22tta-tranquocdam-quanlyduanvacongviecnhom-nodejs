// TeamActions.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { deleteTeam } from "../../services/teamService";
import EditTeamPopover from "./EditTeamPopover";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

export default function TeamActions({
  teamId,
  teamData,
  currentUserRole,
  onUpdated,
  onDeleted
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");

  if (currentUserRole !== "leader") return null;

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa nhóm này?")) return;

    setLoadingDelete(true);
    setError("");

    try {
      await deleteTeam(teamId);
      onDeleted();
    } catch (err) {
      setError(err.message || "Xóa nhóm thất bại");
    } finally {
      setLoadingDelete(false);
      setMenuOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Nút 3 chấm */}
      <button
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setMenuOpen(!menuOpen)}
        title="Tùy chọn"
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
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-blue-50 text-gray-700 transition-colors duration-200"
          >
            <Edit size={16} className="text-blue-600" />
            <span className="font-medium">Sửa nhóm</span>
          </button>

          <div className="h-px bg-gray-200"></div>

          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 text-red-600 disabled:opacity-50 transition-colors duration-200"
          >
            <Trash2 size={16} />
            <span className="font-medium">
              {loadingDelete ? "Đang xóa..." : "Xóa nhóm"}
            </span>
          </button>
        </div>
      )}

      {/* Popup sửa nhóm - Portal */}
      {showEdit &&
        ReactDOM.createPortal(
          <div
            className="fixed inset-0 bg-black/20 z-[100] flex items-start justify-center pt-20 px-4"
            onClick={() => setShowEdit(false)} // chỉ click nền đen mới đóng
          >
            <EditTeamPopover
              team={teamData}
              onSaved={(updated) => {
                onUpdated(updated);
                setShowEdit(false);
              }}
              onClose={() => setShowEdit(false)}
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
