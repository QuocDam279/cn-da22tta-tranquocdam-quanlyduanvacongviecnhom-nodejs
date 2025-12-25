import { useMemo, useState } from "react"; // Thêm useState

export default function UserAvatar({ user, className = "w-10 h-10" }) {
  // State để check xem ảnh có lỗi không
  const [imgError, setImgError] = useState(false);

  const avatarSrc = useMemo(() => {
    if (!user?.avatar) return null;

    // 1. Ảnh Link tuyệt đối (Google/Facebook)
    if (user.avatar.startsWith("http")) {
      // 🔥 FIX: Luôn ép về HTTPS để tránh lỗi Mixed Content
      return user.avatar.replace("http://", "https://");
    }

    // 2. Ảnh Upload (Link tương đối)
    const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "").replace(/\/$/, "");
    return `${baseUrl}${user.avatar}`;
  }, [user]);

  // Fallback URL (Avatar chữ cái)
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.full_name || user?.name || "User"
  )}&background=random&color=fff`;

  return (
    <div className={`${className} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200`}>
      <img 
        // Nếu không có src hoặc ảnh bị lỗi (imgError=true) thì dùng fallback
        src={(!imgError && avatarSrc) ? avatarSrc : fallbackSrc} 
        alt={user?.full_name || "Avatar"} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)} // Khi lỗi, bật cờ imgError
      />
    </div>
  );
}