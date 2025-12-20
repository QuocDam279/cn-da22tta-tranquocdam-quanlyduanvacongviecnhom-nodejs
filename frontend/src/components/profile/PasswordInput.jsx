// ========================================
// 4. PasswordInput.jsx - IMPROVED
// ========================================
import React from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  label,
  value,
  onChange,
  showPassword,
  toggleShow,
  placeholder,
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <Lock size={16} className="text-blue-500" />
        {label}
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-blue-500 transition-all font-medium"
        />

        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-4 top-1/2 -translate-y-1/2
                     text-gray-400 hover:text-blue-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
