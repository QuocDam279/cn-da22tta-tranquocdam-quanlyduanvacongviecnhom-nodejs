// src/components/team/TeamDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TeamInfo from "../components/team/TeamInfo";
import TeamMembers from "../components/team/TeamMembers";
import TeamActions from "../components/team/TeamActions";
import TabsContainer from "../components/common/TabsContainer";
import ProjectList from "../components/project/ProjectList";
import CreateProjectButton from "../components/project/CreateProjectButton";
import { getTeamById } from "../services/teamService";
import { getProjectsByTeam } from "../services/projectService";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState("");

  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'projects'

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  // ---------- Fetch team ----------
  const fetchTeam = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTeamById(id);
      const userId = localStorage.getItem("userId");
      const userRole = data.team.created_by === userId ? "leader" : "member";
      data.currentUserRole = userRole;
      setTeam(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải chi tiết nhóm");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch projects ----------
  const fetchProjects = async (teamId) => {
    setLoadingProjects(true);
    setProjectError("");
    try {
      const data = await getProjectsByTeam(teamId);
      setProjects(data);
    } catch (err) {
      setProjectError(err.message || "Lỗi khi tải danh sách dự án");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  useEffect(() => {
    if (team?.team?._id) {
      fetchProjects(team.team._id);
    }
  }, [team?.team?._id]);

  const handleMembersUpdated = (newMembers) => {
    setTeam((prev) => ({ ...prev, members: newMembers }));
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
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
                currentUserRole={team.currentUserRole}
                onUpdated={(updatedTeam) =>
                  setTeam((prev) => ({ ...prev, team: updatedTeam }))
                }
                onDeleted={() => navigate("/nhom")}
              />

              <TabsContainer
                tabs={[
                  { key: "members", label: "Thành viên" },
                  { key: "projects", label: "Dự án" },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              >
                {activeTab === "members" && (
                  <TeamMembers
                    teamId={team.team._id}
                    members={team.members}
                    currentUserId={localStorage.getItem("userId")}
                    currentUserRole={team.currentUserRole}
                    onMembersUpdated={handleMembersUpdated}
                  />
                )}

                {activeTab === "projects" && (
                  <div className="space-y-4">
                    {team.currentUserRole === "leader" && (
                      <CreateProjectButton
                        teamId={team.team._id}
                        onCreated={handleProjectCreated}
                      />
                    )}
                    <ProjectList
                      projects={projects}
                      loading={loadingProjects}
                      error={projectError}
                    />
                  </div>
                )}
              </TabsContainer>
            </>
          ) : (
            <p>Không tìm thấy nhóm</p>
          )}
        </div>
      </div>
    </div>
  );
}
