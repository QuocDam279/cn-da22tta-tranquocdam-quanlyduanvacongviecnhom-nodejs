// src/components/project/ProjectInfo.jsx
import React from "react";
import { Calendar, Clock, FileText } from "lucide-react";
import ProjectActions from "./ProjectActions";
import Status from "../dashboard/Status";

export default function ProjectInfo({ project, tasks, taskLoading }) {
  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString("vi-VN") : "-";

  return (
    <div className="p-6 space-y-6">
      {/* Header với gradient background */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            {project.project_name}
          </h2>
        </div>
        <ProjectActions project={project} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Thông tin chi tiết (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Mô tả */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-gray-600" size={18} />
              <h3 className="text-sm font-semibold text-gray-700">Mô tả dự án</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {project.description || "Chưa có mô tả cho dự án này"}
            </p>
          </div>

          {/* Grid thông tin thời gian & tiến độ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thời gian */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar className="text-white" size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Thời gian thực hiện</h3>
              </div>
              <div className="space-y-2 ml-13">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium w-16">Bắt đầu:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatDate(project.start_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium w-16">Kết thúc:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatDate(project.end_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tiến độ */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Clock className="text-white" size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Tiến độ dự án</h3>
              </div>
              <div className="space-y-3 ml-13">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Hoàn thành</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {project.progress || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Trạng thái task (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-50 to-purple-50/20 rounded-xl p-5 border border-gray-200 h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-700">Trạng thái công việc</h3>
            </div>
            {taskLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm font-medium">Đang tải...</p>
              </div>
            ) : (
              <Status workItems={tasks} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}