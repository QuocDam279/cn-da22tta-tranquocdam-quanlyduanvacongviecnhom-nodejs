import React, { useState, useMemo } from "react";
import { Plus, X, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFindUserByEmail } from "../../hooks/useProfile";
import { useAddMembers, useRemoveMember, useLeaveTeam } from "../../hooks/useTeams";

export default function TeamMembers({
  teamId,
  members,
  currentUserId,
  currentUserRole,
  onMembersUpdated
}) {
  const [emailInput, setEmailInput] = useState("");
  const [emailToSearch, setEmailToSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { data: findUserData } = useFindUserByEmail(emailToSearch);
  const addMembersMutation = useAddMembers();
  const removeMemberMutation = useRemoveMember();
  const leaveTeamMutation = useLeaveTeam();

  const loading = addMembersMutation.isPending || 
                  removeMemberMutation.isPending || 
                  leaveTeamMutation.isPending;

  const removeVietnameseTone = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const handleAddMember = async () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;
    
    setError("");
    setEmailToSearch(trimmedEmail);
  };

  React.useEffect(() => {
    if (!emailToSearch || !findUserData) return;

    const user = findUserData.user;

    if (!user) {
      setError("Không tìm thấy người dùng");
      setEmailToSearch("");
      return;
    }

    if (user._id === currentUserId) {
      setError("Bạn không thể thêm chính mình");
      setEmailToSearch("");
      return;
    }

    if (members.some((m) => m.user?._id === user._id)) {
      setError("Thành viên đã có trong nhóm");
      setEmailToSearch("");
      return;
    }

    addMembersMutation.mutate(
      { teamId, userIds: [user._id] },
      {
        onSuccess: () => {
          onMembersUpdated([
            ...members,
            { 
              _id: user._id, 
              user: { 
                _id: user._id, 
                full_name: user.full_name, 
                email: user.email,
                avatar: user.avatar // ✅ Thêm avatar
              } 
            }
          ]);
          setEmailInput("");
          setEmailToSearch("");
          setError("");
        },
        onError: (err) => {
          setError(err.message || "Thêm thành viên thất bại");
          setEmailToSearch("");
        }
      }
    );
  }, [emailToSearch, findUserData]);

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    setError("");

    removeMemberMutation.mutate(
      { teamId, userId },
      {
        onSuccess: () => {
          onMembersUpdated(members.filter((m) => m.user?._id !== userId));
        },
        onError: (err) => {
          setError(err.message || "Xóa thành viên thất bại");
        }
      }
    );
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Bạn có chắc muốn rời nhóm?")) return;
    setError("");

    leaveTeamMutation.mutate(teamId, {
      onSuccess: () => {
        onMembersUpdated(members.filter((m) => m.user?._id !== currentUserId));
        navigate("/nhom");
      },
      onError: (err) => {
        setError(err.message || "Rời nhóm thất bại");
      }
    });
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

  // ✅ Component hiển thị avatar
  const UserAvatar = ({ user }) => {
    const avatarUrl = user?.avatar 
      ? `${import.meta.env.VITE_API_URL}${user.avatar}`
      : null;

    return (
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={user?.full_name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span className={avatarUrl ? "hidden" : ""}>
          {user?.full_name?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  };

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
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
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
            className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors"
          >
            {/* ✅ Avatar + Info */}
            <div className="flex items-center gap-3">
              <UserAvatar user={m.user} />
              <div>
                <p className="font-semibold text-gray-800">{m.user?.full_name}</p>
                <p className="text-sm text-gray-500">{m.user?.email}</p>
              </div>
            </div>

            {/* Actions */}
            {m.user?._id === currentUserId ? (
              currentUserRole !== "leader" && (
                <button
                  onClick={handleLeaveTeam}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Rời nhóm
                </button>
              )
            ) : (
              currentUserRole === "leader" && (
                <button
                  onClick={() => handleRemoveMember(m.user._id)}
                  disabled={loading}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
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