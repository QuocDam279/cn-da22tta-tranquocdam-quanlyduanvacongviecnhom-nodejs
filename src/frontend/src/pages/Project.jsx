import React from "react";
import { useNavigate } from "react-router-dom";
import ProjectList from "../components/project/ProjectList";
import { useMyProjects } from "../hooks/useProjects";

export default function Project() {
  const navigate = useNavigate();

  const {
    data: projects = [],
    isLoading,
    isError,
    error,
  } = useMyProjects();

  const handleProjectCreated = (newProject) => {
    // Có thể thêm logic khác nếu cần
    console.log("Project created:", newProject);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto pt-10 px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-gray-600">
            Quản lý và theo dõi tiến độ tất cả dự án của bạn
          </p>
        </div>

        {/* Content */}
        <ProjectList
          projects={projects}
          loading={isLoading}
          error={error?.message}
        />
      </div>
    </div>
  );
}