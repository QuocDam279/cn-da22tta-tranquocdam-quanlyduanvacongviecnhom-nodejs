import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

// Helper function tính số ngày còn lại
const getDaysUntilDeadline = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(dueDate);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function TaskItem({ task, onTaskUpdated, hideStatus = false }) {
  const navigate = useNavigate();
  
  const handleClick = () => navigate(`/congviec/${task._id}`);

  // Tính số ngày còn lại
  const daysLeft = useMemo(() => {
    return getDaysUntilDeadline(task.due_date);
  }, [task.due_date]);

  // Kiểm tra xem có phải task khẩn cấp không (≤3 ngày và chưa hoàn thành)
  const isUrgent = useMemo(() => {
    if (task.status === "Done") return false;
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  }, [daysLeft, task.status]);

  // Kiểm tra xem có quá hạn không
  const isOverdue = useMemo(() => {
    if (task.status === "Done") return false;
    return daysLeft !== null && daysLeft < 0;
  }, [daysLeft, task.status]);

  const statusStyle = {
    "To Do": "bg-orange-200 text-orange-800",       
    "In Progress": "bg-blue-200 text-blue-800",   
    Done: "bg-pink-200 text-pink-800",           
  };

  const priorityStyle = {
    Low: "bg-green-100 text-green-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  // Style cho deadline badge
  const getDeadlineBadgeStyle = () => {
    if (isOverdue) {
      return "bg-red-600 text-white";
    }
    if (daysLeft === 0) {
      return "bg-red-500 text-white";
    }
    if (daysLeft === 1) {
      return "bg-orange-500 text-white";
    }
    if (daysLeft <= 3) {
      return "bg-amber-500 text-white";
    }
    return "bg-gray-200 text-gray-700";
  };

  // Text cho deadline badge
  const getDeadlineText = () => {
    if (isOverdue) {
      return `Quá hạn ${Math.abs(daysLeft)} ngày`;
    }
    if (daysLeft === 0) {
      return "Hôm nay";
    }
    if (daysLeft === 1) {
      return "Còn 1 ngày";
    }
    return `Còn ${daysLeft} ngày`;
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-xl border ${
        isOverdue 
          ? "border-red-500 bg-red-50" 
          : isUrgent && daysLeft === 0
          ? "border-red-400 bg-red-50"
          : isUrgent
          ? "border-amber-400 bg-amber-50"
          : "border-blue-300 bg-white"
      } p-3 cursor-pointer shadow-sm hover:shadow-md transition-all`}
    >
      {/* Header với icon cảnh báo nếu cần */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {(isUrgent || isOverdue) && (
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              isOverdue || daysLeft === 0 ? "text-red-600" : "text-amber-600"
            }`} />
          )}
          <h2 className="font-medium text-sm text-gray-900 truncate">
            {task.task_name}
          </h2>
        </div>

        <div className="flex gap-1 items-center flex-nowrap flex-shrink-0">
          {/* Badge deadline - hiển thị khi ≤3 ngày hoặc quá hạn */}
          {(isUrgent || isOverdue) && (
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${getDeadlineBadgeStyle()} flex items-center gap-1`}
            >
              {getDeadlineText()}
            </span>
          )}

          {/* Status badge */}
          {!hideStatus && task.status !== "Review" && (
            <span
              className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusStyle[task.status]}`}
            >
              {task.status === "To Do"
                ? "Chưa thực hiện"
                : task.status === "In Progress"
                ? "Đang thực hiện"
                : "Đã hoàn thành"}
            </span>
          )}

          {/* Priority badge */}
          <span
            className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${priorityStyle[task.priority]}`}
          >
            {task.priority === "Low"
              ? "Thấp"
              : task.priority === "Medium"
              ? "Trung bình"
              : "Cao"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1 text-[10px]">
          <span className="text-gray-600 font-medium">Tiến độ</span>
          <span className="text-gray-700 font-medium">{task.progress}%</span>
        </div>
        <div className="w-full bg-blue-100 h-1.5 rounded-full">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              isOverdue 
                ? "bg-red-500" 
                : isUrgent && daysLeft === 0
                ? "bg-red-500"
                : isUrgent
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Thông tin deadline chi tiết (nếu có due_date) */}
      {task.due_date && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-[10px] text-gray-600">
            <span className="font-medium">Deadline:</span>{" "}
            {new Date(task.due_date).toLocaleDateString("vi-VN")}
          </div>
        </div>
      )}
    </div>
  );
}