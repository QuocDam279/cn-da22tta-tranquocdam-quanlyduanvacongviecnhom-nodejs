import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, ChevronDown, UserX, AlertCircle } from "lucide-react";
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

  // 1. Xử lý NGƯỜI ĐƯỢC GIAO (assigned_to) - AN TOÀN với null
  const assignedUser = useMemo(() => {
    const assignee = task.assigned_to;
    if (!assignee) return null;
    
    if (typeof assignee === 'object' && assignee._id) return assignee;
    
    if (typeof assignee === 'string') {
      const foundMember = members.find(m => m.user?._id === assignee);
      return foundMember ? foundMember.user : null;
    }
    return null;
  }, [task.assigned_to, members]);

  // 2. Xử lý NGƯỜI TẠO (created_by)
  const creatorUser = useMemo(() => {
    const creator = task.created_by;
    if (!creator) return null;
    
    if (typeof creator === 'object' && creator._id) return creator;
    
    if (typeof creator === 'string') {
      const foundMember = members.find(m => m.user?._id === creator);
      return foundMember ? foundMember.user : null;
    }
    return null;
  }, [task.created_by, members]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition("above");
      } else {
        setDropdownPosition("below");
      }
    }
  }, [open]);

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

      {/* --- NGƯỜI TẠO --- */}
      <div className="flex items-center gap-3 p-3 border rounded-xl bg-white">
        <UserAvatar 
          user={creatorUser} 
          className="w-9 h-9 rounded-full ring-1 ring-gray-200" 
        />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {creatorUser?.full_name || "Không rõ"}
          </p>
          <p className="text-xs text-gray-500">Người tạo</p>
        </div>
        <User size={16} className="text-gray-400" />
      </div>

      {/* --- NGƯỜI THỰC HIỆN --- */}
      <div ref={wrapperRef} className="relative z-50">
        <button
          ref={buttonRef}
          type="button"
          disabled={!canChangeAssignee || isUpdating}
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-colors
            ${!assignedUser ? "bg-amber-50 border-amber-200" : "bg-white"}
            ${canChangeAssignee ? "hover:border-gray-400" : "opacity-80 cursor-default"}`}
        >
          {/* 🔥 SỬA: Hiển thị icon khác khi chưa giao */}
          {assignedUser ? (
            <UserAvatar 
              user={assignedUser} 
              className="w-9 h-9 rounded-full ring-1 ring-emerald-300"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center ring-1 ring-amber-300">
              <UserX size={18} className="text-amber-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${!assignedUser ? 'text-amber-700' : ''}`}>
              {assignedUser?.full_name || "Chưa giao"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {assignedUser?.email || "Người thực hiện"}
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

        {/* 🔥 THÊM: Helper text khi chưa giao */}
        {!assignedUser && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertCircle size={12} />
            <span>Công việc chưa có người thực hiện</span>
          </div>
        )}

        {/* Dropdown */}
        {open && canChangeAssignee && !isUpdating && (
          <div
            className={`absolute w-full bg-white border rounded-xl shadow-xl max-h-60 overflow-y-auto z-50
              ${dropdownPosition === "above" ? "bottom-full mb-2" : "top-full mt-2"}`}
          >
            {/* 🔥 THÊM: Option "Gỡ giao" nếu đang có người được giao */}
            {assignedUser && (
              <button
                onClick={() => {
                  setOpen(false);
                  onUpdateAssignee(null); // ✅ Gửi null để unassign
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-50 transition-colors border-b text-red-600 font-medium"
              >
                <UserX size={16} />
                <span>Gỡ giao công việc</span>
              </button>
            )}

            {members.map((m) => (
              <button
                key={m.user._id}
                onClick={() => {
                  setOpen(false);
                  onUpdateAssignee(m.user._id);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b last:border-0"
              >
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