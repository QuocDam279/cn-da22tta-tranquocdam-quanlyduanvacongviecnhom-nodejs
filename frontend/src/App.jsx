// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import TeamDetail from "./pages/TeamDetail";
// Giữ lại các trang Detail
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import UserProfilePage from "./pages/UserProfilePage";

/* =======================
   Auth Guard
======================= */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

/* =======================
   Toast UI Config
======================= */
const toastOptions = {
  duration: 3000,
  style: {
    background: "#ffffff",
    color: "#1f2937",
    padding: "12px 16px",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    fontSize: "14px",
    fontWeight: 500,
  },
  success: {
    iconTheme: { primary: "#22c55e", secondary: "#ffffff" },
  },
  error: {
    iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
  },
  loading: {
    iconTheme: { primary: "#3b82f6", secondary: "#ffffff" },
  },
};

/* =======================
   App
======================= */
export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={toastOptions} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* Tổng quan */}
        <Route path="/tongquan" element={<RequireAuth><Dashboard /></RequireAuth>} />

        {/* Nhóm & Chi tiết Nhóm */}
        <Route path="/nhom" element={<RequireAuth><Team /></RequireAuth>} />
        <Route path="/nhom/:id" element={<RequireAuth><TeamDetail /></RequireAuth>} />

        {/* Chỉ giữ Chi tiết Dự án & Công việc (Loại bỏ trang danh sách) */}
        <Route path="/duan/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
        <Route path="/congviec/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />

        {/* Profile */}
        <Route path="/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />

        {/* Loại bỏ hoàn toàn /nhatkyhoatdong */}
        
        <Route path="*" element={<Navigate to="/tongquan" replace />} />
      </Routes>
    </>
  );
}