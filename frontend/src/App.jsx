// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback"; // ← THÊM IMPORT
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import TeamDetail from "./pages/TeamDetail";
import Project from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";
import Task from "./pages/Task";
import TaskDetail from "./pages/TaskDetail";
import Activity from "./pages/Activity";
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
    iconTheme: {
      primary: "#22c55e",
      secondary: "#ffffff",
    },
  },
  error: {
    iconTheme: {
      primary: "#ef4444",
      secondary: "#ffffff",
    },
  },
  loading: {
    iconTheme: {
      primary: "#3b82f6",
      secondary: "#ffffff",
    },
  },
};

/* =======================
   App
======================= */
export default function App() {
  return (
    <>
      {/* Global Toast */}
      <Toaster position="top-center" toastOptions={toastOptions} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* ← THÊM ROUTE NÀY */}
        <Route path="/auth/callback" element={<GoogleCallback />} />

        <Route path="/tongquan" element={<RequireAuth><Dashboard /></RequireAuth>} />

        <Route path="/nhom" element={<RequireAuth><Team /></RequireAuth>} />
        <Route path="/nhom/:id" element={<RequireAuth><TeamDetail /></RequireAuth>} />

        <Route path="/duan" element={<RequireAuth><Project /></RequireAuth>} />
        <Route path="/duan/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />

        <Route path="/congviec" element={<RequireAuth><Task /></RequireAuth>} />
        <Route path="/congviec/:id" element={<RequireAuth><TaskDetail /></RequireAuth>} />

        <Route path="/nhatkyhoatdong" element={<RequireAuth><Activity /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
      </Routes>
    </>
  );
}