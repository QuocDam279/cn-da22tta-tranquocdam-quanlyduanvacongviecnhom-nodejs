import React, { useState } from "react";

const sampleTasks = [
  {
    id: 1,
    title: "Thiết kế giao diện",
    start_date: "2025-09-16",
    due_date: "2025-09-18",
    status: "in_progress",
  },
  {
    id: 2,
    title: "Viết tài liệu API",
    start_date: "2025-09-17",
    due_date: "2025-09-17",
    status: "todo",
  },
  {
    id: 3,
    title: "Kiểm thử hệ thống",
    start_date: "2025-09-20",
    due_date: "2025-09-22",
    status: "done",
  },
];

const months = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = [];

  let week = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) week.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    week.push(i);
    if (week.length === 7) {
      days.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    days.push(week);
  }

  const mapStatusToColor = (status) => {
    const map = {
      todo: "bg-yellow-500",
      in_progress: "bg-blue-500",
      done: "bg-pink-500",
    };
    return map[status] || "bg-gray-400";
  };

  const getTasksForDay = (day) => {
    if (!day) return [];
    const currentDate = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    return sampleTasks.filter(task => {
      return currentDate >= task.start_date && currentDate <= task.due_date;
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="px-3 py-1 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          ←
        </button>
        <div className="text-2xl font-bold text-gray-800">
          {months[currentMonth]} - {currentYear}
        </div>
        <button
          onClick={handleNextMonth}
          className="px-3 py-1 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 transition"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px border border-gray-300 rounded overflow-hidden">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="p-2 text-center font-semibold bg-gray-100 text-gray-700 uppercase text-sm tracking-wide"
          >
            {day}
          </div>
        ))}

        {days.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((day, di) => (
              <div
                key={di}
                className="border border-gray-200 h-[100px] p-1.5 text-sm bg-white hover:bg-gray-50 transition relative flex flex-col"
              >
                {day && (
                  <div className="text-xs font-semibold text-gray-600 text-right pr-1">
                    {day}
                  </div>
                )}
                <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                  {getTasksForDay(day).map((task) => (
                    <div
                      key={`${task.id}-${day}`}
                      className={`text-[11px] text-white px-1.5 py-0.5 rounded-md truncate shadow-sm ${mapStatusToColor(task.status)}`}
                      title={`${task.title} (${task.start_date} → ${task.due_date})`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}