// src/services/authService.js

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
const USER_API_URL = `${import.meta.env.VITE_API_URL}/user`;

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
  if (!res.ok) {
    throw new Error(data.message || "Lỗi API");
  }

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

  // ✅ Lưu token
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // ✅ Lưu userId
  if (data.user && (data.user._id || data.user.id)) {
    localStorage.setItem("userId", data.user._id || data.user.id);
  }

  // ✅ Lưu user info
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

// ========================
// 🟨 GOOGLE OAUTH
// ========================

// Khởi tạo Google Login - Chuyển hướng đến backend
export function loginWithGoogle() {
  // Lưu URL hiện tại để redirect về sau khi login
  localStorage.setItem("redirectAfterLogin", window.location.pathname);
  
  // Chuyển hướng đến endpoint Google OAuth qua API Gateway
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
}

// Xử lý callback từ Google OAuth
export function handleGoogleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const userJson = urlParams.get("user");
  const error = urlParams.get("error");

  // ❌ Có lỗi từ backend
  if (error) {
    console.error("Google login error:", error);
    return { success: false, error };
  }

  // ❌ Thiếu dữ liệu
  if (!token || !userJson) {
    return { success: false, error: "missing_data" };
  }

  try {
    // ✅ Parse user data
    const user = JSON.parse(decodeURIComponent(userJson));

    // ✅ Lưu token
    localStorage.setItem("token", token);

    // ✅ Lưu userId
    if (user._id || user.id) {
      localStorage.setItem("userId", user._id || user.id);
    }

    // ✅ Lưu user info
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Lấy redirect URL (nếu có)
    const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";
    localStorage.removeItem("redirectAfterLogin");

    return { 
      success: true, 
      user, 
      token,
      redirectPath 
    };
  } catch (err) {
    console.error("Parse error:", err);
    return { success: false, error: "parse_error" };
  }
}

// Kiểm tra user đã đăng nhập chưa
export function isAuthenticated() {
  return !!getToken();
}

// Lấy user info từ localStorage
export function getCurrentUser() {
  try {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
  } catch (err) {
    console.error("Parse user error:", err);
    return null;
  }
}

// ✅ Đăng xuất - Chỉ xóa localStorage, KHÔNG gọi API
export async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
  localStorage.removeItem("redirectAfterLogin");
  console.log("✅ Logged out successfully");
}

// ========================
// 🟦 USER INFO API
// ========================

// Lấy thông tin nhiều user theo IDs
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
// 🟩 USER PROFILE API
// ========================

// Lấy thông tin profile của user hiện tại
export function getProfile() {
  return request(`${USER_API_URL}/profile`);
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

  const res = await fetch(`${USER_API_URL}/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");

  return data;
}

// Đổi mật khẩu (chỉ cho local auth)
export function changePassword({ old_password, new_password }) {
  return request(`${USER_API_URL}/change-password`, {
    method: "POST",
    body: JSON.stringify({ old_password, new_password }),
  });
}