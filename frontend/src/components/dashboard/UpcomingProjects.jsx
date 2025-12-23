import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

export default function UpcomingProjects({ projects }) {
  const navigate = useNavigate(); // ✅ Khởi tạo hook

  if (!projects.length) {
    return (
      <div className="text-gray-400 text-sm text-center py-4">
        Không có dự án sắp đến hạn
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project._id}
          onClick={() => navigate(`/duan/${project._id}`)} // ✅ Sự kiện click
          className="p-4 rounded-xl border hover:bg-gray-50 transition cursor-pointer group" // ✅ Thêm cursor-pointer
        >
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
              {project.project_name}
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Deadline: {new Date(project.end_date).toLocaleDateString("vi-VN")}
          </p>

          <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                ></div>
            </div>
            <span>{project.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}