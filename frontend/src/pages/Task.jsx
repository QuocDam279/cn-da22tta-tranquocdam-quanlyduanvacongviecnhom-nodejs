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

  // ---------- Fetch task của user ----------
  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Lỗi khi tải công việc");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch thống kê task ----------
  const fetchStats = async () => {
    try {
      // Bỏ projectId, fetch tổng hợp tất cả task của user
      const data = await getTaskStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
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
          <h1 className="text-2xl font-bold mb-4">Công việc của tôi</h1>

          {/* Thống kê task */}
          <TaskStats stats={stats} />

          {/* Danh sách task */}
          {loading ? (
            <p>Đang tải công việc...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : tasks.length > 0 ? (
            <TaskList tasks={tasks} />
          ) : (
            <p>Chưa có công việc nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
