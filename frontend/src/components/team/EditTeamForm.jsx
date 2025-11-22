// src/components/team/EditTeamForm.jsx
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { updateTeam } from "../../services/teamService";

export default function EditTeamForm({ team, onClose, onSaved }) {
  const [name, setName] = useState(team.team_name || "");
  const [description, setDescription] = useState(team.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Tên nhóm không được để trống");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const updated = await updateTeam(team._id, { team_name: name, description });
      onSaved(updated.team);
    } catch (err) {
      setError(err.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-full max-w-md rounded shadow">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Sửa nhóm</h2>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <label className="font-medium">Tên nhóm *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 outline-none"
        />
        <label className="font-medium">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 outline-none resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
