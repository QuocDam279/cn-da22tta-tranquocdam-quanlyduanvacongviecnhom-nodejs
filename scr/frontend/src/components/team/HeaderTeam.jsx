// src/components/team/HeaderTeam.jsx
import React from "react";
import { Users, Plus, Search } from "lucide-react";

export function HeaderTeam({ onCreate, searchValue, setSearchValue }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 lg:p-8">
      {/* Header chính */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nhóm</h2>
            <p className="text-sm text-gray-500">Quản lý các nhóm làm việc của bạn</p>
          </div>
        </div>
        
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Tạo nhóm</span>
        </button>
      </div>

      {/* Search nhóm */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Tìm kiếm nhóm theo tên hoặc mô tả..."
          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white"
        />
      </div>
    </div>
  );
}