// src/services/authService.js

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
const USER_API_URL = `${import.meta.env.VITE_API_URL}/user`; // ✅ Thêm base URL cho user

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

// Đăng xuất
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
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

// Tìm user theo email
export function findUserByEmail(email) {
  return request(`${API_URL}/users/find`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ========================
// 🟩 USER PROFILE API (MỚI)
// ========================

// Lấy thông tin profile của user hiện tại
export function getProfile() {
  return request(`${USER_API_URL}/profile`, {
    method: "GET",
  });
}

// Cập nhật tên người dùng
export function updateProfile({ full_name }) {
  return request(`${USER_API_URL}/profile`, {
    method: "PUT",
    body: JSON.stringify({ full_name }),
  });
}

// Upload avatar
export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(`${USER_API_URL}/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // ❌ KHÔNG set Content-Type khi upload file (để browser tự set)
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Lỗi upload avatar");

  return data;
}

// Đổi mật khẩu
export function changePassword({ old_password, new_password }) {
  return request(`${USER_API_URL}/password`, {
    method: "PUT",
    body: JSON.stringify({ old_password, new_password }),
  });
}