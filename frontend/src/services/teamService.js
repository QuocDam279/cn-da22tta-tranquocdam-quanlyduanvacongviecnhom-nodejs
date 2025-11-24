// src/services/teamService.js

const API_URL = `${import.meta.env.VITE_API_URL}/teams`;

// Hàm lấy token từ localStorage
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
  // Server trả về lỗi 400/500... thì res.ok là false
  if (!res.ok) throw new Error(data.message || "Lỗi API Team Service");
  return data;
}

// ========================
// 🟦 TEAM API
// ========================

// Tạo team mới
export function createTeam({ name, description }) {
  // ĐÃ SỬA: Gửi team_name thay vì name để khớp với server
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify({ team_name: name, description }),
  });
}

// Lấy tất cả team của user hiện tại
export function getMyTeams() {
  return apiRequest(API_URL, { method: "GET" });
}

// Lấy chi tiết 1 team
export function getTeamById(id) {
  return apiRequest(`${API_URL}/${id}`, { method: "GET" });
}

// Thêm thành viên vào team
export function addMembers(teamId, userIds = []) {
  return apiRequest(`${API_URL}/${teamId}/members/batch`, {
    method: "POST",
    body: JSON.stringify({ user_ids: userIds }),
  });
}


// Xóa thành viên khỏi team
export function removeMember(teamId, userId) {
  // Server dùng route /:id/members/:uid, client dùng /${teamId}/members/${userId}
  // Giả định route server đúng là /teams/:id/members/:uid (hoặc /teams/:id/members/:userId)
  return apiRequest(`${API_URL}/${teamId}/members/${userId}`, {
    method: "DELETE",
  });
}

// Cập nhật thông tin team
export function updateTeam(teamId, payload) {
  // LƯU Ý: Nếu payload chứa tên nhóm, nó PHẢI là key team_name (ví dụ: { team_name: 'Tên mới', description: 'Mô tả mới' })
  // Không cần sửa ở đây, nhưng phải đảm bảo người gọi hàm này sử dụng đúng key.
  return apiRequest(`${API_URL}/${teamId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Xóa team
export function deleteTeam(teamId) {
  return apiRequest(`${API_URL}/${teamId}`, {
    method: "DELETE",
  });
}

// Rời team
export function leaveTeam(teamId) {
  return apiRequest(`${API_URL}/${teamId}/leave`, {
    method: "POST",
  });
}

// Lấy các team do user hiện tại tạo
export function getLeaderTeams() {
  return apiRequest(`${API_URL}/leader`, { method: "GET" });
}