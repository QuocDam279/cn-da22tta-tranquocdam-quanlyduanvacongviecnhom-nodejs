// Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Users, FolderKanban, ListTodo, Star } from "lucide-react";

export default function Header({ collapsed }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // ví dụ số thông báo
  const dropdownRef = useRef(null);

  // Click ngoài dropdown sẽ đóng menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  return (
    <header
      className="fixed top-0 bg-white px-4 py-2 flex items-center h-14 w-[calc(100%-var(--sidebar-width))] transition-all duration-300 z-50 rounded-br-2xl border-b border-slate-200"
      style={{ left: sidebarWidth, "--sidebar-width": sidebarWidth }}
    >
      {/* Left: Logo + Star animation */}
      <div className="flex items-center gap-3 w-40">
        <span className="text-2xl font-bold text-blue-600 flex items-center gap-1">
          QuestDo
          <Star className="text-yellow-400 animate-bounce" size={18} />
        </span>
      </div>

      {/* Center: Search + Create */}
      <div className="flex items-center gap-3 flex-1 justify-center relative">
        {/* Search */}
        <div className="relative w-full max-w-md group">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 
            focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 
            text-sm w-full transition-shadow duration-200 group-hover:shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
        </div>

        {/* Create dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full hover:scale-105 transform transition-all shadow-sm"
          >
            Tạo mới
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-sm rounded-2xl border p-1 z-50">
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded-xl transition">
                <Users size={16} className="text-blue-600" /> Nhóm mới
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded-xl transition">
                <FolderKanban size={16} className="text-green-600" /> Dự án mới
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded-xl transition">
                <ListTodo size={16} className="text-orange-500" /> Công việc mới
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Notification + Avatar */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-600" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </button>

        {/* Avatar with subtle glow */}
        <div className="relative group">
          <img
            src="https://i.pravatar.cc/32"
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-slate-200 transition-all group-hover:scale-105 group-hover:shadow-sm"
          />
          <span className="absolute inset-0 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.25)] opacity-0 group-hover:opacity-100 transition-all"></span>
        </div>
      </div>

      {/* Bottom subtle border */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-sm rounded-t-full"></div>
    </header>
  );
}
