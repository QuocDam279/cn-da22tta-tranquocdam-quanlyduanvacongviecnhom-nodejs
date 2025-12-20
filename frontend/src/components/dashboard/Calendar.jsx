import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const months = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];
const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function Calendar({ tasks = [] }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const navigate = useNavigate();

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

  const isToday = (day) => {
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const getTasksForDay = (day) => {
    if (!day || !tasks) return [];
    const currentDate = new Date(currentYear, currentMonth, day).toISOString().slice(0, 10);
    return tasks.filter(task => {
      const start = task.start_date?.slice(0, 10) || task.created_at?.slice(0, 10);
      const end = task.due_date?.slice(0, 10) || start;
      return currentDate >= start && currentDate <= end;
    });
  };

  const getStatusCounts = (dayTasks) => {
    const counts = { "To Do": 0, "In Progress": 0, "Done": 0 };
    dayTasks.forEach(task => {
      if (counts.hasOwnProperty(task.status)) {
        counts[task.status]++;
      }
    });
    return counts;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
  };

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="flex gap-4 p-6">
      {/* Calendar */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium"
          >
            ←
          </button>
          <div className="text-2xl font-bold text-gray-800">
            {months[currentMonth]} {currentYear}
          </div>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition font-medium"
          >
            →
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">Chưa thực hiện</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Đang thực hiện</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-gray-600">Đã hoàn thành</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-7">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold bg-gray-50 text-gray-700 text-sm border-b border-gray-200"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((day, di) => {
                  const dayTasks = getTasksForDay(day);
                  const statusCounts = getStatusCounts(dayTasks);
                  const totalTasks = dayTasks.length;
                  const isTodayDate = isToday(day);
                  const isSelected = selectedDay === day;

                  return (
                    <div
                      key={di}
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[90px] p-2 border-b border-r border-gray-100 
                        transition-all cursor-pointer
                        ${day ? 'hover:bg-blue-50' : 'bg-gray-50'}
                        ${isSelected ? 'bg-blue-100 ring-2 ring-blue-400' : ''}
                      `}
                    >
                      {day && (
                        <>
                          {/* Số ngày */}
                          <div className={`
                            text-sm font-semibold mb-2 flex justify-center
                            ${isTodayDate ? 'text-white' : 'text-gray-700'}
                          `}>
                            <span className={`
                              w-7 h-7 flex items-center justify-center rounded-full
                              ${isTodayDate ? 'bg-blue-600' : ''}
                            `}>
                              {day}
                            </span>
                          </div>

                          {/* Dots và Count */}
                          {totalTasks > 0 && (
                            <div className="flex flex-col items-center gap-1">
                              {/* Dots */}
                              <div className="flex gap-1 justify-center">
                                {statusCounts["To Do"] > 0 && (
                                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                )}
                                {statusCounts["In Progress"] > 0 && (
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                )}
                                {statusCounts["Done"] > 0 && (
                                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                )}
                              </div>

                              {/* Count Badge */}
                              <div className="px-2 py-0.5 bg-gray-800 text-white text-xs font-semibold rounded-full">
                                {totalTasks}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar - Task Details */}
      <div className="w-80 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        {selectedDay ? (
          <>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Ngày {selectedDay}/{currentMonth + 1}/{currentYear}
            </h3>
            
            {selectedDayTasks.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {selectedDayTasks.map((task) => {
                const statusColors = {
                  "To Do": "border-l-yellow-500 bg-yellow-50",
                  "In Progress": "border-l-blue-500 bg-blue-50",
                  "Done": "border-l-pink-500 bg-pink-50",
                };
                const dotColors = {
                  "To Do": "bg-yellow-500",
                  "In Progress": "bg-blue-500",
                  "Done": "bg-pink-500",
                };
                const statusText = {
                  "To Do": "Chưa thực hiện",
                  "In Progress": "Đang thực hiện",
                  "Done": "Đã hoàn thành",
                };

                return (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/congviec/${task._id}`)}
                    className={`
                      p-3 rounded-lg border-l-4 cursor-pointer 
                      ${statusColors[task.status]} 
                      transition-transform hover:shadow
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full ${dotColors[task.status]} mt-1.5 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">
                          {task.task_name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {task.start_date?.slice(0, 10)} → {task.due_date?.slice(0, 10)}
                        </div>
                        <div className="text-xs font-medium text-gray-500 mt-1">
                          {statusText[task.status]}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Không có công việc nào trong ngày này
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Chọn một ngày để các công việc
          </div>
        )}
      </div>
    </div>
  );
}