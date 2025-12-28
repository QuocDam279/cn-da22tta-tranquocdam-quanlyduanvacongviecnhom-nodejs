import React, { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, FolderKanban } from "lucide-react";

// Components
import Header from "../components/common/Header";
import TeamInfo from "../components/team/TeamInfo";
import TeamMembers from "../components/team/TeamMembers";
import ProjectList from "../components/project/ProjectList";
import CreateProjectButton from "../components/project/CreateProjectButton";

// Hooks
import { useTeamDetail } from "../hooks/useTeams";
import { useProjectsByTeam } from "../hooks/useProjects";
import { useAuth } from "../hooks/useAuth"; // ✅ Reactive auth state

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth(); // ✅ Reactive userId
  const [activeTab, setActiveTab] = useState("projects");

  // ✅ API Queries
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

  // ✅ Tính toán role của user hiện tại
  const currentUserRole = useMemo(() => {
    if (!teamData?.team || !userId) return "member";
    return teamData.team.created_by === userId ? "leader" : "member";
  }, [teamData?.team, userId]);

  // ✅ Combine data với role
  const team = useMemo(() => {
    if (!teamData) return null;
    return {
      ...teamData,
      currentUserRole,
    };
  }, [teamData, currentUserRole]);

  // ✅ Tab configuration
  const TABS = useMemo(() => [
    { 
      key: "projects", 
      label: "Dự án",
      icon: FolderKanban,
      count: projects.length 
    },
    { 
      key: "members", 
      label: "Thành viên",
      icon: Users,
      count: teamData?.members?.length || 0
    },
  ], [projects.length, teamData?.members?.length]);

  // ✅ Loading State Component
  if (loadingTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Đang tải thông tin nhóm...</p>
              <p className="text-gray-400 text-sm">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Error State Component
  if (teamError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-red-700">Không thể tải thông tin nhóm</h3>
              <p className="text-red-600 text-center max-w-md">
                {teamError.message || "Đã xảy ra lỗi khi tải dữ liệu"}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Thử lại
                </button>
                <Link
                  to="/nhom"
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Quay về danh sách
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Not Found State
  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <Header />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-yellow-200 shadow-lg p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-bold text-yellow-800">Không tìm thấy nhóm</h3>
              <p className="text-gray-600 text-center max-w-md">
                Nhóm có thể đã bị xóa hoặc bạn không có quyền truy cập
              </p>
              <Link
                to="/nhom"
                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Về danh sách nhóm
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Main Content
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Link
          to="/nhom"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <ArrowLeft 
            size={18} 
            className="group-hover:-translate-x-1 transition-transform duration-200" 
          />
          <span className="font-medium">Quay lại danh sách nhóm</span>
        </Link>

        {/* Team Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
          <TeamInfo
            team={team.team}
            members={team.members}
            currentUserRole={team.currentUserRole}
            onDeleted={() => navigate("/nhom")}
          />
        </div>

        {/* Tabs Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <React.Fragment key={tab.key}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      relative flex items-center gap-2 px-6 py-4 text-sm font-semibold 
                      transition-all duration-300 whitespace-nowrap flex-1 justify-center
                      ${activeTab === tab.key
                        ? "text-blue-600 bg-blue-50/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${activeTab === tab.key
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }
                    `}>
                      {tab.count}
                    </span>
                    {activeTab === tab.key && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-full"></div>
                    )}
                  </button>
                  {index < TABS.length - 1 && (
                    <div className="w-px bg-gray-200 my-3"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-fade-in">
                {/* Create Project Button - Only for leaders */}
                {team.currentUserRole === "leader" && (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Danh sách dự án</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Quản lý tất cả dự án của nhóm
                      </p>
                    </div>
                    <CreateProjectButton teamId={team.team._id} />
                  </div>
                )}

                {/* Projects List */}
                {loadingProjects ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Đang tải danh sách dự án...</p>
                  </div>
                ) : projectError ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-red-600 font-medium text-center">
                      {projectError.message || "Không thể tải danh sách dự án"}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <ProjectList projects={projects} />
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Thành viên nhóm</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Quản lý danh sách thành viên và phân quyền
                  </p>
                </div>
                <TeamMembers
                  teamId={team.team._id}
                  members={team.members}
                  currentUserId={userId}
                  currentUserRole={team.currentUserRole}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Custom Animations */}
      <style>{`
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