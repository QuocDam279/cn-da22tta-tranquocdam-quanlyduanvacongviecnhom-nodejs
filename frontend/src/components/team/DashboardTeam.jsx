import React, { useState } from "react";
import { Users, Grid, List, MoreVertical, User } from "lucide-react";
import AddTeamForm from "./AddTeamForm";

export default function DashboardTeam() {
  const [view, setView] = useState("grid");
  const [showForm, setShowForm] = useState(false);

  const teams = [
    {
      id: 1,
      name: "nhóm thiết kế figma",
      members: 1,
      color: "bg-purple-400",
    },
    {
      id: 2,
      name: "thiết kế backend",
      members: 1,
      color: "bg-purple-400",
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mr-4">
        <h2 className="text-2xl font-semibold">Nhóm</h2>
        <button onClick={() => setShowForm(true)} className="px-3 py-0.5 border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition">
            Tạo nhóm
        </button>
        {showForm && <AddTeamForm onClose={() => setShowForm(false)} />}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b pb-2 mb-4 text-gray-600">
        <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">Tất cả các nhóm</button>
        <button className="hover:text-black transition">Nhóm của bạn</button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm nhóm"
          className="flex-1 px-4 py-2 border rounded-lg"
        />

        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <User size={18} /> Thành viên nhóm
        </button>
      </div>

      {/* View mode */}
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => setView("grid")} 
          className={`p-2 border rounded ${view === "grid" ? "border-blue-600" : ""}`}
        >
          <Grid size={18} />
        </button>

        <button
          onClick={() => setView("list")}
          className={`p-2 border rounded ${view === "list" ? "border-blue-600" : ""}`}
        >
          <List size={18} />
        </button>

      </div>

      {/* Teams */}
      <p className="text-gray-600 mb-3">{teams.length} nhóm</p>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border rounded-xl p-4 flex items-start gap-4 hover:shadow transition"
            >
              <div className={`${team.color} p-3 rounded-lg text-white`}>
                <Users />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-lg capitalize">{team.name}</p>
                <p className="text-gray-500 text-sm">{team.members} thành viên</p>
              </div>

              <User className="text-gray-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border rounded-xl p-4 flex items-center justify-between hover:shadow transition"
            >
              <div className="flex items-center gap-4">
                <div className={`${team.color} p-3 rounded-lg text-white`}>
                  <Users />
                </div>
                <div>
                  <p className="font-semibold text-lg capitalize">{team.name}</p>
                  <p className="text-gray-500 text-sm">{team.members} thành viên</p>
                </div>
              </div>

              <User className="text-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}