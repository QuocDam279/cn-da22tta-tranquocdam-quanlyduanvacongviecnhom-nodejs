import React from "react";
import { User } from "lucide-react";

export default function HeaderTeam({ onCreate, searchValue, setSearchValue }) {
  return (
    <div className="mb-6">
      {/* Header chính */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Nhóm</h2>
        <button
          onClick={onCreate}
          className="px-3 py-0.5 border-2 border-gray-400 text-gray-700 rounded hover:bg-gray-100 transition"
        >
          Tạo nhóm
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b pb-2 mb-4 text-gray-600">
        <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
          Tất cả các nhóm
        </button>
        <button className="hover:text-black transition">Nhóm của bạn</button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm nhóm"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
          <User size={18} /> Thành viên nhóm
        </button>
      </div>
    </div>
  );
}
