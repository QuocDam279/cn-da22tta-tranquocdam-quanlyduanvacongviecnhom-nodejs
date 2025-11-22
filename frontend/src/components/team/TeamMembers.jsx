import React, { useState } from "react";
import { Plus, X, User } from "lucide-react";
import { addMembers, removeMember, leaveTeam } from "../../services/teamService";
import { findUserByEmail } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function TeamMembers({
  teamId,
  members,
  currentUserId,
  currentUserRole,
  onMembersUpdated
}) {
    // Debug
  console.log('TeamMembers - currentUserRole:', currentUserRole);
  console.log('TeamMembers - currentUserId:', currentUserId);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAddMember = async () => {
    if (!emailInput.trim()) return;
    setError("");

    try {
      const res = await findUserByEmail(emailInput.trim());
      const user = res.user;
      if (!user) return setError("Không tìm thấy người dùng");
      if (user._id === currentUserId) return setError("Bạn không thể thêm chính mình");
      if (members.some((m) => m.user?._id === user._id)) return setError("Thành viên đã có trong nhóm");

      setLoading(true);
      await addMembers(teamId, [user._id]);

      onMembersUpdated([
        ...members,
        { _id: user._id, user: { _id: user._id, full_name: user.full_name, email: user.email } }
      ]);

      setEmailInput("");
    } catch (err) {
      setError(err.message || "Thêm thành viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    setLoading(true);
    setError("");

    try {
      await removeMember(teamId, userId);
      onMembersUpdated(members.filter((m) => m.user?._id !== userId));
    } catch (err) {
      setError(err.message || "Xóa thành viên thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Bạn có chắc muốn rời nhóm?")) return;
    setLoading(true);
    setError("");

    try {
      await leaveTeam(teamId);
      onMembersUpdated(members.filter((m) => m.user?._id !== currentUserId));

      // Sau khi rời nhóm, chuyển hướng ra ngoài
      navigate("/nhom"); 
    } catch (err) {
      setError(err.message || "Rời nhóm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Input thêm thành viên - luôn hiển thị */}
      <div className="flex items-center gap-2 mb-4 border px-3 py-2 rounded-lg">
        <User size={18} className="text-gray-600" />
        <input
          type="text"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Nhập email thành viên"
          className="flex-1 outline-none"
        />
        <button
          onClick={handleAddMember}
          disabled={loading}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <Plus size={16} />
        </button>
      </div>

      {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

      {/* Danh sách thành viên */}
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m._id} className="flex justify-between items-center border px-3 py-2 rounded">
            <div>
              <p className="font-medium">{m.user?.full_name}</p>
              <p className="text-sm text-gray-600">{m.user?.email}</p>
            </div>

            {/* Quyền hiển thị nút */}
            {m.user?._id === currentUserId ? (
              // Nút rời nhóm - chỉ hiển thị nếu không phải leader
              currentUserRole !== "leader" && (
              <button
                onClick={handleLeaveTeam}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all duration-200 text-sm font-medium"
              >
                Rời nhóm
              </button>
              )
            ) : (
              // Nút xóa thành viên cho leader
              currentUserRole === "leader" && (
                <button onClick={() => handleRemoveMember(m.user._id)}>
                  <X size={18} className="text-red-500" />
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
