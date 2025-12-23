// src/components/teams/TeamMembers.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Hooks
import { useFindUserByEmail } from "../../hooks/useProfile";
import { useAddMembers, useRemoveMember, useLeaveTeam } from "../../hooks/useTeams";

// Components
import ConfirmDialog from "../common/ConfirmDialog";
import TeamMemberItem from "./TeamMemberItem"; // Import file con vừa tạo

export default function TeamMembers({
  teamId,
  members,
  currentUserId,
  currentUserRole,
  onMembersUpdated
}) {
  const navigate = useNavigate();
  
  // State
  const [emailInput, setEmailInput] = useState("");
  const [emailToSearch, setEmailToSearch] = useState(""); // Email trigger API
  const [searchValue, setSearchValue] = useState(""); // Search local list
  const [error, setError] = useState("");
  
  // Modal State
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // API Hooks
  const { data: findUserData } = useFindUserByEmail(emailToSearch);
  const addMembersMutation = useAddMembers();
  const removeMemberMutation = useRemoveMember();
  const leaveTeamMutation = useLeaveTeam();

  const loading = addMembersMutation.isPending || 
                  removeMemberMutation.isPending || 
                  leaveTeamMutation.isPending;

  // --- LOGIC HELPER ---
  const removeVietnameseTone = (str) =>
    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
       .replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

  // --- HANDLERS ---
  const handleAddMember = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;
    setError("");
    setEmailToSearch(trimmedEmail); // Trigger useEffect tìm user
  };

  const handleRemoveClick = (userId) => {
    const member = members.find((m) => m.user?._id === userId);
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  // --- EFFECTS (Logic thêm user khi tìm thấy) ---
  useEffect(() => {
    if (!emailToSearch || !findUserData) return;
    const user = findUserData.user;

    // Validate Logic
    if (!user) {
      toast.error("Không tìm thấy người dùng");
      setEmailToSearch("");
      return;
    }
    if (user._id === currentUserId) {
      toast.error("Bạn không thể thêm chính mình");
      setEmailToSearch("");
      return;
    }
    if (members.some((m) => m.user?._id === user._id)) {
      toast.error("Thành viên đã có trong nhóm");
      setEmailToSearch("");
      return;
    }

    // Call API Add
    const loadingToast = toast.loading("Đang thêm thành viên...");
    addMembersMutation.mutate(
      { teamId, userIds: [user._id] },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success(`Đã thêm ${user.full_name} vào nhóm ✨`);
          onMembersUpdated([...members, { _id: user._id, user }]);
          setEmailInput("");
          setEmailToSearch("");
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error(err.message || "Thêm thất bại");
          setEmailToSearch("");
        }
      }
    );
  }, [emailToSearch, findUserData]);

  // --- CONFIRM ACTIONS ---
  const confirmRemoveMember = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(
      { teamId, userId: memberToRemove.user._id },
      {
        onSuccess: () => {
          toast.success("Đã xóa thành viên");
          onMembersUpdated(members.filter((m) => m.user?._id !== memberToRemove.user._id));
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        }
      }
    );
  };

  const confirmLeaveTeam = () => {
    leaveTeamMutation.mutate(teamId, {
      onSuccess: () => {
        toast.success("Đã rời nhóm");
        onMembersUpdated(members.filter((m) => m.user?._id !== currentUserId));
        setShowLeaveConfirm(false);
        navigate("/nhom");
      }
    });
  };

  // --- RENDER FILTER ---
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
      {/* 1. Header Actions (Add & Search) */}
      <div className="flex gap-4">
        {/* Input Add */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border border-gray-200 w-1/2">
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            placeholder="Nhập email thêm thành viên"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={loading}
          />
          <button
            onClick={handleAddMember}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 flex items-center gap-1"
          >
            <Plus size={16} /> Thêm
          </button>
        </div>

        {/* Input Search Local */}
        <div className="flex items-center gap-2 w-1/2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm trong danh sách"
            className="flex-1 px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500">
            <Search size={16} />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* 2. Members List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 divide-y divide-gray-100">
        {filteredMembers.map((m) => (
          <TeamMemberItem
            key={m._id}
            member={m}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            onRemove={handleRemoveClick} // Truyền hàm xử lý xuống
            onLeave={handleLeaveClick}   // Truyền hàm xử lý xuống
            loading={loading}
          />
        ))}

        {filteredMembers.length === 0 && (
          <p className="p-4 text-center text-gray-400 text-sm">Không tìm thấy thành viên nào</p>
        )}
      </div>

      {/* 3. Confirm Dialogs */}
      {showRemoveConfirm && memberToRemove && (
        <ConfirmDialog
          title="Xóa thành viên"
          message={`Bạn có chắc muốn xóa ${memberToRemove.user.full_name}?`}
          confirmText="Xóa"
          isDangerous={true}
          isLoading={removeMemberMutation.isPending}
          onConfirm={confirmRemoveMember}
          onCancel={() => setShowRemoveConfirm(false)}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmDialog
          title="Rời nhóm"
          message="Bạn có chắc muốn rời nhóm?"
          confirmText="Rời"
          isDangerous={true}
          isLoading={leaveTeamMutation.isPending}
          onConfirm={confirmLeaveTeam}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}
    </div>
  );
}