// src/components/team/DashboardTeam.jsx
import React, { useState, useMemo } from "react";
import { HeaderTeam } from "./HeaderTeam";
import AddTeamForm from "./AddTeamForm";
import ViewToggle from "./ViewToggle";
import TeamGrid from "./TeamGrid";
import TeamList from "./TeamList";
import { useMyTeams, useLeaderTeams } from "../../hooks/useTeams";

export default function DashboardTeam() {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all | mine
  const [searchValue, setSearchValue] = useState("");

  // 🔹 Bỏ dấu tiếng Việt
  const removeVietnameseTone = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  // 🔹 Lấy dữ liệu từ hooks
  const {
    data: allTeams = [],
    isLoading: loadingAll,
    isError: errorAll,
  } = useMyTeams();

  const {
    data: leaderTeams = [],
    isLoading: loadingLeader,
    isError: errorLeader,
  } = useLeaderTeams();

  // 🔹 Chọn data theo tab
  const teams = activeTab === "all" ? allTeams : leaderTeams;
  const loading = activeTab === "all" ? loadingAll : loadingLeader;
  const error = activeTab === "all" ? errorAll : errorLeader;

  // 🔹 Filter team theo tên + mô tả
  const filteredTeams = useMemo(() => {
    const query = removeVietnameseTone(searchValue.trim());
    if (!query) return teams;

    return teams.filter((team) => {
      const name = removeVietnameseTone(team.team_name);
      const desc = removeVietnameseTone(team.description || "");
      return name.includes(query) || desc.includes(query);
    });
  }, [teams, searchValue]);

  const TABS = [
    { key: "all", label: "Tất cả các nhóm" },
    { key: "mine", label: "Nhóm của bạn" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + search */}
      <HeaderTeam
        onCreate={() => setShowForm(true)}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />

      {/* Form tạo nhóm */}
      {showForm && (
        <AddTeamForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
          }}
        />
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden animate-fade-in">
        {/* Tabs Navigation */}
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

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          {/* Count + View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <p className="text-gray-700 font-medium">
                <span className="text-blue-600 font-bold">{filteredTeams.length}</span> nhóm
              </p>
            </div>
            <ViewToggle view={view} setView={setView} />
          </div>

          {/* Render Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-medium">Đang tải danh sách nhóm...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-red-600 font-medium">Không thể tải danh sách nhóm</p>
                <p className="text-gray-500 text-sm">Vui lòng thử lại sau</p>
              </div>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-gray-500 font-medium">Không có nhóm nào phù hợp</p>
                {searchValue && (
                  <p className="text-gray-400 text-sm">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                )}
              </div>
            </div>
          ) : view === "grid" ? (
            <div className="animate-fade-in">
              <TeamGrid teams={filteredTeams} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <TeamList teams={filteredTeams} />
            </div>
          )}
        </div>
      </div>

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