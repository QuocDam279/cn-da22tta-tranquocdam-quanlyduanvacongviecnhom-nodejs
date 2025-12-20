// ========================================
// 5. SecuritySettings.jsx - IMPROVED
// ========================================
import React, { useState } from "react";
import { Loader2, Shield, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useChangePassword } from "../../hooks/useProfile";
import PasswordInput from "./PasswordInput";

export default function SecuritySettings() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });

      toast.success("Đổi mật khẩu thành công!");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message || "Lỗi đổi mật khẩu");
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Yếu", color: "text-red-600 bg-red-50" };
    if (password.length < 10) return { strength: 2, label: "Trung bình", color: "text-yellow-600 bg-yellow-50" };
    return { strength: 3, label: "Mạnh", color: "text-green-600 bg-green-50" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h2>
          <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <PasswordInput
          label="Mật khẩu hiện tại"
          value={oldPassword}
          onChange={setOldPassword}
          showPassword={showOldPassword}
          toggleShow={() => setShowOldPassword(!showOldPassword)}
          placeholder="Nhập mật khẩu hiện tại"
        />

        <PasswordInput
          label="Mật khẩu mới"
          value={newPassword}
          onChange={setNewPassword}
          showPassword={showNewPassword}
          toggleShow={() => setShowNewPassword(!showNewPassword)}
          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
        />

        {/* Password Strength Indicator */}
        {newPassword && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-gray-600">Độ mạnh:</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${passwordStrength.color}`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    level <= passwordStrength.strength
                      ? level === 1
                        ? "bg-red-500"
                        : level === 2
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <PasswordInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={setConfirmPassword}
          showPassword={showConfirmPassword}
          toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
          placeholder="Nhập lại mật khẩu mới"
        />

        {/* Password match indicator */}
        {confirmPassword && (
          <div className="animate-fade-in">
            {newPassword === confirmPassword ? (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Check size={16} />
                Mật khẩu khớp
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                <X size={16} />
                Mật khẩu không khớp
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl
                     hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl
                     flex items-center justify-center gap-2 disabled:opacity-50
                     disabled:cursor-not-allowed mt-6 font-semibold text-base"
        >
          {changePasswordMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Đang xử lý...
            </>
          ) : (
            <>
              <Shield size={20} />
              Đổi mật khẩu
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}