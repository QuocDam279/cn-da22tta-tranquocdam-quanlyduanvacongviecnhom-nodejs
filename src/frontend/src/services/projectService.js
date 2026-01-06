const API_URL = `${import.meta.env.VITE_API_URL}/projects`;

// --- HELPER: API REQUEST CHUẨN ---
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Phiên đăng nhập hết hạn");
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       if (!res.ok) throw new Error(`Lỗi Server (${res.status})`);
       return null;
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Lỗi API: ${res.status}`);
    }
    return data;

  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Không thể kết nối đến server.");
    }
    throw error;
  }
}

// ========================
// 🟦 PROJECT API
// ========================

// Tạo project mới
export function createProject(payload) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Lấy tất cả project mà user tham gia
export function getMyProjects() {
  return apiRequest(API_URL);
}

// Lấy project theo team
export function getProjectsByTeam(teamId) {
  return apiRequest(`${API_URL}/team/${teamId}`);
}

// Lấy chi tiết project
export function getProjectById(projectId) {
  return apiRequest(`${API_URL}/${projectId}`);
}

// Cập nhật project đầy đủ (Tên, mô tả, ngày...)
export function updateProject(projectId, payload) {
  return apiRequest(`${API_URL}/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// ✅ ĐÃ BỔ SUNG: Cập nhật trạng thái dự án (Hoàn thành/Đang làm...)
export function updateProjectStatus(projectId, status) {
  return apiRequest(`${API_URL}/${projectId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Xóa project
export function deleteProject(projectId) {
  return apiRequest(`${API_URL}/${projectId}`, { method: "DELETE" });
}

// Tính lại tiến độ dự án
export function recalcProjectProgress(projectId) {
  return apiRequest(`${API_URL}/${projectId}/recalc-progress`, {
    method: "POST",
  });
}