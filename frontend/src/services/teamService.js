// src/services/teamService.js

const API_URL = `${import.meta.env.VITE_API_URL}/teams`;

// --- HELPER: API REQUEST CHUẨN (Đồng bộ với Task/Project Service) ---
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

    // 1. Xử lý hết hạn token (401)
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Phiên đăng nhập hết hạn");
    }

    // 2. Kiểm tra Content-Type
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       if (!res.ok) throw new Error(`Lỗi Server (${res.status})`);
       return null;
    }

    const data = await res.json();
    
    // 3. Xử lý lỗi logic
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
// 🟦 TEAM API
// ========================

export function createTeam({ name, description }) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify({ team_name: name, description }),
  });
}

export function getMyTeams() {
  return apiRequest(API_URL);
}

export function getTeamById(id) {
  return apiRequest(`${API_URL}/${id}`);
}

// Thêm thành viên (Batch)
export function addMembers(teamId, userIds = []) {
  return apiRequest(`${API_URL}/${teamId}/members/batch`, {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  });
}

// Xóa thành viên
export function removeMember(teamId, userId) {
  return apiRequest(`${API_URL}/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
}

export function updateTeam(teamId, payload) {
  return apiRequest(`${API_URL}/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTeam(teamId) {
  return apiRequest(`${API_URL}/${teamId}`, { method: "DELETE" });
}

export function leaveTeam(teamId) {
  return apiRequest(`${API_URL}/${teamId}/leave`, { method: "POST" });
}

export function getLeaderTeams() {
  return apiRequest(`${API_URL}/leader`);
}