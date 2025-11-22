// src/services/taskService.js

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Hàm chuẩn gọi API kèm token
async function apiRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi API Task Service");
  return data;
}

// =====================================================
// 🟦 TASK API
// =====================================================

// 🧱 Tạo task mới
export function createTask(payload) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 📋 Lấy task theo project
export function getTasksByProject(projectId) {
  return apiRequest(`${API_URL}/project/${projectId}`, {
    method: "GET",
  });
}

// 🔍 Lấy chi tiết task
export function getTaskById(taskId) {
  return apiRequest(`${API_URL}/${taskId}`, {
    method: "GET",
  });
}

// ✏️ Cập nhật task
export function updateTask(taskId, payload) {
  return apiRequest(`${API_URL}/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// 🗑️ Xóa task
export function deleteTask(taskId) {
  return apiRequest(`${API_URL}/${taskId}`, {
    method: "DELETE",
  });
}

// 📊 Lấy thống kê task theo project
export function getTaskStats(projectId) {
  const url = projectId ? `${API_URL}/stats/${projectId}` : `${API_URL}/stats`;
  return apiRequest(url, { method: "GET" });
}

// 👤 Lấy tất cả task của user hiện tại
export function getMyTasks() {
  return apiRequest(`${API_URL}/my`, {
    method: "GET",
  });
}

// 🧠 Lấy toàn bộ task (route nội bộ)
export function getAllTasksInternal() {
  return apiRequest(`${API_URL}/internal/all`, {
    method: "GET",
  });
}
