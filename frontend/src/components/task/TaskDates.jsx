import React, { useState } from "react"; // Bỏ useRef, useEffect thừa
import { Calendar, Info } from "lucide-react";

export default function TaskDates({
  task,
  onUpdateDate,
  hasEditPermission = false,
  isUpdating = false,
  projectStartDate,
  projectEndDate,
}) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  // Không cần inputRef nữa vì ta dùng onBlur trực tiếp

  const toInput = (d) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const toText = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "-";

  const formatDateVN = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // ✅ Xử lý logic khi người dùng click ra ngoài hoặc nhấn Tab
  const handleBlur = () => {
    // Nếu đang có lỗi thì giữ nguyên để người dùng sửa, 
    // hoặc bạn có thể chọn setEditing(null) để đóng luôn (tùy UX).
    // Ở đây mình chọn đóng luôn để tránh bị kẹt.
    setEditing(null);
    setError("");
  };

  // ✅ Xử lý phím tắt (Esc để hủy)
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setEditing(null);
      setError("");
    }
  };

  const handleDateChange = (field, newValue) => {
    setError("");

    const startDate = field === "start_date" ? newValue : task.start_date;
    const dueDate = field === "due_date" ? newValue : task.due_date;

    // 1. Kiểm tra logic
    if (startDate && dueDate && startDate > dueDate) {
      // Giữ editing để hiển thị lỗi
      return setError("Ngày bắt đầu không thể sau ngày kết thúc!");
    }

    if (projectStartDate && startDate && startDate < projectStartDate) {
      return setError(`Không được sớm hơn dự án (${formatDateVN(projectStartDate)})`);
    }
    if (projectEndDate && dueDate && dueDate > projectEndDate) {
      return setError(`Không được trễ hơn dự án (${formatDateVN(projectEndDate)})`);
    }

    // Hợp lệ -> cập nhật và đóng
    onUpdateDate(field, newValue);
    setEditing(null);
  };

  const Row = ({ label, field }) => {
    const isEditing = editing === field;
    const currentValue = toInput(task[field]);
    
    let minDate = projectStartDate;
    let maxDate = projectEndDate;
    
    if (field === "due_date" && task.start_date) {
      minDate = toInput(task.start_date);
    }
    if (field === "start_date" && task.due_date) {
      maxDate = toInput(task.due_date);
    }

    return (
      <div className="space-y-1">
        <div
          className={`flex items-center justify-between rounded-lg border px-3 py-2 bg-white ${
            isEditing ? "ring-2 ring-blue-100 border-blue-400" : ""
          }`}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            {label}
          </div>

          {isEditing && hasEditPermission ? (
            <input
              type="date"
              value={currentValue}
              min={minDate}
              max={maxDate}
              disabled={isUpdating}
              autoFocus // ✅ Tự động focus khi mở
              onBlur={handleBlur} // ✅ Đóng khi click ra ngoài
              onKeyDown={handleKeyDown} // ✅ Cho phép nhấn ESC để thoát
              onChange={(e) => handleDateChange(field, e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-0 w-32"
            />
          ) : (
            <span
              onClick={() => {
                if (hasEditPermission && !isUpdating) {
                  setEditing(field);
                  setError(""); // Reset lỗi cũ khi mở mới
                }
              }}
              className={`text-sm font-medium ${
                hasEditPermission
                  ? "cursor-pointer text-gray-800 hover:underline hover:text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {toText(task[field])}
            </span>
          )}
        </div>

        {/* Error message */}
        {isEditing && error && (
          <div className="flex items-center gap-1 text-xs text-red-600 px-2 animate-pulse">
            <Info size={12} />
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {(projectStartDate || projectEndDate) && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <Info size={12} />
          <span>
            Dự án: {formatDateVN(projectStartDate)} - {formatDateVN(projectEndDate)}
          </span>
        </div>
      )}

      <Row label="Ngày bắt đầu" field="start_date" />
      <Row label="Hạn hoàn thành" field="due_date" />
    </div>
  );
}