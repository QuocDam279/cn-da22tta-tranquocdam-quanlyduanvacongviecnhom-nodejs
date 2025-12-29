// src/components/teams/TeamMemberItem.jsx
import { X } from "lucide-react";
import UserAvatar from "../common/UserAvatar";

export default function TeamMemberItem({ 
  member, 
  currentUserId, 
  currentUserRole, 
  onRemove, 
  onLeave,
  onMemberClick, 
  loading 
}) {
  const user = member.user;

  const handleMemberClick = () => {
    // SỬA ĐỔI: Cho phép click vào bất kỳ user nào (kể cả chính mình)
    // miễn là có prop onMemberClick được truyền vào
    if (onMemberClick) {
      onMemberClick(user);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
      {/* Avatar + Info - Clickable for ALL users */}
      <div 
        className={`flex items-center gap-3 flex-1 ${
          onMemberClick ? 'cursor-pointer' : ''
        }`}
        onClick={handleMemberClick}
      >
        <UserAvatar user={user} className="w-12 h-12" />
        <div>
          <p className="font-semibold text-gray-800">{user?.full_name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Actions - Giữ nguyên logic cũ */}
      {user?._id === currentUserId ? (
        // Nếu là chính mình -> Hiện nút Rời nhóm (trừ khi là Leader)
        currentUserRole !== "leader" && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện click lan ra div cha (mở profile)
              onLeave();
            }}
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
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện click lan ra div cha (mở profile)
              onRemove(user._id);
            }}
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