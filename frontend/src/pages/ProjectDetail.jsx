import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // 'members' | 'tasks'

  // Task states
  const [tasks, setTasks] = useState([]);
  const [taskLoading, setTaskLoading] = useState(false);

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  // ---------- Fetch project ----------
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

  // ---------- Fetch tasks ----------
  const fetchTasks = async () => {
    setTaskLoading(true);
    try {
      const data = await getTasksByProject(id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTaskLoading(false);
    }
  };

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
          <ProjectInfo project={project} />

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
                  <TaskList tasks={tasks} refresh={fetchTasks} />
                ) : (
                  <p>Chưa có công việc nào.</p>
                )}

                <CreateTaskButton
                  projectId={id}
                  onCreated={fetchTasks}
                  members={project.team_members || []} // ✅ Truyền member có user info
                />
              </div>
            )}
          </TabsContainer>
        </div>
      </div>
    </div>
  );
}
