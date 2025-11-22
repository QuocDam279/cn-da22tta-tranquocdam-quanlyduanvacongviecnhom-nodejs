// src/components/team/AddTeamForm.jsx
import React, { useState } from "react";
import { ArrowLeft, User, Plus, X } from "lucide-react";
import { createTeam, addMembers } from "../../services/teamService";
import { findUserByEmail } from "../../services/authService";

export default function AddTeamForm({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [members, setMembers] = useState([]); // { _id, email, full_name }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");       // Lỗi tổng thể
  const [memberError, setMemberError] = useState(""); // Lỗi thêm thành viên

  // ----------------------
  // Thêm thành viên theo email
  // ----------------------
  const handleAddMember = async () => {
    if (!emailInput.trim()) return;

    try {
      const res = await findUserByEmail(emailInput.trim());
      const user = res.user;

      if (!user) {
        setMemberError("Không tìm thấy người dùng này");
        return;
      }

      // Ngăn thêm chính mình
      const currentUserId = localStorage.getItem("user_id"); // hoặc lấy từ context/auth
      if (user._id === currentUserId) {
        setMemberError("Bạn không thể thêm chính mình");
        return;
      }

      if (members.some((m) => m._id === user._id)) {
        setMemberError("Thành viên đã tồn tại trong danh sách");
        return;
      }

      setMembers((prev) => [...prev, user]);
      setEmailInput("");
      setMemberError("");
    } catch (err) {
      setMemberError(err.message || "Không tìm thấy người dùng này");
    }
  };

  // ----------------------
  // Xóa 1 thành viên
  // ----------------------
  const removeMember = (uid) => {
    setMembers((prev) => prev.filter((m) => m._id !== uid));
  };

  // ----------------------
  // Tạo nhóm + thêm members
  // ----------------------
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Tên nhóm là bắt buộc");
      return;
    }

    setLoading(true);
    setError("");
    setMemberError("");

    try {
      // 1️⃣ Tạo team
      const data = await createTeam({ name, description });
      const teamId = data.team._id;

      // 2️⃣ Thêm tất cả member (nếu có)
      if (members.length > 0) {
        try {
          await addMembers(teamId, members.map((m) => m._id));
        } catch (memberErr) {
          setMemberError(
            memberErr.message || "Có lỗi khi thêm thành viên vào nhóm"
          );
        }
      }

      // 3️⃣ Gọi callback parent
      if (onCreated) onCreated(data.team);

      // 4️⃣ Đóng form
      onClose();
    } catch (err) {
      setError(err.message || "Tạo nhóm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Nhóm</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Các trường bắt buộc được đánh dấu bằng dấu *
        </p>

        {/* Lỗi tổng */}
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        {/* Name */}
        <label className="font-medium">Tên nhóm *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm"
          className="w-full border rounded-lg px-3 py-2 mt-1 mb-4 outline-none"
        />

        {/* Description */}
        <label className="font-medium">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả nhóm (tùy chọn)"
          className="w-full border rounded-lg px-3 py-2 mt-1 mb-4 outline-none resize-none"
          rows={3}
        />

        {/* Add member input */}
        <label className="font-medium">Thêm thành viên</label>
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 mb-2">
          <User size={18} className="text-gray-600" />
          <input
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Nhập email"
            className="flex-1 outline-none"
          />
          <button
            onClick={handleAddMember}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <Plus size={16} />
          </button>
        </div>
        {memberError && <p className="text-red-500 text-sm mb-2">{memberError}</p>}

        {/* Member list */}
        {members.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Danh sách thành viên:</p>
            {members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between border px-3 py-2 rounded-lg mb-2"
              >
                <div>
                  <p className="font-medium">{m.full_name}</p>
                  <p className="text-sm text-gray-600">{m.email}</p>
                </div>
                <button onClick={() => removeMember(m._id)}>
                  <X size={18} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end">
          <div className="grid grid-cols-2 gap-3 w-3/5">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 rounded-lg border hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>

            <button
              onClick={handleSubmit}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo mới"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
