// src/pages/TaskDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Menu from "../components/common/Menu";
import Header from "../components/common/Header";
import { getTaskById } from "../services/taskService";

export default function TaskDetail() {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sidebarWidth = collapsed ? "4rem" : "16rem";

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getTaskById(id);
        setTask(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi tải công việc");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  if (loading) return <p className="pt-24 px-6">Đang tải công việc...</p>;
  if (error) return <p className="pt-24 px-6 text-red-500">{error}</p>;
  if (!task) return <p className="pt-24 px-6">Không tìm thấy công việc</p>;

  return (
    <div className="bg-white min-h-screen flex">
      <Menu collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1">
        <Header collapsed={collapsed} sidebarWidth={sidebarWidth} />
        <div
          className="pt-24 px-6 space-y-6 transition-all duration-300"
          style={{ marginLeft: sidebarWidth }}
        >
          <h1 className="text-2xl font-bold mb-4">{task.task_name}</h1>

          {task.description && (
            <p className="mb-2 text-gray-700">{task.description}</p>
          )}

          <div className="space-y-2">
            <p>
              <strong>Trạng thái:</strong> {task.status}
            </p>
            <p>
              <strong>Ưu tiên:</strong> {task.priority}
            </p>
            <p>
              <strong>Người tạo:</strong> {task.created_by?.full_name || "-"}
            </p>
            <p>
              <strong>Người được giao:</strong> {task.assigned_to?.full_name || "-"}
            </p>
            {task.start_date && (
              <p>
                <strong>Ngày bắt đầu:</strong>{" "}
                {new Date(task.start_date).toLocaleDateString()}
              </p>
            )}
            {task.due_date && (
              <p>
                <strong>Ngày kết thúc:</strong>{" "}
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
            <p>
              <strong>Tiến độ:</strong> {task.progress}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
