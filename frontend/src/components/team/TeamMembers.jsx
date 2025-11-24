import React, { useState, useMemo } from "react";
import { Plus, X, User, Search } from "lucide-react";
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
  const [emailInput, setEmailInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const removeVietnameseTone = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

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
      navigate("/nhom");
    } catch (err) {
      setError(err.message || "Rời nhóm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!searchValue.trim()) return members;
    const query = removeVietnameseTone(searchValue.trim());
    return members.filter((m) => {
      const name = removeVietnameseTone(m.user?.full_name || "");
      const email = removeVietnameseTone(m.user?.email || "");
      return name.includes(query) || email.includes(query);
    });
  }, [members, searchValue]);

  return (
    <div className="space-y-6">

      <div className="flex gap-4">
        {/* Thêm thành viên */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border border-gray-200 w-1/2">
          <User size={22} className="text-gray-400" />
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Nhập email để thêm thành viên"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleAddMember}
            disabled={loading}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} /> Thêm
          </button>
        </div>

        {/* Tìm kiếm thành viên */}
        <div className="flex items-center gap-2 w-1/2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm thành viên"
            className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            disabled
            className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500 cursor-not-allowed"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Danh sách thành viên */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 divide-y divide-gray-100">
        {filteredMembers.map((m) => (
          <div
            key={m._id}
            className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-semibold">{m.user?.full_name}</p>
              <p className="text-sm text-gray-500">{m.user?.email}</p>
            </div>

            {m.user?._id === currentUserId ? (
              currentUserRole !== "leader" && (
                <button
                  onClick={handleLeaveTeam}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  Rời nhóm
                </button>
              )
            ) : (
              currentUserRole === "leader" && (
                <button
                  onClick={() => handleRemoveMember(m.user._id)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Xóa thành viên"
                >
                  <X size={18} className="text-red-500" />
                </button>
              )
            )}
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <p className="p-4 text-center text-gray-400 text-sm">
            Không tìm thấy thành viên nào
          </p>
        )}
      </div>
    </div>
  );
}
