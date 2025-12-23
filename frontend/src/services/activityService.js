// src/services/activityService.js
const API_URL = `${import.meta.env.VITE_API_URL}/activity-logs`;

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Hàm chuẩn gọi API có token
async function apiRequest(url, options = {}) {
  const token = getToken();
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
}

// ========================
// 🔧 HELPER: Build clean query string
// ========================
function buildQueryString(params = {}) {
  // Lọc bỏ các giá trị undefined, null, empty string
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const queryString = new URLSearchParams(cleanParams).toString();
  return queryString ? `?${queryString}` : '';
}

// ========================
// 🟦 ACTIVITY LOG API
// ========================

// Tạo activity log mới
export function createActivityLog({ user_id, action, related_id, related_type }) {
  return apiRequest(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify({ user_id, action, related_id, related_type }),
  });
}

// Lấy activities theo user
export function getUserActivities(userId, params = {}) {
  const queryString = buildQueryString(params);
  return apiRequest(`${API_URL}/user/${userId}${queryString}`);
}

// Lấy activities theo entity liên quan (task/project/team)
export function getRelatedActivities(relatedType, relatedId, params = {}) {
  const queryString = buildQueryString(params);
  return apiRequest(`${API_URL}/${relatedType}/${relatedId}${queryString}`);
}

// Xóa activity log
export function deleteActivityLog(activityId) {
  return apiRequest(`${API_URL}/${activityId}`, {
    method: "DELETE",
  });
}

// ========================
// 🎯 HELPER FUNCTIONS
// ========================

// ✅ Lấy activities của user hiện tại
export function getMyActivities(params = {}) {
  const userId = localStorage.getItem("userId");
  
  if (!userId) {
    throw new Error("User ID not found. Please login again.");
  }
  
  return getUserActivities(userId, params);
}

// Lấy activities của task cụ thể
export function getTaskActivities(taskId, params = {}) {
  return getRelatedActivities("task", taskId, params);
}

// Lấy activities của project cụ thể
export function getProjectActivities(projectId, params = {}) {
  return getRelatedActivities("project", projectId, params);
}

// Lấy activities của team cụ thể
export function getTeamActivities(teamId, params = {}) {
  return getRelatedActivities("team", teamId, params);
}