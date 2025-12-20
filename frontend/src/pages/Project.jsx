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

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto pt-10 px-6 space-y-6">
        {/* Content */}
        {isLoading && (
          <p className="text-gray-500">Đang tải dự án...</p>
        )}

        {isError && (
          <p className="text-red-500">
            {error?.message || "Có lỗi xảy ra"}
          </p>
        )}

        {!isLoading && !isError && projects.length > 0 && (
          <ProjectList
            projects={projects}
            loading={isLoading}
            error={error}
          />
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <div className="text-gray-500 italic">
            Chưa có dự án nào.
          </div>
        )}
      </div>
    </div>
  );
}
