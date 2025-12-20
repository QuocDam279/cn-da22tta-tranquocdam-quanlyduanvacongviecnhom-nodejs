// ========================================
// 1. ProfileHeader.jsx - IMPROVED
// ========================================
import React, { useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { useUploadAvatar } from "../../hooks/useProfile";
import { toast } from "react-hot-toast";

export default function ProfileHeader({ user }) {
  const fileInputRef = useRef(null);
  const uploadAvatarMutation = useUploadAvatar();

  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
    : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.full_name || "User");

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(file);
      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      toast.error(error.message || "Lỗi upload avatar");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar với gradient border */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <img
              src={avatarUrl}
              alt={user?.full_name}
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
            />

            {/* Overlay khi hover */}
            <button
              onClick={handleAvatarClick}
              disabled={uploadAvatarMutation.isPending}
              className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed z-20"
            >
              {uploadAvatarMutation.isPending ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <div className="text-center">
                  <Camera className="w-7 h-7 text-white mx-auto mb-1" />
                  <span className="text-white text-xs font-medium">Đổi ảnh</span>
                </div>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {user?.full_name}
          </h1>
          <p className="text-gray-600 mb-3 text-lg">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-sm">
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full font-semibold border border-blue-200 flex items-center gap-2">
              <User size={14} />
              Thành viên
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600 font-medium">
              Tham gia {new Date(user?.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}