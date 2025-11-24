// src/components/team/HeaderTeam.jsx
import React from "react";
import { Users } from "lucide-react"; // icon nhóm

export function HeaderTeam({ onCreate, searchValue, setSearchValue }) {
  return (
    <div className="mb-6">
      {/* Header chính */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users size={24} /> Nhóm
        </h2>
        <button
          onClick={onCreate}
          className="px-3 py-1 border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition"
        >
          Tạo nhóm
        </button>
      </div>

      {/* Search nhóm */}
      <div className="mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm nhóm"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>
    </div>
  );
}
