// TeamInfo.jsx
import React from "react";
import { Users } from "lucide-react";

export default function TeamInfo({ team, members }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 transition-transform hover:scale-102">
      {/* Tên nhóm */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">{team.team_name}</h2>
        <div className="flex items-center gap-1 text-gray-800 text-sm">
          <Users size={18} />
          <span>{members?.length || 0} thành viên</span>
        </div>
      </div>

      {/* Mô tả nhóm */}
      <div className="text-gray-600 text-sm leading-relaxed mb-4">
        {team.description || (
          <span className="italic text-gray-400">Chưa có mô tả cho nhóm này.</span>
        )}
      </div>

      {/* Thông tin thêm */}
      <div className="flex gap-4 mt-2 text-gray-500 text-sm">
        {team.created_at && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Ngày tạo:</span> {new Date(team.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
