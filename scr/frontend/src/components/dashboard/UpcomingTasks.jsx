import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { Clock } from "lucide-react";

// Mapping trạng thái
const STATUS_VN = {
  "To Do": "Chưa thực hiện",
  "In Progress": "Đang thực hiện",
  "Done": "Đã hoàn thành",
};

// Màu sắc
const STATUS_COLOR = {
  "Chưa thực hiện": { bg: "bg-orange-100", text: "text-orange-600" },
  "Đang thực hiện": { bg: "bg-blue-100", text: "text-blue-600" },
  "Đã hoàn thành": { bg: "bg-green-100", text: "text-green-600" },
};

export default function UpcomingTasks({ tasks }) {
  const navigate = useNavigate(); // ✅ Khởi tạo hook

  const filteredTasks = tasks.filter((task) =>
    ["To Do", "In Progress", "Done"].includes(task.status)
  );

  if (!filteredTasks.length) {
    return (
      <div className="text-gray-400 text-sm text-center py-4">
        Không có công việc sắp đến hạn
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => {
        const vnStatus = STATUS_VN[task.status] || "Chưa thực hiện";
        const color = STATUS_COLOR[vnStatus] || STATUS_COLOR["Chưa thực hiện"];

        return (
          <div
            key={task._id}
            onClick={() => navigate(`/congviec/${task._id}`)} // ✅ Sự kiện click
            className="flex items-start gap-3 p-3 rounded-xl border hover:bg-gray-50 transition cursor-pointer group" // ✅ Thêm cursor-pointer
          >
            <Clock className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors">
                {task.task_name}
              </p>
              <p className="text-xs text-gray-500">
                Hạn: {task.due_date ? new Date(task.due_date).toLocaleDateString("vi-VN") : "Chưa có"}
              </p>
            </div>

            <span className={`text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap ${color.bg} ${color.text}`}>
              {vnStatus}
            </span>
          </div>
        );
      })}
    </div>
  );
}