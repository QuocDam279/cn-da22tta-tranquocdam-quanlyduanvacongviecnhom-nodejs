// ========================================
// 3. GeneralSettings.jsx - IMPROVED
// ========================================
import React, { useState } from "react";
import { Save, X, Edit2, User, Mail, Calendar, Clock } from "lucide-react";
import { useUpdateProfile } from "../../hooks/useProfile";
import { toast } from "react-hot-toast";

export default function GeneralSettings({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const updateProfileMutation = useUpdateProfile();

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Tên không được để trống");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ full_name: fullName.trim() });
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Lỗi cập nhật thông tin");
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Thông tin cá nhân */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Thông tin cá nhân</h2>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="text-blue-500" />
              Họ và tên
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all font-medium
                  ${
                    isEditing
                      ? "border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed"
                  }`}
              />

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
                >
                  <Edit2 size={16} />
                  Sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 font-semibold"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Lưu
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all flex items-center gap-2 font-semibold"
                  >
                    <X size={16} />
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} className="text-purple-500" />
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3 pl-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                Không thể thay đổi
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50/30 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-800">Thông tin tài khoản</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Created At */}
          <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Ngày tạo</p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(user?.created_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Last Login */}
          <div className="bg-white rounded-xl p-4 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Clock className="text-pink-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">Đăng nhập lần cuối</p>
                <p className="text-sm font-bold text-gray-800">
                  {user?.last_login
                    ? new Date(user.last_login).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Chưa có"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}