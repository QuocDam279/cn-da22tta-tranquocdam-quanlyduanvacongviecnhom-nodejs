// =====================================================
// 📁 src/services/notificationService.js
// =====================================================

const API_URL = `${import.meta.env.VITE_API_URL}/notifications`;

// --- HELPER: API REQUEST ---
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
      if (res.status === 204) return null;
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
      throw new Error("Không thể kết nối đến server (Notification Service).");
    }
    throw error;
  }
}

// ========================
// 🔔 NOTIFICATION API
// ========================

// ✅ Lấy danh sách thông báo của tôi
export function getMyNotifications() {
  return apiRequest(`${API_URL}/my`);
}

// ⭐ NEW: Lấy chi tiết 1 thông báo (kèm related data)
export function getNotificationById(id) {
  return apiRequest(`${API_URL}/${id}`);
}

// ⭐ NEW: Lấy số lượng chưa đọc
export function getUnreadCount() {
  return apiRequest(`${API_URL}/unread/count`);
}

// ✅ Đánh dấu đã đọc
export function markAsRead(id) {
  return apiRequest(`${API_URL}/${id}/read`, {
    method: "PUT",
  });
}

// ⭐ NEW: Đánh dấu tất cả đã đọc
export function markAllAsRead() {
  return apiRequest(`${API_URL}/read-all`, {
    method: "PUT",
  });
}

// ✅ Xóa thông báo
export function deleteNotification(id) {
  return apiRequest(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

// ✅ Tạo thông báo (Manual trigger)
export function sendNotification(payload) {
  return apiRequest(`${API_URL}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

// ⭐ NEW: Gửi email thông báo (Manual)
export function sendNotificationMail(payload) {
  return apiRequest(`${API_URL}/send`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}