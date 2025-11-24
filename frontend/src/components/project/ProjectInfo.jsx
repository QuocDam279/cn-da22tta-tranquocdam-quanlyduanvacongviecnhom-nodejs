// src/components/project/ProjectInfo.jsx
import React from "react";
import { Calendar, Clock } from "lucide-react";
import ProjectActions from "./ProjectActions";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

export default function ProjectInfo({ project }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 truncate">{project.project_name}</h2>
        <ProjectActions project={project} />
      </div>

      {/* Description */}
      <div className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl text-gray-700 text-sm shadow-inner border border-gray-100">
        {project.description || "Chưa có mô tả dự án"}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Time */}
        <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100">
          <Calendar className="text-indigo-500" size={20} />
          <div>
            <p className="text-xs text-indigo-600">Thời gian</p>
            <p className="text-sm font-medium">
              {formatDate(project.start_date)} → {formatDate(project.end_date)}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-2 p-4 bg-blue-50 rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            <p className="text-xs text-blue-700">Tiến độ</p>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <p className="text-xs font-medium text-blue-700 text-right">
            {project.progress || 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
