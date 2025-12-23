import React, { useState, useRef, useEffect } from "react";
import { Calendar, Info } from "lucide-react";

export default function TaskDates({
  task,
  onUpdateDate,
  hasEditPermission = false,
  isUpdating = false,
  projectStartDate, // ✅ Ngày bắt đầu dự án
  projectEndDate,   // ✅ Ngày kết thúc dự án
}) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const toInput = (d) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const toText = (d) =>
    d ? new Date(d).toLocaleDateString("vi-VN") : "-";

  const formatDateVN = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // ⛔ Click outside → đóng và hủy chỉnh sửa
  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setEditing(null);
        setError("");
      }
    };
    if (editing) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [editing]);

  const handleDateChange = (field, newValue) => {
    setError("");

    // Validate logic ngày tháng
    const startDate = field === "start_date" ? newValue : task.start_date;
    const dueDate = field === "due_date" ? newValue : task.due_date;

    // 1. Kiểm tra start_date <= due_date
    if (startDate && dueDate && startDate > dueDate) {
      return setError("Ngày bắt đầu không thể sau ngày kết thúc!");
    }

    // 2. Kiểm tra với hạn dự án
    if (projectStartDate && startDate && startDate < projectStartDate) {
      return setError(`Không được sớm hơn dự án (${formatDateVN(projectStartDate)})`);
    }
    if (projectEndDate && dueDate && dueDate > projectEndDate) {
      return setError(`Không được trễ hơn dự án (${formatDateVN(projectEndDate)})`);
    }

    // ✅ Hợp lệ → cập nhật
    onUpdateDate(field, newValue);
    setEditing(null);
  };

  const Row = ({ label, field }) => {
    const isEditing = editing === field;
    const currentValue = toInput(task[field]);
    
    // Tính min/max cho input
    let minDate = projectStartDate;
    let maxDate = projectEndDate;
    
    if (field === "due_date" && task.start_date) {
      minDate = toInput(task.start_date); // Due date không được nhỏ hơn start date
    }
    if (field === "start_date" && task.due_date) {
      maxDate = toInput(task.due_date); // Start date không được lớn hơn due date
    }

    return (
      <div className="space-y-1">
        <div
          ref={isEditing ? inputRef : null}
          className="flex items-center justify-between rounded-lg border px-3 py-2 bg-white"
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
              autoFocus
              onChange={(e) => handleDateChange(field, e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <span
              onClick={() =>
                hasEditPermission && !isUpdating && setEditing(field)
              }
              className={`text-sm font-medium ${
                hasEditPermission
                  ? "cursor-pointer text-gray-800 hover:underline"
                  : "text-gray-500"
              }`}
            >
              {toText(task[field])}
            </span>
          )}
        </div>

        {/* Error message */}
        {isEditing && error && (
          <div className="flex items-center gap-1 text-xs text-red-600 px-2">
            <Info size={12} />
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Thông báo hạn dự án */}
      {(projectStartDate || projectEndDate) && (
        <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <Info size={12} />
          <span>
            Thời gian dự án: {formatDateVN(projectStartDate)} - {formatDateVN(projectEndDate)}
          </span>
        </div>
      )}

      <Row label="Ngày bắt đầu" field="start_date" />
      <Row label="Hạn hoàn thành" field="due_date" />
    </div>
  );
}