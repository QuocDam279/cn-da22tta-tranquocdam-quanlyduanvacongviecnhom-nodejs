import React from "react";

export default function StatusSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500">
        Trạng thái
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
        <option>Chưa thực hiện</option>
        <option>Đang thực hiện</option>
        <option>Đã hoàn thành</option>
      </select>
    </div>
  );
}