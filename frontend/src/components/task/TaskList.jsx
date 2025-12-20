// 3. TaskList.jsx - IMPROVED
// ========================================
import React, { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onTaskUpdated }) {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.task_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchText.toLowerCase()));

      const matchesStatus = statusFilter ? task.status === statusFilter : true;
      const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchText, statusFilter, priorityFilter]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full lg:w-auto pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white cursor-pointer font-medium text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="To Do">Chưa thực hiện</option>
                <option value="In Progress">Đang thực hiện</option>
                <option value="Done">Đã hoàn thành</option>
              </select>
            </div>

            <div className="relative flex-1 lg:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full lg:w-auto pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white cursor-pointer font-medium text-sm"
              >
                <option value="">Tất cả mức độ</option>
                <option value="Low">Thấp</option>
                <option value="Medium">Trung bình</option>
                <option value="High">Cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchText || statusFilter || priorityFilter) && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
            <span className="text-xs font-medium text-gray-500">Bộ lọc:</span>
            {searchText && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                "{searchText}"
              </span>
            )}
            {statusFilter && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {statusFilter === "To Do" ? "Chưa thực hiện" : statusFilter === "In Progress" ? "Đang thực hiện" : "Đã hoàn thành"}
              </span>
            )}
            {priorityFilter && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                Ưu tiên: {priorityFilter === "Low" ? "Thấp" : priorityFilter === "Medium" ? "Trung bình" : "Cao"}
              </span>
            )}
            <button
              onClick={() => {
                setSearchText("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Task Grid */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <p className="text-gray-600 font-semibold text-lg mb-2">
            {searchText || statusFilter || priorityFilter
              ? "Không tìm thấy công việc phù hợp"
              : "Chưa có công việc nào"}
          </p>
          <p className="text-gray-400 text-sm">
            {searchText || statusFilter || priorityFilter
              ? "Thử thay đổi bộ lọc để xem kết quả khác"
              : "Hãy tạo công việc đầu tiên để bắt đầu!"}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 font-medium">
              Hiển thị <span className="font-bold text-gray-800">{filteredTasks.length}</span> / {tasks.length} công việc
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskItem key={task._id} task={task} onTaskUpdated={onTaskUpdated} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}