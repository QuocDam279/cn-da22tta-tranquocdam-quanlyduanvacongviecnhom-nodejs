// src/pages/ProjectDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TabsContainer from "../components/common/TabsContainer";
import ProjectInfo from "../components/project/ProjectInfo";
import MemberList from "../components/team/MemberList";
import TaskList from "../components/task/TaskList";
import CreateTaskButton from "../components/task/CreateTaskButton";
import { getProjectById } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";

export default function ProjectDetail() {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);

  // Project state
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState("members");

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskUpdatedFlag, setTaskUpdatedFlag] = useState(0);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  // Fetch project
  const fetchProject = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err.message || "Lỗi khi tải chi tiết dự án");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const data = await getTasksByProject(id);
      setTasks(data);
    } catch (err) {
      console.error("❌ Lỗi fetch tasks:", err.message);
    } finally {
      setTaskLoading(false);
    }
  };

  // ✅ Khi task thay đổi (update, delete, create)
  const handleTaskUpdated = async () => {
    console.log("🔄 Task updated, refreshing...");
    setTaskUpdatedFlag((f) => f + 1);
    
    // Fetch tasks ngay lập tức
    await fetchTasks();
    
    // ✅ Đợi một chút để backend tính xong progress
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Fetch lại project để lấy progress mới
    await fetchProject();
    
    console.log("✅ Refresh hoàn tất");
  };

  // Initial load
  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (activeTab === "tasks") fetchTasks();
  }, [activeTab]);

  if (loading) return <p className="pt-24 px-6">Đang tải chi tiết dự án...</p>;
  if (error) return <p className="pt-24 px-6 text-red-500">{error}</p>;
  if (!project) return <p className="pt-24 px-6">Không tìm thấy dự án</p>;

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link to="/duan" className="hover:text-blue-600 transition-colors">
              Dự án
            </Link>
            <span className="mx-1 text-gray-400">→</span>
            <span
              className="text-gray-700 font-medium max-w-xs truncate"
              title={project.project_name}
            >
              {project.project_name}
            </span>
          </div>

          {/* Project info */}
          <ProjectInfo project={project} />

          {/* Tabs */}
          <TabsContainer
            tabs={[
              { key: "members", label: "Thành viên" },
              { key: "tasks", label: "Công việc" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          >
            {activeTab === "members" && (
              <MemberList members={project.team_members || []} />
            )}

            {activeTab === "tasks" && (
              <div className="space-y-4 relative">
                {taskLoading ? (
                  <p>Đang tải công việc...</p>
                ) : tasks.length > 0 ? (
                  <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
                ) : (
                  <p>Chưa có công việc nào.</p>
                )}

                <CreateTaskButton
                  projectId={id}
                  onCreated={handleTaskUpdated}
                  members={project.team_members || []}
                />
              </div>
            )}
          </TabsContainer>
        </div>
      </div>
    </div>
  );
}