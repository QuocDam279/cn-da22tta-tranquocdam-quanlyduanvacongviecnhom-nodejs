// src/services/taskService.js

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

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

    // 1. Xử lý hết hạn token (401)
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Xóa cả user info nếu có
      window.location.href = "/login"; 
      throw new Error("Phiên đăng nhập hết hạn");
    }

    // 2. Kiểm tra content-type có phải JSON không
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       // Trường hợp server trả về lỗi HTML hoặc text (500, 502...)
       if (!res.ok) throw new Error(`Lỗi Server (${res.status})`);
       return null; // Hoặc trả về text nếu cần
    }

    const data = await res.json();
    
    // 3. Xử lý lỗi logic từ Backend trả về
    if (!res.ok) {
      throw new Error(data.message || `Lỗi API: ${res.status}`);
    }
    
    return data;
  } catch (error) {
    // 4. Xử lý mất mạng / Server chết
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra mạng.");
    }
    throw error;
  }
}

// ========================
// 🟦 TASK API
// ========================

export function createTask(payload) {
  return apiRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getTasksByProject(projectId) {
  return apiRequest(`${API_URL}/project/${projectId}`);
}

export function getTaskById(taskId) {
  return apiRequest(`${API_URL}/${taskId}`);
}

export function updateTask(taskId, payload) {
  return apiRequest(`${API_URL}/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(taskId) {
  return apiRequest(`${API_URL}/${taskId}`, { method: "DELETE" });
}

export function getTaskStats(projectId = null) {
  const url = projectId ? `${API_URL}/stats/${projectId}` : `${API_URL}/stats`;
  return apiRequest(url);
}

export function getMyTasks() {
  return apiRequest(`${API_URL}/my`);
}

// ========================
// ✨ SPECIFIC UPDATES (Tối ưu performance)
// ========================

export function updateTaskStatus(taskId, status, progress) {
  // Chuẩn bị body
  const body = { status };
  // Nếu có progress thì nhét thêm vào
  if (progress !== undefined) {
    body.progress = progress;
  }

  return apiRequest(`${API_URL}/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateTaskProgress(taskId, progress, status) {
  // Chuẩn bị body
  const body = { progress };
  // Nếu có status thì nhét thêm vào
  if (status) {
    body.status = status;
  }

  return apiRequest(`${API_URL}/${taskId}/progress`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function updateTaskPriority(taskId, priority) {
  return apiRequest(`${API_URL}/${taskId}/priority`, {
    method: "PATCH",
    body: JSON.stringify({ priority }),
  });
}

export function updateTaskAssignee(taskId, userId) {
  return apiRequest(`${API_URL}/${taskId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ assigned_to: userId }),
  });
}

export function updateTaskDueDate(taskId, dueDate) {
  return apiRequest(`${API_URL}/${taskId}/due-date`, {
    method: "PATCH",
    body: JSON.stringify({ due_date: dueDate }),
  });
}

export function updateTaskStartDate(taskId, startDate) {
  return apiRequest(`${API_URL}/${taskId}/start-date`, {
    method: "PATCH",
    body: JSON.stringify({ start_date: startDate }),
  });
}