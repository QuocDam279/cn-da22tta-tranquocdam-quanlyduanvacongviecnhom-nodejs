import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useTasksByProject } from "../../hooks/useTasks";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // ✅ Fetch tasks
  const { data: tasks = [], isLoading: loadingTasks, isError: errorTasks } = useTasksByProject(project._id);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { 
      day: "2-digit", 
      month: "2-digit", 
      year: "numeric" 
    });
  };

  const handleClick = () => navigate(`/duan/${project._id}`);
  const progressValue = project.progress || 0;

  // 🛠️ Helper: Kiểm tra task đã xong (Hỗ trợ nhiều từ khóa)
  const isCompleted = (status) => {
    if (!status) return false;
    const s = status.toLowerCase(); // Chuyển hết về chữ thường
    return ["completed", "done", "đã hoàn thành", "hoàn thành"].includes(s);
  };

  // Tính toán số liệu
  const completedTasks = tasks.filter(t => isCompleted(t.status)).length;
  const totalTasks = tasks.length;

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group flex flex-col h-full"
    >
      {/* 1. Header & Tên dự án */}
      <div className="px-4 pt-4 pb-2 bg-gradient-to-r from-indigo-50 to-white group-hover:from-indigo-100 transition-colors">
        <h4 
          className="text-base font-semibold text-gray-800 truncate group-hover:text-indigo-700" 
          title={project.project_name}
        >
          {project.project_name}
        </h4>
      </div>

      {/* 2. Ngày tháng */}
      <div className="px-4 py-2 flex items-center gap-2 text-gray-500 text-xs">
        <Calendar size={14} className="flex-shrink-0" />
        <span className="truncate">
          {formatDate(project.start_date)} - {formatDate(project.end_date)}
        </span>
      </div>

      {/* 3. Thanh tiến độ */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Tiến độ</span>
          <span className="text-xs font-bold text-indigo-600">{Math.round(progressValue)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      <div className="border-t border-gray-100 mx-4 my-1"></div>

      {/* 4. Danh sách công việc (Preview) */}
      <div className="px-4 pb-4 pt-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            Công việc
          </p>
          {totalTasks > 0 && (
            <span className="text-[10px] font-medium bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
              {completedTasks}/{totalTasks}
            </span>
          )}
        </div>

        {loadingTasks ? (
          <div className="flex items-center gap-2 text-gray-400 mt-2">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        ) : errorTasks ? (
          <div className="flex items-center gap-1 text-red-500 mt-2">
            <AlertCircle size={14} />
            <span className="text-xs">Lỗi tải dữ liệu</span>
          </div>
        ) : totalTasks > 0 ? (
          <div className="space-y-2">
            {/* Chỉ hiện tối đa 3 task */}
            {tasks.slice(0, 3).map((task) => {
              const finished = isCompleted(task.status);
              
              return (
                <div 
                  key={task._id} 
                  className="flex items-start gap-2 group/task"
                >
                  {/* Icon Checkbox */}
                  <div className="mt-0.5 flex-shrink-0">
                    {finished ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <Circle size={14} className="text-gray-300 group-hover/task:text-indigo-400 transition-colors" />
                    )}
                  </div>

                  {/* Tên Task */}
                  <span 
                    className={`text-xs truncate transition-colors ${
                      finished 
                        ? "text-gray-400 line-through decoration-gray-300" 
                        : "text-gray-700 group-hover/task:text-indigo-600"
                    }`}
                    title={task.task_name}
                  >
                    {task.task_name}
                  </span>
                </div>
              );
            })}

            {/* Hiển thị số lượng còn lại */}
            {totalTasks > 3 && (
              <p className="text-[10px] text-gray-400 italic pl-6">
                +{totalTasks - 3} công việc khác...
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic mt-1">Chưa có công việc nào</p>
        )}
      </div>
    </div>
  );
}