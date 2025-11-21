// Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { Bell, Search, Users, FolderKanban, ListTodo } from "lucide-react";

export default function Header({ collapsed }) {
  const [open, setOpen] = useState(false);
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

  // Chiều rộng menu dựa vào collapsed
  const sidebarWidth = collapsed ? "4rem" : "16rem"; // 16rem = 64px

  return (
    <header
      className="fixed top-0 bg-blue-200 px-4 py-2 flex items-center shadow-sm h-12 w-[calc(100%-var(--sidebar-width))] transition-all duration-300 rounded-br-lg"
      style={{ left: sidebarWidth, "--sidebar-width": sidebarWidth }}
    >
      {/* Left side: Logo */}
      <div className="flex items-center gap-3 w-32">
        <span className="text-2xl font-bold text-blue-600">QuestDo</span>
      </div>

      {/* Center: Search + Create */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        {/* Search box */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 
            text-sm w-full"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        {/* Create dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(prev => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Tạo mới
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg border p-1 z-50">
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded">
                <Users size={16} className="text-blue-600" /> Nhóm mới
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded">
                <FolderKanban size={16} className="text-green-600" /> Dự án mới
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full text-left rounded">
                <ListTodo size={16} className="text-orange-500" /> Công việc mới
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Notification + Avatar */}
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 rounded-full hover:bg-slate-100 transition-colors">
          <Bell size={16} className="text-slate-600" />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>

        <img
          src="https://i.pravatar.cc/32"
          alt="User Avatar"
          className="w-7 h-7 rounded-full border border-slate-200"
        />
      </div>
    </header>
  );
}
