import { Clock } from "lucide-react";

// Mapping trạng thái tiếng Anh sang tiếng Việt (chỉ 3 trạng thái)
const STATUS_VN = {
  "To Do": "Chưa thực hiện",
  "In Progress": "Đang thực hiện",
  "Done": "Đã hoàn thành",
};

// Màu sắc tương ứng
const STATUS_COLOR = {
  "Chưa thực hiện": { bg: "bg-orange-100", text: "text-orange-600" },
  "Đang thực hiện": { bg: "bg-blue-100", text: "text-blue-600" },
  "Đã hoàn thành": { bg: "bg-green-100", text: "text-green-600" },
};

export default function UpcomingTasks({ tasks }) {
  // Lọc ra chỉ 3 trạng thái hợp lệ
  const filteredTasks = tasks.filter((task) =>
    ["To Do", "In Progress", "Done"].includes(task.status)
  );

  if (!filteredTasks.length) {
    return (
      <div className="text-gray-400 text-sm text-center">
        Không có công việc sắp đến hạn
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => {
        const vnStatus = STATUS_VN[task.status];
        const color = STATUS_COLOR[vnStatus];

        return (
          <div
            key={task._id}
            className="flex items-start gap-3 p-3 rounded-xl border hover:bg-gray-50 transition"
          >
            <Clock className="w-4 h-4 text-orange-500 mt-1" />

            <div className="flex-1">
              <p className="font-medium text-sm">{task.task_name}</p>
              <p className="text-xs text-gray-500">
                Hạn: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "Chưa có"}
              </p>
            </div>

            <span className={`text-xs px-2 py-1 rounded-full ${color.bg} ${color.text}`}>
              {vnStatus}
            </span>
          </div>
        );
      })}
    </div>
  );
}
