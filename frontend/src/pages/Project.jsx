// src/pages/Project.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import ProjectList from "../components/project/ProjectList";
import { getMyProjects } from "../services/projectService"; // ✅ Sử dụng hàm có sẵn

export default function Project() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  // ---------- Fetch tất cả project mà user tham gia ----------
  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyProjects(); // ✅ sửa từ getAllProjects
      setProjects(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <h1 className="text-2xl font-semibold mb-4">Danh sách dự án</h1>

          {loading ? (
            <p>Đang tải dự án...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : projects.length > 0 ? (
            <ProjectList projects={projects} loading={loading} error={error} />
          ) : (
            <p>Chưa có dự án nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
