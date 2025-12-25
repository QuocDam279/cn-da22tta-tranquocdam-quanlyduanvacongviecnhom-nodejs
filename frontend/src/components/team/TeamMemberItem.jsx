// src/components/teams/TeamMemberItem.jsx
import { X } from "lucide-react";
import UserAvatar from "../common/UserAvatar";

export default function TeamMemberItem({ 
  member, 
  currentUserId, 
  currentUserRole, 
  onRemove, 
  onLeave,
  onMemberClick, // ✨ Thêm prop này
  loading 
}) {
  const user = member.user;

  const handleMemberClick = () => {
    // Chỉ cho phép click vào các thành viên khác (không phải chính mình)
    if (user?._id !== currentUserId && onMemberClick) {
      onMemberClick(user);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
      {/* Avatar + Info - Clickable */}
      <div 
        className={`flex items-center gap-3 flex-1 ${
          user?._id !== currentUserId ? 'cursor-pointer' : ''
        }`}
        onClick={handleMemberClick}
      >
        <UserAvatar user={user} className="w-12 h-12" />
        <div>
          <p className="font-semibold text-gray-800">{user?.full_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Actions */}
      {user?._id === currentUserId ? (
        // Nếu là chính mình -> Hiện nút Rời nhóm (trừ khi là Leader)
        currentUserRole !== "leader" && (
          <button
            onClick={onLeave}
            disabled={loading}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm disabled:opacity-50"
          >
            Rời nhóm
          </button>
        )
      ) : (
        // Nếu là người khác -> Leader được quyền Xóa
        currentUserRole === "leader" && (
          <button
            onClick={() => onRemove(user._id)}
            disabled={loading}
            className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            title="Xóa thành viên"
          >
            <X size={18} className="text-red-500" />
          </button>
        )
      )}
    </div>
  );
}