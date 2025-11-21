import React, { useState } from "react";
import { ArrowLeft, User } from "lucide-react";

export default function AddTeamForm({ onClose }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Nhóm</h2>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Các trường bắt buộc được đánh dấu bằng dấu *
        </p>

        {/* Name */}
        <label className="font-medium">Tên nhóm *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm"
          className="w-full border rounded-lg px-3 py-2 mt-1 mb-4 outline-none"
        />

        {/* Members */}
        <label className="font-medium">Thêm thành viên</label>
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 mt-1 mb-4">
          <User size={18} className="text-gray-600" />
          <input
            className="flex-1 outline-none "
            placeholder="Nhập mail thành viên"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
        <div className="grid grid-cols-2 gap-3 w-3/5">
            <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
            Hủy
            </button>

            <button className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Tạo mới
            </button>
        </div>
        </div>
      </div>
    </div>
  );
}