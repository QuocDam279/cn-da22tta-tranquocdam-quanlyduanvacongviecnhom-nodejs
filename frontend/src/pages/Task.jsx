// pages/Task.jsx
import React from "react";
import TaskDragDrop from "../components/task/TaskDragDrop";
import TaskItem from "../components/task/TaskItem";

// Hooks
import { useMyTasks, useTaskStats, useUpdateTask } from "../hooks/useTasks";

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
