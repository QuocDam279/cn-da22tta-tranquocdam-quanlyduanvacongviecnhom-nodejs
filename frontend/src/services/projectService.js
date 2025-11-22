// src/services/projectService.js
const API_URL = `${import.meta.env.VITE_API_URL}/projects`;

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Hàm chuẩn gọi API có token
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
  if (!res.ok) throw new Error(data.message || "Lỗi API Project Service");
  return data;
}

// ========================
// 🟦 PROJECT API
// ========================

// Tạo project mới
export function createProject({ team_id, project_name, description, start_date, end_date }) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify({ team_id, project_name, description, start_date, end_date }),
  });
}

// Lấy tất cả project mà user tham gia
export function getMyProjects() {
  return apiRequest(API_URL, { method: "GET" });
}

// Lấy project theo team
export function getProjectsByTeam(teamId) {
  return apiRequest(`${API_URL}/team/${teamId}`, { method: "GET" });
}

// Lấy chi tiết project
export function getProjectById(projectId) {
  return apiRequest(`${API_URL}/${projectId}`, { method: "GET" });
}

// Cập nhật project
export function updateProject(projectId, payload) {
  // payload có thể chứa: { project_name, description, start_date, end_date, status, progress }
  return apiRequest(`${API_URL}/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Xóa project
export function deleteProject(projectId) {
  return apiRequest(`${API_URL}/${projectId}`, { method: "DELETE" });
}
