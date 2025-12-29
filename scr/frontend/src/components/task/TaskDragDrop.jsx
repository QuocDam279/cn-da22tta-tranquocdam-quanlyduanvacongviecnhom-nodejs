import React, { useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export default function TaskDragDrop({ tasks = [], onTaskUpdated, TaskItemComponent }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const columns = [
    { id: 'To Do', title: 'CHƯA THỰC HIỆN' },
    { id: 'In Progress', title: 'ĐANG THỰC HIỆN' },
    { id: 'Done', title: 'ĐÃ HOÀN THÀNH' }
  ];

  // Check quá hạn
  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'Done') return false;
    return new Date(task.due_date) < new Date();
  };

  const getDaysOverdue = (task) => {
    if (!task.due_date) return 0;
    const diff = new Date() - new Date(task.due_date);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Lọc theo status + sort
  const getTasksByStatus = (status) => {
    const filtered = safeTasks.filter(task => task.status === status);

    return filtered.sort((a, b) => {
      const aOverdue = isOverdue(a);
      const bOverdue = isOverdue(b);

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      if (a.due_date && b.due_date) {
        return new Date(a.due_date) - new Date(b.due_date);
      }

      return 0;
    });
  };

  const getOverdueCount = (status) => {
    return safeTasks.filter(task => task.status === status && isOverdue(task)).length;
  };

  // Drag handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId) => setDragOverColumn(columnId);
  const handleDragLeave = () => setDragOverColumn(null);

  // Drop - Tính toán logic và gọi callback từ parent
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) return;

    const oldStatus = draggedTask.status;
    let newProgress = draggedTask.progress || 0;

    // ✅ Logic đồng bộ Status ↔ Progress
    if (newStatus === 'Done') {
      newProgress = 100;
    } else if (newStatus === 'To Do') {
      newProgress = 0;
    } else if (newStatus === 'In Progress') {
      // ✅ Chuyển sang "Đang thực hiện"
      if (oldStatus === 'Done') {
        newProgress = 99; // Từ Done → In Progress = 99%
      } else if (oldStatus === 'To Do') {
        newProgress = 1;  // Từ To Do → In Progress = 1%
      }
      // Nếu đã đang In Progress thì giữ nguyên
    }

    console.log("🎯 [DragDrop] Preparing update:", {
      taskId: draggedTask._id,
      oldStatus,
      newStatus,
      oldProgress: draggedTask.progress,
      newProgress
    });

    // Gọi callback từ parent để parent xử lý việc gọi hook
    if (onTaskUpdated) {
      await onTaskUpdated(draggedTask._id, {
        status: newStatus,
        progress: newProgress
      });
    }

    setDraggedTask(null);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-3 gap-4">

        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          const overdueCount = getOverdueCount(column.id);
          const isDropTarget = dragOverColumn === column.id && draggedTask?.status !== column.id;

          return (
            <div key={column.id} className="flex flex-col">

              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-gray-600 tracking-wide">
                    {column.title}
                  </h3>

                  {overdueCount > 0 && (
                    <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-medium">{overdueCount}</span>
                    </div>
                  )}
                </div>

                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {columnTasks.length}
                </span>
              </div>

              {/* Body */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`flex-1 min-h-[600px] rounded-lg transition-all p-2 ${
                  isDropTarget
                    ? 'bg-blue-50 border-2 border-dashed border-blue-400'
                    : 'bg-gray-50'
                }`}
              >
                <div className="space-y-3">

                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                      <span>Trống</span>
                    </div>
                  ) : (
                    columnTasks.map(task => {
                      const overdue = isOverdue(task);
                      const days = overdue ? getDaysOverdue(task) : 0;

                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onDragEnd={handleDragEnd}
                          className="cursor-grab active:cursor-grabbing relative"
                        >
                          {overdue && (
                            <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-[9px] font-bold shadow-lg flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Quá hạn {days} ngày</span>
                            </div>
                          )}

                          <TaskItemComponent
                            task={task}
                            onTaskUpdated={onTaskUpdated}
                            hideStatus={true}
                          />
                        </div>
                      );
                    })
                  )}

                </div>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}