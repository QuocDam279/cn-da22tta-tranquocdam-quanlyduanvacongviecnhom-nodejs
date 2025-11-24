// src/components/team/DashboardTeam.jsx
import React, { useState, useEffect, useMemo } from "react";
import { HeaderTeam } from "./HeaderTeam"; // ✅ vẫn dùng HeaderTeam nhưng bỏ nút member
import AddTeamForm from "./AddTeamForm";
import ViewToggle from "./ViewToggle";
import TeamGrid from "./TeamGrid";
import TeamList from "./TeamList";
import { getMyTeams, getLeaderTeams } from "../../services/teamService";

export default function DashboardTeam() {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);

  const [activeTab, setActiveTab] = useState("all"); // all | mine
  const [teams, setTeams] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Hàm bỏ dấu tiếng Việt và lowercase
  const removeVietnameseTone = (str) =>
    str
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  // 🔹 Load tất cả team user tham gia
  const fetchAllTeams = async () => {
    try {
      setLoading(true);
      const data = await getMyTeams();
      setTeams(data || []);
      setError("");
    } catch (err) {
      setError("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load team user là leader
  const fetchLeaderTeams = async () => {
    try {
      setLoading(true);
      const data = await getLeaderTeams();
      setTeams(data || []);
      setError("");
    } catch (err) {
      setError("Không thể tải nhóm của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    activeTab === "all" ? fetchAllTeams() : fetchLeaderTeams();
  }, [activeTab]);

  // 🔹 Filter teams chỉ theo tên + mô tả
  const filteredTeams = useMemo(() => {
    if (!searchValue.trim()) return teams;
    const query = removeVietnameseTone(searchValue.trim());
    return teams.filter((team) => {
      const name = removeVietnameseTone(team.team_name);
      const desc = removeVietnameseTone(team.description || "");
      return name.includes(query) || desc.includes(query);
    });
  }, [teams, searchValue]);

  return (
    <div className="w-full">
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
          onCreated={() =>
            activeTab === "all" ? fetchAllTeams() : fetchLeaderTeams()
          }
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b pb-2 mb-4 text-gray-600">
        <button
          className={`pb-1 ${
            activeTab === "all"
              ? "text-blue-600 font-medium border-b-2 border-blue-600"
              : "hover:text-black"
          }`}
          onClick={() => setActiveTab("all")}
        >
          Tất cả các nhóm
        </button>

        <button
          className={`pb-1 ${
            activeTab === "mine"
              ? "text-blue-600 font-medium border-b-2 border-blue-600"
              : "hover:text-black"
          }`}
          onClick={() => setActiveTab("mine")}
        >
          Nhóm của bạn
        </button>
      </div>

      {/* Count + view toggle */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{filteredTeams.length} nhóm</p>
        <ViewToggle view={view} setView={setView} />
      </div>

      {/* Render */}
      {loading ? (
        <p className="text-gray-600">Đang tải danh sách nhóm...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : view === "grid" ? (
        <TeamGrid teams={filteredTeams} />
      ) : (
        <TeamList teams={filteredTeams} />
      )}
    </div>
  );
}
