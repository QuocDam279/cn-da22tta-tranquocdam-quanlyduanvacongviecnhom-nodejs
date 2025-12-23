import React, { useState } from "react";
import { ArrowLeft, User, Plus, X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { findUserByEmail } from "../../services/authService";
import { useCreateTeam, useAddMembers } from "../../hooks/useTeams";

export default function AddTeamForm({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");

  const createTeamMutation = useCreateTeam();
  const addMembersMutation = useAddMembers();

  const loading = createTeamMutation.isPending || addMembersMutation.isPending;

  const handleAddMember = async () => {
    if (!emailInput.trim()) return;

    try {
      const res = await findUserByEmail(emailInput.trim());
      const user = res.user;

      if (!user) {
        setMemberError("Không tìm thấy người dùng này");
        return;
      }

      const currentUserId = localStorage.getItem("user_id");
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
      
      toast.success(`Thêm ${user.full_name} thành công`, {
        icon: "✅",
        duration: 2000,
      });
    } catch (err) {
      setMemberError(err.message || "Không tìm thấy người dùng này");
      toast.error(err.message || "Không thể thêm thành viên", {
        duration: 2000,
      });
    }
  };

  const removeMember = (uid) => {
    const member = members.find((m) => m._id === uid);
    setMembers((prev) => prev.filter((m) => m._id !== uid));
    toast.success(`Đã xóa ${member?.full_name}`, {
      icon: "🗑️",
      duration: 1500,
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Tên nhóm là bắt buộc");
      toast.error("Vui lòng nhập tên nhóm", {
        duration: 2000,
      });
      return;
    }

    setError("");
    setMemberError("");

    const loadingToast = toast.loading("Đang tạo nhóm...");

    try {
      // 1️⃣ Tạo team
      const response = await createTeamMutation.mutateAsync({
        name,
        description,
      });

      const teamId = response.team._id;

      // 2️⃣ Thêm members (nếu có)
      if (members.length > 0) {
        try {
          await addMembersMutation.mutateAsync({
            teamId,
            userIds: members.map((m) => m._id),
          });
          toast.success(`Đã thêm ${members.length} thành viên`, {
            duration: 2000,
          });
        } catch (memberErr) {
          setMemberError(
            memberErr.message || "Có lỗi khi thêm thành viên vào nhóm"
          );
          toast.error("Lỗi thêm thành viên", {
            duration: 2000,
          });
        }
      }

      // 3️⃣ Thông báo thành công chính
      toast.success(`Tạo nhóm "${name}" thành công`, {
        duration: 3000,
        icon: "🚀",
      });

      // 4️⃣ Callback
      if (onCreated) onCreated(response.team);

      // 5️⃣ Đóng form
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setError(err.message || "Tạo nhóm thất bại");
      toast.error(err.message || "Tạo nhóm thất bại", {
        duration: 2000,
      });
    } finally {
      toast.dismiss(loadingToast);
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

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <label className="font-medium">Tên nhóm *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm"
          className="w-full border rounded-lg px-3 py-2 mt-1 mb-4 outline-none"
        />

        <label className="font-medium">Mô tả</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả nhóm (tùy chọn)"
          className="w-full border rounded-lg px-3 py-2 mt-1 mb-4 outline-none resize-none"
          rows={3}
        />

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

        {members.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Danh sách thành viên ({members.length}):</p>
            {members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between border px-3 py-2 rounded-lg mb-2 bg-blue-50"
              >
                <div>
                  <p className="font-medium text-sm">{m.full_name}</p>
                  <p className="text-xs text-gray-600">{m.email}</p>
                </div>
                <button 
                  onClick={() => removeMember(m._id)}
                  className="text-red-500 hover:bg-red-100 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border hover:bg-gray-100 font-medium"
            disabled={loading}
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 font-medium flex items-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Đang tạo...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Tạo mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}