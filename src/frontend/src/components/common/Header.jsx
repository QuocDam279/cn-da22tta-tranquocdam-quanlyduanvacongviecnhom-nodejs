import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, Settings, LogOut, LayoutDashboard } from "lucide-react";

import { useProfile } from "../../hooks/useProfile";
import { useLogout } from "../../hooks/useAuthMutations"; // ✅ FIX: Import từ useAuthMutations
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearch from "../common/GlobalSearch";
import UserAvatar from "../common/UserAvatar";

export default function Header() {
  const navigate = useNavigate();
  const [openAvatar, setOpenAvatar] = useState(false);
  const avatarRef = useRef(null);

  const { data: profileData } = useProfile();
  const user = profileData?.user;
  const { mutate: logout, isPending: isLoggingOut } = useLogout(); // ✅ Thêm isPending

  // Đóng dropdown user khi click ra ngoài
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
    logout(); // Hook tự động navigate về /login
  };

  const menuItems = [
    { name: "Tổng quan", path: "/tongquan", icon: <LayoutDashboard size={18} /> },
    { name: "Nhóm dự án", path: "/nhom", icon: <Users size={18} /> },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-indigo-950 border-b border-indigo-900 z-40 shadow-sm">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* ===== LEFT: Logo & Nav ===== */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => navigate("/tongquan")}
            className="cursor-pointer flex items-center gap-2 group"
          >
            <span className="hidden md:block text-lg font-bold text-white tracking-tight">
              Quản lý công việc
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-indigo-800/80 text-white shadow-inner"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ===== CENTER: Search Component ===== */}
        <div className="flex-1 max-w-md hidden md:block">
           <GlobalSearch />
        </div>

        {/* ===== RIGHT: Actions ===== */}
        <div className="flex items-center gap-3 md:gap-4">
          <NotificationDropdown />

          {/* User Dropdown */}
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => setOpenAvatar(!openAvatar)}
              className="flex items-center gap-2 rounded-full hover:bg-white/5 p-1 pr-2 transition border border-transparent hover:border-indigo-800"
            >
              <UserAvatar
                user={user}
                className="w-8 h-8 md:w-9 md:h-9 border-2 border-indigo-400 rounded-full"
              />
              <span className="hidden lg:block text-sm font-medium text-indigo-100 max-w-[100px] truncate">
                {user?.full_name || "User"}
              </span>
            </button>

            {openAvatar && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                <div className="px-5 py-4 bg-slate-50 border-b">
                  <p className="font-bold text-slate-800 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { 
                      setOpenAvatar(false); 
                      navigate("/profile"); 
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg w-full transition"
                  >
                    <Settings size={16} />
                    Cài đặt tài khoản
                  </button>
                  <div className="border-t my-1 mx-2"></div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut} // ✅ Disable khi đang logout
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        Đang đăng xuất...
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        Đăng xuất
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}