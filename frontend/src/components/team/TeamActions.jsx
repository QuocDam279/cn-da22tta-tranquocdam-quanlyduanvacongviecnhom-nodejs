import React, { useState } from "react";
import { deleteTeam } from "../../services/teamService";
import EditTeamForm from "./EditTeamForm";

export default function TeamActions({ teamId, teamData, currentUserRole, onUpdated, onDeleted }) {
    // Debug
  console.log('TeamActions - currentUserRole:', currentUserRole);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");

  if (currentUserRole !== "leader") return null; // member không thấy nút sửa/xóa nhóm

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
    }
  };

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setShowEdit(true)}
      >
        Sửa nhóm
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={handleDelete}
        disabled={loadingDelete}
      >
        {loadingDelete ? "Đang xóa..." : "Xóa nhóm"}
      </button>
      {error && <p className="text-red-500 ml-3">{error}</p>}

      {showEdit && (
        <EditTeamForm
          team={teamData}
          onClose={() => setShowEdit(false)}
          onSaved={(updatedTeam) => {
            onUpdated(updatedTeam);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}
