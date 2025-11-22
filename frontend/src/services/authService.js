// src/services/authService.js

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

// Lấy token
function getToken() {
  return localStorage.getItem("token");
}

// Hàm gọi API chung
async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi authService");

  return data;
}

// ========================
// 🟦 AUTH API
// ========================

// Đăng ký
export function register({ full_name, email, password }) {
  return request(`${API_URL}/register`, {
    method: "POST",
    body: JSON.stringify({ full_name, email, password }),
  });
}

// Đăng nhập
export async function login({ email, password }) {
  const data = await request(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  // Lưu token và userId vào localStorage
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  
  if (data.user && data.user._id) {
    localStorage.setItem("userId", data.user._id);
  }
  
  return data;
}

// ========================
// 🟦 USER INFO API
// ========================

// Lấy thông tin nhiều user theo danh sách ID
export function getUsersByIds(ids = []) {
  return request(`${API_URL}/users/info`, {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// *TÌM USER THEO EMAIL* → Thay thế GET /users/email
export function findUserByEmail(email) {
  return request(`${API_URL}/users/find`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
