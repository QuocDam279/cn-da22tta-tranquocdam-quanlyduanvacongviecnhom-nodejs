import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, User } from "lucide-react";

export default function TeamGrid({ teams }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <div
          key={team._id}
          className="border rounded-xl p-4 flex items-start gap-4 hover:shadow transition cursor-pointer"
          onClick={() => navigate(`/nhom/${team._id}`)}
        >
          <div className="bg-purple-400 p-3 rounded-lg text-white flex-shrink-0">
            <Users size={24} />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-lg capitalize">{team.team_name}</p>
            <p className="text-gray-500 text-sm">{team.memberCount} thành viên</p>
          </div>

          <User className="text-gray-700" />
        </div>
      ))}
    </div>
  );
}
