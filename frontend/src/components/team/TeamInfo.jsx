// TeamInfo.jsx
import React from "react";

export default function TeamInfo({ team, members }) {
  return (
    <div className="border rounded-xl p-4 mb-6">
      <h2 className="text-2xl font-semibold mb-2 capitalize">{team.team_name}</h2>
      <p className="text-gray-600">{team.description || "Chưa có mô tả"}</p>
      <p className="text-gray-500 text-sm mt-1">
        {members?.length || 0} thành viên
      </p>
    </div>
  );
}
