import React, { useState, useMemo } from "react";
import { Zap, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import TaskItem from "./TaskItem";

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

export default function TaskList({ tasks, onTaskUpdated }) {
  const [activeView, setActiveView] = useState("all"); // all, urgent, high, deadline, done
  const [searchText, setSearchText] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [sortBy, setSortBy] = useState("deadline"); // deadline, priority, progress

  // Smart Views Configuration
  const smartViews = [
    {
      id: "all",
      label: "Tất cả",
      icon: Calendar,
      color: "blue",
      filter: () => true,
    },
    {
      id: "urgent",
      label: "Khẩn cấp",
      icon: AlertTriangle,
      color: "red",
      filter: (task) => {
        if (task.status === "Done") return false;
        const daysLeft = getDaysUntilDeadline(task.due_date);
        return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
      },
    },
    {
      id: "high",
      label: "Ưu tiên cao",
      icon: Zap,
      color: "orange",
      filter: (task) => task.priority === "High" && task.status !== "Done",
    },
    {
      id: "inprogress",
      label: "Đang làm",
      icon: TrendingUp,
      color: "purple",
      filter: (task) => task.status === "In Progress",
    },
    {
      id: "done",
      label: "Hoàn thành",
      icon: CheckCircle,
      color: "green",
      filter: (task) => task.status === "Done",
    },
  ];

  // Toggle priority filter
  const togglePriority = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  // Toggle status filter
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Filter & Sort logic
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply Smart View filter
    const currentView = smartViews.find((v) => v.id === activeView);
    if (currentView) {
      filtered = filtered.filter(currentView.filter);
    }

    // Apply search
    if (searchText) {
      filtered = filtered.filter(
        (task) =>
          task.task_name.toLowerCase().includes(searchText.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Apply priority pills
    if (selectedPriorities.length > 0) {
      filtered = filtered.filter((task) =>
        selectedPriorities.includes(task.priority)
      );
    }

    // Apply status pills
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((task) =>
        selectedStatuses.includes(task.status)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "deadline") {
        const dateA = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
        const dateB = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");
        return dateA - dateB;
      }
      if (sortBy === "priority") {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === "progress") {
        return a.progress - b.progress;
      }
      return 0;
    });

    return filtered;
  }, [tasks, activeView, searchText, selectedPriorities, selectedStatuses, sortBy]);

  // Count for each view
  const getViewCount = (viewId) => {
    const view = smartViews.find((v) => v.id === viewId);
    return view ? tasks.filter(view.filter).length : 0;
  };

  // Get color classes
  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive
        ? "bg-blue-500 text-white border-blue-600"
        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      red: isActive
        ? "bg-red-500 text-white border-red-600"
        : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
      orange: isActive
        ? "bg-orange-500 text-white border-orange-600"
        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      purple: isActive
        ? "bg-purple-500 text-white border-purple-600"
        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      green: isActive
        ? "bg-green-500 text-white border-green-600"
        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-5">
      {/* Smart Views Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
        {smartViews.map((view) => {
          const Icon = view.icon;
          const isActive = activeView === view.id;
          const count = getViewCount(view.id);

          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm whitespace-nowrap transition-all ${getColorClasses(
                view.color,
                isActive
              )} ${isActive ? "shadow-lg scale-105" : "shadow-sm"}`}
            >
              <Icon size={16} />
              <span>{view.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? "bg-white/20" : "bg-white/60"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Quick Filters + Sort */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-4 rounded-xl border border-gray-200 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm công việc..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Filter Pills + Sort */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Priority Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Ưu tiên:</span>
            {["High", "Medium", "Low"].map((priority) => (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPriorities.includes(priority)
                    ? priority === "High"
                      ? "bg-red-500 text-white shadow-md"
                      : priority === "Medium"
                      ? "bg-yellow-500 text-white shadow-md"
                      : "bg-green-500 text-white shadow-md"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {priority === "High" ? "🔥 Cao" : priority === "Medium" ? "⚡ TB" : "✓ Thấp"}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Status Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Trạng thái:</span>
            {[
              { value: "To Do", label: "📋 Chưa làm" },
              { value: "In Progress", label: "🔄 Đang làm" },
              { value: "Done", label: "✅ Xong" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleStatus(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatuses.includes(value)
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300"></div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border-2 border-gray-200 rounded-lg text-xs font-semibold bg-white hover:border-gray-300 cursor-pointer"
            >
              <option value="deadline">⏰ Deadline</option>
              <option value="priority">🔥 Ưu tiên</option>
              <option value="progress">📊 Tiến độ</option>
            </select>
          </div>

          {/* Clear All */}
          {(selectedPriorities.length > 0 || selectedStatuses.length > 0 || searchText) && (
            <button
              onClick={() => {
                setSelectedPriorities([]);
                setSelectedStatuses([]);
                setSearchText("");
              }}
              className="ml-auto px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
            >
              🗑️ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          Hiển thị <span className="font-bold text-blue-600">{filteredAndSortedTasks.length}</span> /{" "}
          {tasks.length} công việc
        </p>
      </div>

      {/* Task Grid */}
      {filteredAndSortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <p className="text-gray-600 font-semibold text-lg mb-2">
            Không tìm thấy công việc
          </p>
          <p className="text-gray-400 text-sm">
            Thử thay đổi bộ lọc hoặc chọn view khác
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskItem key={task._id} task={task} onTaskUpdated={onTaskUpdated} />
          ))}
        </div>
      )}
    </div>
  );
}