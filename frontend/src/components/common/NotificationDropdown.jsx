import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { notifications, count, isLoading } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const renderTimeBadge = (diffDays) => {
    if (diffDays < 0)
      return (
        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
          Quá hạn {Math.abs(diffDays)} ngày
        </span>
      );
    if (diffDays === 0)
      return (
        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
          Hôm nay
        </span>
      );
    if (diffDays === 1)
      return (
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          Ngày mai
        </span>
      );
    return (
      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        Còn {diffDays} ngày
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ===== Bell Button ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition
          ${
            isOpen
              ? "bg-indigo-900 text-white"
              : "text-indigo-200 hover:bg-indigo-900"
          }`}
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-indigo-950" />
        )}
      </button>

      {/* ===== Dropdown ===== */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          
          {/* Header */}
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">
              Thông báo sắp tới
            </h3>
            {count > 0 && (
              <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Đang tải...</p>
              </div>
            ) : count === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Không có việc gấp
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mọi thứ đang đúng tiến độ.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      navigate(item.link);
                      setIsOpen(false);
                    }}
                    className="p-4 cursor-pointer hover:bg-indigo-50 transition flex gap-3"
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 ${
                        item.type === "project"
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.type === "project" ? (
                        <FolderKanban size={18} />
                      ) : (
                        <ListTodo size={18} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {item.title}
                        </p>
                        {renderTimeBadge(item.diffDays)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-medium text-slate-500 border border-slate-200 px-1.5 rounded">
                          {item.type === "project" ? "Dự án" : "Công việc"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={10} />
                          {format(new Date(item.date), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="p-2 border-t bg-slate-50 text-center">
              <button className="text-xs font-medium text-indigo-600 hover:underline">
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
