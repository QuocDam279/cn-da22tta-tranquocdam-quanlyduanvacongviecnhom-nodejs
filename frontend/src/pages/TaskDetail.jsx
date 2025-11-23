// src/pages/TaskDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Menu from "../components/common/Menu";
import Header from "../components/common/Header";

import { getTaskById } from "../services/taskService";

import TaskHeader from "../components/task/TaskHeader";
import TaskSidebar from "../components/task/TaskSidebar";

export default function TaskDetail() {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? "4rem" : "16rem";

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTask = async () => {
    const data = await getTaskById(id);
    setTask(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  if (loading) return <p className="pt-24 px-6">Đang tải công việc...</p>;
  if (!task) return <p className="pt-24 px-6">Không tìm thấy công việc</p>;

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />

        <div
          className="pt-24 px-8 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <div className="max-w-6xl mx-auto flex gap-8">
            {/* LEFT: MAIN CONTENT */}
            <div className="flex-1 space-y-6">
              <TaskHeader task={task} />
            </div>

            {/* RIGHT: SIDEBAR META */}
            <TaskSidebar task={task} onUpdated={loadTask} />
          </div>
        </div>
      </div>
    </div>
  );
}
