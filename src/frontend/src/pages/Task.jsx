// pages/Task.jsx
import React, { useMemo } from "react";
import TaskDragDrop from "../components/task/TaskDragDrop";
import TaskItem from "../components/task/TaskItem";
import { AlertTriangle } from "lucide-react";

// Hooks
import { useMyTasks, useTaskStats, useUpdateTask } from "../hooks/useTasks";

// Helper function để tính số ngày còn lại
const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function Task() {
  // ✅ Fetch tasks
  const {
    data: tasks = [],
    isLoading: loading,
    error: taskError,
  } = useMyTasks();

  // ✅ Fetch stats (nếu sau này cần hiển thị)
  const { data: stats } = useTaskStats();

  // ✅ Update task mutation
  const updateTaskMutation = useUpdateTask();

  // Lọc các công việc sắp đến hạn (≤3 ngày và chưa hoàn thành)
  const urgentTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === "Done") return false;
      const daysLeft = getDaysUntilDeadline(task.deadline);
      return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
    }).sort((a, b) => {
      // Sắp xếp theo số ngày còn lại (ít nhất trước)
      const daysA = getDaysUntilDeadline(a.deadline);
      const daysB = getDaysUntilDeadline(b.deadline);
      return daysA - daysB;
    });
  }, [tasks]);

  const handleTaskUpdated = async (taskId, payload) => {
    try {
      await updateTaskMutation.mutateAsync({ taskId, payload });
      // React Query tự invalidate & refetch
    } catch (err) {
      console.error("Error updating task:", err);
      throw err;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error khi load task */}
        {taskError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {taskError.message || "Lỗi khi tải công việc"}
          </div>
        )}

        {/* Error khi update */}
        {updateTaskMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Lỗi khi cập nhật công việc
          </div>
        )}

        {/* Cảnh báo công việc sắp đến hạn */}
        {!loading && urgentTasks.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Công việc sắp đến hạn ({urgentTasks.length})
                </h3>
                <div className="space-y-2">
                  {urgentTasks.map(task => {
                    const daysLeft = getDaysUntilDeadline(task.deadline);
                    return (
                      <div
                        key={task._id}
                        className="bg-white rounded-lg p-3 border border-amber-200 hover:border-amber-400 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/congviec/${task._id}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-medium text-gray-900 text-sm flex-1">
                            {task.task_name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                            daysLeft === 0
                              ? "bg-red-100 text-red-800"
                              : daysLeft === 1
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {daysLeft === 0
                              ? "Hôm nay"
                              : daysLeft === 1
                              ? "Còn 1 ngày"
                              : `Còn ${daysLeft} ngày`}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Deadline: {new Date(task.deadline).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <div className="text-gray-600">Đang tải công việc...</div>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">
              Chưa có công việc nào
            </p>
            <p className="text-sm text-gray-400">
              Bạn sẽ thấy các công việc được giao tại đây
            </p>
          </div>
        ) : (
          <TaskDragDrop
            tasks={tasks}
            onTaskUpdated={handleTaskUpdated}
            TaskItemComponent={TaskItem}
          />
        )}
      </div>
    </div>
  );
}