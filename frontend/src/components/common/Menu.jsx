// Menu.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListChecks,
  History,
  Menu as MenuIcon,
} from "lucide-react";

export default function Menu({ collapsed, setCollapsed }) {
  const menuItems = [
    { name: "Tổng quan", icon: <LayoutDashboard size={18} />, path: "/tongquan" },
    { name: "Nhóm dự án", icon: <Users size={18} />, path: "/nhom" },
    { name: "Dự án", icon: <FolderKanban size={18} />, path: "/duan" },
    { name: "Công việc", icon: <ListChecks size={18} />, path: "/congviec" },
    { name: "Nhật ký hoạt động", icon: <History size={18} />, path: "/assistant" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white text-slate-800 flex flex-col justify-between
        transition-all duration-300 ${collapsed ? "w-16" : "w-64"} z-50 shadow-sm`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 bg-blue-200 rounded-br-lg">
        {/* Logo */}
        {!collapsed && <span className="text-lg font-bold text-blue-600">QD</span>}
        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-100 transition"
        >
          <MenuIcon size={20} />
        </button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 flex flex-col gap-2 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            title={collapsed ? item.name : ""}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:shadow-sm"
              }`
            }
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </div>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 text-sm text-slate-400 border-t flex items-center justify-center gap-2">
        <span className="w-6 h-[1px] bg-blue-200 rounded-full"></span>
        {!collapsed && "© 2025 QuestDo"}
        <span className="w-6 h-[1px] bg-blue-200 rounded-full"></span>
      </div>
    </aside>
  );
}
