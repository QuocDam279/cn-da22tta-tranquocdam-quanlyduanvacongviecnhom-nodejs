import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import TeamInfo from "../components/team/TeamInfo";
import TeamMembers from "../components/team/TeamMembers";
import ProjectList from "../components/project/ProjectList";
import CreateProjectButton from "../components/project/CreateProjectButton";
import { ArrowLeft } from "lucide-react";

// Import hooks
import { useTeamDetail } from "../hooks/useTeams";
import { useProjectsByTeam } from "../hooks/useProjects";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects"); // ✅ Thay từ "members" → "projects"
  
  const userId = localStorage.getItem("userId");

  // ✅ Sử dụng React Query hooks
  const {
    data: teamData,
    isLoading: loadingTeam,
    error: teamError,
  } = useTeamDetail(id);

  const {
    data: projects = [],
    isLoading: loadingProjects,
    error: projectError,
  } = useProjectsByTeam(teamData?.team?._id);

  // Xác định role của user hiện tại
  const currentUserRole = useMemo(() => {
    if (!teamData?.team) return "member";
    return teamData.team.created_by === userId ? "leader" : "member";
  }, [teamData?.team, userId]);

  // Combine teamData với role
  const team = useMemo(() => {
    if (!teamData) return null;
    return {
      ...teamData,
      currentUserRole,
    };
  }, [teamData, currentUserRole]);

  const TABS = [
    { key: "projects", label: "Dự án" },
    { key: "members", label: "Thành viên" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Loading state */}
        {loadingTeam ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-medium">Đang tải chi tiết nhóm...</p>
              </div>
            </div>
          </div>
        ) : teamError ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 font-medium">
                  {teamError.message || "Lỗi khi tải chi tiết nhóm"}
                </p>
                <p className="text-gray-500 text-sm">Vui lòng thử lại sau</p>
              </div>
            </div>
          </div>
        ) : team ? (
          <>
            {/* Breadcrumb */}
            <Link
              to="/nhom"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Quay lại danh sách nhóm</span>
            </Link>

            {/* TeamInfo Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              <TeamInfo
                team={team.team}
                members={team.members}
                currentUserRole={team.currentUserRole}
                onUpdated={() => {
                  // React Query sẽ tự động refetch
                }}
                onDeleted={() => navigate("/nhom")}
              />
            </div>

            {/* Tabs Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white overflow-x-auto">
                {TABS.map((tab, index) => (
                  <React.Fragment key={tab.key}>
                    <button
                      onClick={() => setActiveTab(tab.key)}
                      className={`relative px-6 py-4 text-sm font-semibold transition-all duration-300 whitespace-nowrap
                        ${
                          activeTab === tab.key
                            ? "text-blue-600"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                      )}
                    </button>
                    {index < TABS.length - 1 && (
                      <div className="w-px bg-gray-200 my-3"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 lg:p-8">
                {activeTab === "projects" && (
                  <div className="space-y-6 animate-fade-in">
                    {team.currentUserRole === "leader" && (
                      <CreateProjectButton
                        teamId={team.team._id}
                        onCreated={() => {
                          // React Query sẽ tự động refetch
                        }}
                      />
                    )}
                    
                    {loadingProjects ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="text-center space-y-3">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-500 font-medium">Đang tải dự án...</p>
                        </div>
                      </div>
                    ) : projectError ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-3xl">⚠️</span>
                          </div>
                          <p className="text-red-600 font-medium">
                            {projectError.message || "Lỗi khi tải dự án"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ProjectList
                        projects={projects}
                        loading={false}
                        error=""
                      />
                    )}
                  </div>
                )}

                {activeTab === "members" && (
                  <div className="animate-fade-in">
                    <TeamMembers
                      teamId={team.team._id}
                      members={team.members}
                      currentUserId={userId}
                      currentUserRole={team.currentUserRole}
                      onMembersUpdated={() => {
                        // React Query sẽ tự động refetch
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex justify-center items-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-yellow-800 font-medium">Không tìm thấy nhóm</p>
                <p className="text-gray-500 text-sm">Nhóm có thể đã bị xóa hoặc bạn không có quyền truy cập</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}