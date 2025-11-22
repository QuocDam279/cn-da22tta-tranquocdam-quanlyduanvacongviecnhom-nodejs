// src/components/team/TeamDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TeamInfo from "../components/team/TeamInfo";
import TeamMembers from "../components/team/TeamMembers";
import TeamActions from "../components/team/TeamActions";
import { getTeamById } from "../services/teamService";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const fetchTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeamById(id);
      console.log('API Response:', data);
      
      // Xác định role dựa trên created_by
      const userId = localStorage.getItem("userId");
      const userRole = data.team.created_by === userId ? "leader" : "member";
      
      // Thêm currentUserRole vào data
      data.currentUserRole = userRole;
      
      console.log('Current User Role:', userRole);
      setTeam(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải chi tiết nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const handleMembersUpdated = (newMembers) => {
    setTeam((prev) => ({ ...prev, members: newMembers }));
  };

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          {loading ? (
            <p>Đang tải chi tiết nhóm...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : team ? (
            <>
              <TeamInfo team={team.team} members={team.members} />

              <TeamActions
                teamId={team.team._id}
                teamData={team.team}
                currentUserRole={team.currentUserRole} // leader hoặc member
                onUpdated={(updatedTeam) =>
                  setTeam((prev) => ({ ...prev, team: updatedTeam }))
                }
                onDeleted={() => navigate("/nhom")}
              />

              <h3 className="text-xl font-semibold mb-2">Danh sách thành viên</h3>
              <TeamMembers
                teamId={team.team._id}
                members={team.members}
                currentUserId={localStorage.getItem("userId")}
                currentUserRole={team.currentUserRole}
                onMembersUpdated={handleMembersUpdated}
              />
            </>
          ) : (
            <p>Không tìm thấy nhóm</p>
          )}
        </div>
      </div>
    </div>
  );
}
