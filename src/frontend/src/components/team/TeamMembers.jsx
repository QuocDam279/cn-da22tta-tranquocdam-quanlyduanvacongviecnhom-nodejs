// src/components/teams/TeamMembers.jsx - OPTIMIZED VERSION
import React, { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Hooks
import { useFindUserByEmail } from "../../hooks/useProfile";
import { useAddMembers, useRemoveMember, useLeaveTeam } from "../../hooks/useTeams";

// Components
import ConfirmDialog from "../common/ConfirmDialog";
import TeamMemberItem from "./TeamMemberItem";
import MemberWorkModal from "./MemberWorkModal";

export default function TeamMembers({
  teamId,
  members,
  currentUserId,
  currentUserRole,
}) {
  const navigate = useNavigate();
  
  // State
  const [emailInput, setEmailInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  
  // Modal State
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  // ✅ FIX: Manual trigger cho find user (không dùng useEffect)
  const [emailToFind, setEmailToFind] = useState(null);
  const { data: findUserData, isFetching: isFindingUser } = useFindUserByEmail(emailToFind);

  // API Mutations
  const addMembersMutation = useAddMembers();
  const removeMemberMutation = useRemoveMember();
  const leaveTeamMutation = useLeaveTeam();

  const loading = addMembersMutation.isPending || 
                  removeMemberMutation.isPending || 
                  leaveTeamMutation.isPending;

  // --- HANDLERS ---
  const handleAddMember = async () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      toast.error("Vui lòng nhập email");
      return;
    }

    // Validation ngay lập tức
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // ✅ Trigger tìm user
    setEmailToFind(trimmedEmail);
  };

  // ✅ FIX: Xử lý kết quả tìm user bằng useEffect có dependencies đầy đủ
  React.useEffect(() => {
    if (!emailToFind || isFindingUser) return;
    if (!findUserData) return;

    const user = findUserData.user;

    // Reset trigger
    setEmailToFind(null);

    if (!user) {
      toast.error("Không tìm thấy người dùng với email này");
      return;
    }

    // Validation
    if (user._id === currentUserId) {
      toast.error("Bạn không thể thêm chính mình");
      return;
    }

    if (members.some((m) => m.user?._id === user._id)) {
      toast.error(`${user.full_name} đã có trong nhóm`);
      setEmailInput("");
      return;
    }

    // Thực hiện thêm
    const loadingToast = toast.loading(`Đang thêm ${user.full_name}...`);
    addMembersMutation.mutate(
      { teamId, userIds: [user._id] },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success(`✨ Đã thêm ${user.full_name} vào nhóm`);
          setEmailInput("");
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error(err.message || "Không thể thêm thành viên");
        }
      }
    );
  }, [findUserData, emailToFind, isFindingUser, currentUserId, members, teamId, addMembersMutation]);

  const handleRemoveClick = (userId) => {
    const member = members.find((m) => m.user?._id === userId);
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const handleMemberClick = (user) => {
    setSelectedMember(user);
  };

  // --- CONFIRM ACTIONS ---
  const confirmRemoveMember = () => {
    if (!memberToRemove) return;
    
    const loadingToast = toast.loading("Đang xóa thành viên...");
    removeMemberMutation.mutate(
      { teamId, userId: memberToRemove.user._id },
      {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          toast.success(`Đã xóa ${memberToRemove.user.full_name}`);
          setShowRemoveConfirm(false);
          setMemberToRemove(null);
        },
        onError: (err) => {
          toast.dismiss(loadingToast);
          toast.error(err.message || "Không thể xóa thành viên");
        }
      }
    );
  };

  const confirmLeaveTeam = () => {
    const loadingToast = toast.loading("Đang rời nhóm...");
    leaveTeamMutation.mutate(teamId, {
      onSuccess: () => {
        toast.dismiss(loadingToast);
        toast.success("Đã rời nhóm");
        setShowLeaveConfirm(false);
        navigate("/nhom");
      },
      onError: (err) => {
        toast.dismiss(loadingToast);
        toast.error(err.message || "Không thể rời nhóm");
      }
    });
  };

  // --- SEARCH FILTER ---
  const removeVietnameseTone = (str) => {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
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

  // ✅ Sort members: leader first, then by join date
  const sortedMembers = useMemo(() => {
    return [...filteredMembers].sort((a, b) => {
      // Leader luôn đứng đầu
      if (a.role === "leader" && b.role !== "leader") return -1;
      if (a.role !== "leader" && b.role === "leader") return 1;
      // Sắp xếp theo thời gian tham gia
      return new Date(a.joined_at) - new Date(b.joined_at);
    });
  }, [filteredMembers]);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Add Member Input */}
        {currentUserRole === "leader" && (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-md border border-gray-200 sm:w-1/2 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleAddMember()}
              placeholder="Nhập email thành viên mới"
              className="flex-1 px-3 py-2 rounded-lg bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
              disabled={loading || isFindingUser}
            />
            <button
              onClick={handleAddMember}
              disabled={loading || isFindingUser || !emailInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {(loading || isFindingUser) ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={16} /> Thêm
                </>
              )}
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="flex items-center gap-2 sm:flex-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={20} className="ml-3 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Tìm kiếm thành viên..."
            className="flex-1 px-3 py-3 rounded-lg bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Members Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredMembers.length === members.length ? (
            <span><strong>{members.length}</strong> thành viên</span>
          ) : (
            <span>Hiển thị <strong>{filteredMembers.length}</strong> / {members.length} thành viên</span>
          )}
        </p>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-50 overflow-hidden">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((m) => (
            <TeamMemberItem
              key={m._id}
              member={m}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onRemove={handleRemoveClick}
              onLeave={handleLeaveClick}
              onMemberClick={handleMemberClick}
              loading={loading}
            />
          ))
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-1">Không tìm thấy thành viên</p>
            <p className="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      {showRemoveConfirm && memberToRemove && (
        <ConfirmDialog
          title="Xóa thành viên"
          message={`Bạn có chắc muốn xóa ${memberToRemove.user.full_name} khỏi nhóm? Hành động này không thể hoàn tác.`}
          confirmText="Xóa thành viên"
          isDangerous={true}
          isLoading={removeMemberMutation.isPending}
          onConfirm={confirmRemoveMember}
          onCancel={() => {
            setShowRemoveConfirm(false);
            setMemberToRemove(null);
          }}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmDialog
          title="Rời khỏi nhóm"
          message="Bạn có chắc muốn rời nhóm này? Bạn sẽ mất quyền truy cập vào tất cả dự án của nhóm."
          confirmText="Rời nhóm"
          isDangerous={true}
          isLoading={leaveTeamMutation.isPending}
          onConfirm={confirmLeaveTeam}
          onCancel={() => setShowLeaveConfirm(false)}
        />
      )}

      {/* Member Work Modal */}
      {selectedMember && (
        <MemberWorkModal
          member={selectedMember}
          teamId={teamId}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}