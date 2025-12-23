import React from "react";

export default function PrioritySelect({
  value,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">
        Độ ưu tiên
      </label>

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
          appearance-none focus:outline-none focus:ring-2 focus:ring-offset-1
          focus:ring-gray-400 transition
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-gray-400"}
          ${className}
        `}
      >
        <option>Thấp</option>
        <option>Trung bình</option>
        <option>Cao</option>
      </select>
    </div>
  );
}