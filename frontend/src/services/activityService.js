// src/services/activityService.js
const API_URL = `${import.meta.env.VITE_API_URL}/activity-logs`;

// ========================
// 🔧 HELPER FUNCTIONS
// ========================

// Lấy token từ localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Lấy User ID từ localStorage
function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id || user._id;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
    return null;
  }
}

// Generic API request helper
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
    throw new Error(data.message || `API Error: ${res.status}`);
  }
  
  return data;
}

// Build query string từ object params
function buildQueryString(params = {}) {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const queryString = new URLSearchParams(cleanParams).toString();
  return queryString ? `?${queryString}` : "";
}

// ========================
// 📝 ACTIVITY LOG API
// ========================

/**
 * Tạo activity log mới
 * Được gọi từ Task Service hoặc các service khác
 * @param {Object} payload - { user_id, user_name, user_avatar, action, related_id, related_name, team_id }
 */
export function createActivityLog(payload) {
  return apiRequest(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Lấy danh sách activities của một user cụ thể
 * @param {string} userId - ID của user
 * @param {Object} params - { limit, page }
 */
export function getUserActivities(userId, params = {}) {
  const queryString = buildQueryString(params);
  return apiRequest(`${API_URL}/user/${userId}${queryString}`);
}

/**
 * Lấy danh sách activities của một team
 * @param {string} teamId - ID của team
 * @param {Object} params - { limit, page }
 */
export function getTeamActivities(teamId, params = {}) {
  const queryString = buildQueryString(params);
  return apiRequest(`${API_URL}/team/${teamId}${queryString}`);
}

// ========================
// 🎯 CONVENIENCE FUNCTIONS
// ========================

/**
 * Lấy activities của user hiện tại (đã đăng nhập)
 * @param {Object} params - { limit, page }
 */
export function getMyActivities(params = {}) {
  const userId = getCurrentUserId();
  
  if (!userId) {
    throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
  }
  
  return getUserActivities(userId, params);
}

// ========================
// 📊 DEFAULT EXPORT
// ========================

export default {
  createActivityLog,
  getUserActivities,
  getTeamActivities,
  getMyActivities,
};