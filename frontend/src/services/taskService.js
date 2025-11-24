// src/services/taskService.js

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Hàm chuẩn gọi API kèm token
async function apiRequest(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
        ...(options.headers || {}),
      },
    });

    // ✅ Xử lý trường hợp token hết hạn
    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login"; // Hoặc dùng router.push('/login')
      throw new Error("Phiên đăng nhập hết hạn");
    }

    // ✅ Kiểm tra xem response có phải JSON không
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Lỗi server: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `Lỗi API: ${res.status}`);
    }
    
    return data;
  } catch (error) {
    // ✅ Xử lý lỗi network
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Không thể kết nối đến server");
    }
    throw error;
  }
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

// 📊 Lấy thống kê task theo project hoặc của user
export function getTaskStats(projectId = null) {
  const url = projectId ? `${API_URL}/stats/${projectId}` : `${API_URL}/stats`;
  return apiRequest(url, { method: "GET" });
}

// 👤 Lấy tất cả task của user hiện tại
export function getMyTasks() {
  return apiRequest(`${API_URL}/my`, {
    method: "GET",
  });
}
