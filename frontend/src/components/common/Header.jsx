// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Users,
  FolderKanban,
  ListTodo,
  Star,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { useProfile } from "../../hooks/useProfile";
import { logout } from "../../services/authService";

export default function Header() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [notifications] = useState(3);

  const dropdownRef = useRef(null);
  const avatarMenuRef = useRef(null);

  const { data: profileData } = useProfile();
  const user = profileData?.user;

  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_API_URL}${user.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.full_name || "User"
      )}&background=3b82f6&color=fff`;

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Tổng quan",
      path: "/tongquan",
      icon: <LayoutDashboard size={16} />,
    },
    {
      name: "Nhóm dự án",
      path: "/nhom",
      icon: <Users size={16} />,
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-white border-b border-slate-200 z-50">
      <div className="h-full px-6 flex items-center justify-between gap-6">
        {/* ===== LEFT: Logo + Menu ===== */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <span className="text-xl font-bold text-blue-600 flex items-center gap-1">
            QuestDo
            <Star className="text-yellow-400 animate-bounce" size={16} />
          </span>

          {/* Menu */}
          <nav className="flex items-center gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ===== CENTER: Search + Create ===== */}
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
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
            />
          </div>

          {/* Create dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 
              text-white text-sm rounded-full hover:scale-105 transition shadow-sm"
            >
              Tạo mới
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-2xl border p-1 z-50">
                <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full rounded-xl">
                  <Users size={16} className="text-blue-600" /> Nhóm mới
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full rounded-xl">
                  <FolderKanban size={16} className="text-green-600" /> Dự án mới
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 w-full rounded-xl">
                  <ListTodo size={16} className="text-orange-500" /> Công việc mới
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT: Notification + Avatar ===== */}
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-slate-100">
            <Bell size={18} className="text-slate-600" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Avatar */}
          <div className="relative" ref={avatarMenuRef}>
            <button onClick={() => setAvatarMenuOpen((p) => !p)}>
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-slate-200 object-cover hover:scale-105 transition"
              />
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-2xl border overflow-hidden">
                <div className="px-4 py-3 border-b bg-slate-50">
                  <p className="font-semibold text-sm truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 w-full"
                >
                  <Settings size={16} /> Cài đặt
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
