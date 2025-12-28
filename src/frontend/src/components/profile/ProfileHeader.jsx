import React from "react";
import UserAvatar from "../common/UserAvatar";

export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative">
          <UserAvatar 
            user={user}
            className="w-24 h-24 border-2 border-slate-200 shadow-sm bg-slate-100"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            {user?.full_name}
          </h1>
          <p className="text-slate-600 mb-3">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
            <span>Tham gia</span>
            <span>•</span>
            <span>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}