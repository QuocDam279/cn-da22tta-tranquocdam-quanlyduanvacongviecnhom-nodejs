import React, { useState, useEffect } from "react";
import AddTeamForm from "./AddTeamForm";
import HeaderTeam from "./HeaderTeam";
import ViewToggle from "./ViewToggle";
import TeamGrid from "./TeamGrid";
import TeamList from "./TeamList";
import { getMyTeams } from "../../services/teamService";

export default function DashboardTeam() {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTeams();
      setTeams(data || []);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="w-full">
      {/* Header chỉ còn nút tạo nhóm */}
      <HeaderTeam onCreate={() => setShowForm(true)} />

      {showForm && (
        <AddTeamForm
          onClose={() => setShowForm(false)}
          onCreated={() => fetchTeams()} // load lại toàn bộ danh sách từ server
        />
      )}

      {/* Đếm số nhóm nằm ngang với grid/list */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">{teams.length} nhóm</p>
        <ViewToggle view={view} setView={setView} />
      </div>

      {loading ? (
        <p className="text-gray-600">Đang tải danh sách nhóm...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : view === "grid" ? (
        <TeamGrid teams={teams} />
      ) : (
        <TeamList teams={teams} />
      )}
    </div>
  );
}
