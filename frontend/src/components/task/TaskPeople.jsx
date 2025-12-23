import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
// 👇 Import component chung
import UserAvatar from "../common/UserAvatar";

export default function TaskPeople({
  task,
  members = [],
  onUpdateAssignee,
  canChangeAssignee,
  isUpdating,
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("below");
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  // 🗑️ ĐÃ XÓA: getAvatarUrl (UserAvatar tự lo rồi)

  // 🎯 Tính toán vị trí dropdown (trên/dưới)
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // max-h-60 ~ 240px

      // Nếu không đủ chỗ bên dưới nhưng có chỗ bên trên → hiển thị lên trên
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition("above");
      } else {
        setDropdownPosition("below");
      }
    }
  }, [open]);

  // ⛔ Click outside → đóng
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase">
        Người liên quan
      </h4>

      {/* Người tạo */}
      <div className="flex items-center gap-3 p-3 border rounded-xl bg-white">
        {/* ✅ SỬ DỤNG USER AVATAR */}
        <UserAvatar 
          user={task.created_by} 
          className="w-9 h-9 rounded-full ring-1 ring-gray-200" 
        />
        
        <div className="flex-1">
          <p className="text-sm font-medium">{task.created_by?.full_name}</p>
          <p className="text-xs text-gray-500">Người tạo</p>
        </div>
        <User size={16} className="text-gray-400" />
      </div>

      {/* Người thực hiện */}
      <div ref={wrapperRef} className="relative z-50">
        <button
          ref={buttonRef}
          type="button"
          disabled={!canChangeAssignee || isUpdating}
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center gap-3 p-3 border rounded-xl bg-white text-left transition-colors
            ${canChangeAssignee ? "hover:border-gray-400" : "opacity-80 cursor-default"}`}
        >
          {/* ✅ SỬ DỤNG USER AVATAR */}
          <UserAvatar 
            user={task.assigned_to} 
            className="w-9 h-9 rounded-full ring-1 ring-emerald-300"
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {task.assigned_to?.full_name || "Chưa giao"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {task.assigned_to?.email || "Người thực hiện"}
            </p>
          </div>

          {isUpdating ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            canChangeAssignee && (
              <ChevronDown
                size={16}
                className={`text-gray-400 transition ${open ? "rotate-180" : ""}`}
              />
            )
          )}
        </button>

        {/* 🔽 DROPDOWN PANEL */}
        {open && canChangeAssignee && !isUpdating && (
          <div
            className={`absolute w-full bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50
              ${dropdownPosition === "above" ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            {members.map((m) => (
              <button
                key={m.user._id}
                onClick={() => {
                  setOpen(false);
                  onUpdateAssignee(m.user._id);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b last:border-0"
              >
                {/* ✅ SỬ DỤNG USER AVATAR */}
                <UserAvatar 
                  user={m.user} 
                  className="w-7 h-7 rounded-full ring-1 ring-gray-100" 
                />
                
                <div className="min-w-0 text-left">
                  <p className="font-medium truncate text-gray-700">
                    {m.user.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {m.user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}