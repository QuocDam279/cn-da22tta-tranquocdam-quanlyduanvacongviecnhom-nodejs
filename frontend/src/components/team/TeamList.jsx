import { useNavigate } from "react-router-dom";
import { Users, User } from "lucide-react";

export default function TeamList({ teams }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {teams.map(team => (
        <div
          key={team._id}
          className="border rounded-xl p-4 flex items-center justify-between hover:shadow transition cursor-pointer"
          onClick={() => navigate(`/nhom/${team._id}`)}
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-400 p-3 rounded-lg text-white"><Users /></div>
            <div>
              <p className="font-semibold text-lg capitalize">{team.team_name}</p>
              <p className="text-gray-500 text-sm">{team.memberCount} thành viên</p>
            </div>
          </div>
          <User className="text-gray-700" />
        </div>
      ))}
    </div>
  );
}
