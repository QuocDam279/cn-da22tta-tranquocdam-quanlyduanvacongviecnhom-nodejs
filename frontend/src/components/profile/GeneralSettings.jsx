// src/components/profile/GeneralSettings.jsx
import React, { useState } from "react";
import { Save, X, User, Mail, Calendar, Clock } from "lucide-react";
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

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Thông tin cá nhân */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Thông tin cá nhân</h2>
        
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Họ và tên
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onDoubleClick={handleDoubleClick}
                readOnly={!isEditing}
                className={`flex-1 px-4 py-2.5 rounded-lg border transition-all text-sm
                  ${
                    isEditing
                      ? "border-blue-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      : "border-slate-200 bg-slate-50 text-slate-900 cursor-pointer hover:border-slate-300 hover:bg-white"
                  }`}
                placeholder="Nhấp đúp để chỉnh sửa"
              />

              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Hủy
                  </button>
                </div>
              )}
            </div>
            {!isEditing && (
              <p className="text-xs text-slate-500 mt-1.5">Nhấp đúp để chỉnh sửa</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1.5">Email không thể thay đổi</p>
          </div>
        </div>
      </div>

      {/* Thông tin tài khoản */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4">Thông tin tài khoản</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Created At */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Ngày tạo</p>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(user?.created_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Last Login */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-emerald-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">Đăng nhập lần cuối</p>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.last_login
                    ? new Date(user.last_login).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
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