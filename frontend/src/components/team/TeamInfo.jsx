// TeamInfo.jsx
import React from "react";
import { Users, Calendar } from "lucide-react";
import TeamActions from "./TeamActions";

export default function TeamInfo({ team, members, currentUserRole, onUpdated, onDeleted }) {
  return (
    <div className="p-6 lg:p-8">
      {/* Header nhóm + actions */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-800 truncate">
                {team.team_name}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                <Users size={16} className="text-blue-500" />
                <span className="font-medium">{members?.length || 0} thành viên</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* TeamActions hiển thị nếu là leader */}
        {currentUserRole === "leader" && (
          <TeamActions
            teamId={team._id}
            teamData={team}
            currentUserRole={currentUserRole}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        )}
      </div>

      {/* Mô tả nhóm */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h3 className="font-semibold text-gray-700">Mô tả</h3>
        </div>
        <p className="text-gray-600 leading-relaxed pl-3">
          {team.description || (
            <span className="italic text-gray-400">Chưa có mô tả cho nhóm này.</span>
          )}
        </p>
      </div>

      {/* Thông tin thêm */}
      {team.created_at && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar size={16} />
            <span className="font-medium">Ngày tạo:</span>
            <span>{new Date(team.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}