const API_URL = `${import.meta.env.VITE_API_URL}/task-comments`;

// Helper lấy token
function getToken() {
  return localStorage.getItem("token");
}

// Helper gọi API chuẩn
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
  if (!res.ok) throw new Error(data.message || "Lỗi API Comment");
  return data;
}

// ========================
// 💬 COMMENT API
// ========================

// Lấy danh sách comment của 1 task
export function getCommentsByTask(taskId) {
  return apiRequest(`${API_URL}/task/${taskId}`);
}

// Gửi comment mới
export function createComment(taskId, content) {
  return apiRequest(`${API_URL}/task/${taskId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

// Xóa comment
export function deleteComment(commentId) {
  return apiRequest(`${API_URL}/${commentId}`, {
    method: "DELETE",
  });
}