// pages/Task.jsx
import React, { useState, useEffect } from "react";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import TaskList from "../components/task/TaskList";
import TaskStats from "../components/task/TaskStats";
import { getMyTasks, getTaskStats } from "../services/taskService";

export default function Task() {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      setError("Lỗi khi tải công việc");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getTaskStats();
      setStats(data);
    } catch {}
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <div
          className="pt-24 px-6 space-y-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <h1 className="text-3xl font-bold mb-2">Công việc của tôi</h1>

          <TaskStats stats={stats} />

          {loading ? (
            <p>Đang tải công việc...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <TaskList tasks={tasks} />
          )}
        </div>
      </div>
    </div>
  );
}
