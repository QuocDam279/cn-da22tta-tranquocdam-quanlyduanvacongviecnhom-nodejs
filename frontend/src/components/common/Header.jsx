import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  Settings,
  LogOut,
  LayoutDashboard
} from "lucide-react";

import { useProfile } from "../../hooks/useProfile";
import { useLogout } from "../../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearch from "./GlobalSearch";
// 👇 Import component dùng chung
import UserAvatar from "../common/UserAvatar";

export default function Header() {
  const navigate = useNavigate();
  const { mutate: logoutMutation } = useLogout();

  const [openAvatar, setOpenAvatar] = useState(false);
  const avatarRef = useRef(null);

  const { data: profileData } = useProfile();
  const user = profileData?.user;

  // 🗑️ ĐÃ XÓA: Logic xử lý URL và fallback ở đây vì UserAvatar đã lo hết rồi

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setOpenAvatar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSuccess: () => navigate("/login"),
    });
  };

  const menuItems = [
    { name: "Tổng quan", path: "/tongquan", icon: <LayoutDashboard size={16} /> },
    { name: "Nhóm dự án", path: "/nhom", icon: <Users size={16} /> },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-indigo-950 border-b border-indigo-900 z-50">
      <div className="h-full px-6 flex items-center justify-between gap-6">

        {/* ===== LEFT ===== */}
        <div className="flex items-center gap-6">
          <span
            onClick={() => navigate("/tongquan")}
            className="cursor-pointer select-none text-lg font-extrabold text-white tracking-wide"
          >
            Quản lý công việc
          </span>

          <nav className="flex items-center gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition
                  ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "text-indigo-200 hover:bg-indigo-900 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ===== CENTER ===== */}
        <GlobalSearch />

        {/* ===== RIGHT ===== */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-9 h-9 rounded-full border border-indigo-500 flex items-center justify-center hover:bg-indigo-900 transition">
              <NotificationDropdown />
            </div>
          </div>

          <div className="relative" ref={avatarRef}>
            <button onClick={() => setOpenAvatar(!openAvatar)}>
              {/* ✅ SỬ DỤNG COMPONENT CHUNG */}
              {/* Chúng ta ghi đè className để có viền và hiệu ứng riêng cho Header */}
              <UserAvatar 
                user={user} 
                className="
                  w-9 h-9 
                  border-2 border-indigo-500 
                  ring-1 ring-indigo-900 
                  hover:ring-indigo-500 hover:scale-105 
                  transition
                "
              />
            </button>

            {openAvatar && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b bg-slate-50 rounded-t-2xl">
                  <p className="font-bold text-sm truncate text-gray-800">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-100 w-full text-gray-700 transition-colors"
                >
                  <Settings size={18} />
                  Cài đặt tài khoản
                </button>

                <div className="border-t my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full font-medium transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}