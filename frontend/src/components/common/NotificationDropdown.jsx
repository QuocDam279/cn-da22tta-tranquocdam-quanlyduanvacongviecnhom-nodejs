import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, Clock, CheckCircle2, UserPlus, ClipboardList, 
  MessageSquare, AlertTriangle, Info, Trash2, Check 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNotifications } from "../../hooks/useNotifications";

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Sử dụng Hook đã tối ưu (Polling 30s, Cache thông minh)
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNoti 
  } = useNotifications();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // --- LOGIC UI ---
  const getNotificationStyle = (type) => {
    switch (type) {
      case "INVITE": return { icon: <UserPlus size={18} />, color: "bg-blue-100 text-blue-600", label: "Mời nhóm" };
      case "ASSIGN": return { icon: <ClipboardList size={18} />, color: "bg-indigo-100 text-indigo-600", label: "Giao việc" };
      case "DEADLINE": return { icon: <Clock size={18} />, color: "bg-red-100 text-red-600", label: "Hết hạn" };
      case "WARNING": return { icon: <AlertTriangle size={18} />, color: "bg-orange-100 text-orange-600", label: "Cảnh báo" };
      case "MENTION": return { icon: <MessageSquare size={18} />, color: "bg-purple-100 text-purple-600", label: "Nhắc đến" };
      case "COMMENT": return { icon: <MessageSquare size={18} />, color: "bg-teal-100 text-teal-600", label: "Bình luận" };
      case "STATUS_CHANGE": return { icon: <CheckCircle2 size={18} />, color: "bg-green-100 text-green-600", label: "Trạng thái" };
      default: return { icon: <Info size={18} />, color: "bg-slate-100 text-slate-600", label: "Thông báo" };
    }
  };

  const handleItemClick = (item) => {
    setIsOpen(false); // 1. Đóng dropdown ngay cho mượt

    // 2. Gọi API đánh dấu đọc (Fire & Forget - React Query sẽ lo update cache)
    if (!item.is_read) {
      markAsRead(item._id);
    }

    // 3. Điều hướng thông minh
    if (item.action_url) {
      navigate(item.action_url);
      return;
    }
    
    // Fallback logic
    switch (item.reference_model) {
      case 'Task': navigate(`/congviec/${item.reference_id}`); break;
      case 'Project': navigate(`/projects/${item.reference_id}`); break;
      case 'Team': navigate(`/nhom`); break;
      default: break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ===== BELL BUTTON ===== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200
          ${isOpen ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-900 hover:text-white"}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-indigo-950"></span>
          </span>
        )}
      </button>

      {/* ===== DROPDOWN PANEL ===== */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          
          {/* Header */}
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
              >
                <Check size={12} /> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3 opacity-60">
                <Bell size={32} className="text-slate-300" />
                <p className="text-sm text-slate-500">Bạn không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((item) => {
                  const style = getNotificationStyle(item.type);
                  return (
                    <div
                      key={item._id}
                      onClick={() => handleItemClick(item)}
                      className={`relative p-4 cursor-pointer transition flex gap-3 group
                        ${item.is_read ? "bg-white hover:bg-slate-50" : "bg-indigo-50/40 hover:bg-indigo-50"}`}
                    >
                      {/* Unread Indicator */}
                      {!item.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></div>
                      )}

                      {/* Icon */}
                      <div className={`p-2 rounded-lg h-fit flex-shrink-0 ${style.color}`}>
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex justify-between gap-2 mb-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                            {style.label}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                        <p className={`text-sm ${item.is_read ? 'text-slate-600' : 'text-slate-900 font-semibold'} line-clamp-2`}>
                          {item.message}
                        </p>
                      </div>

                      {/* Delete Button (Hover) */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNoti(item._id); }}
                        className="absolute bottom-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Xóa thông báo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}