// src/components/common/UserAvatar.jsx
import { useMemo } from "react";

export default function UserAvatar({ user, className = "w-10 h-10" }) {
  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null;

    // 1. Ảnh Google/Facebook (Link tuyệt đối)
    if (user.avatar.startsWith("http")) {
      return user.avatar;
    }

    // 2. Ảnh Upload (Link tương đối) -> Nối domain backend
    // Xử lý xóa '/api' ở cuối nếu có để lấy domain gốc
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "").replace(/\/$/, "");
    return `${baseUrl}${user.avatar}`;
  }, [user]);

  // Fallback URL (Avatar chữ cái)
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.full_name || "User"
  )}&background=random&color=fff`;

  return (
    <div className={`${className} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200`}>
      <img 
        src={avatarSrc || fallbackSrc} 
        alt={user?.full_name} 
        className="w-full h-full object-cover"
        // QUAN TRỌNG: Chống lỗi 403 Google
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
      />
    </div>
  );
}