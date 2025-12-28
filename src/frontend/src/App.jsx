// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth"; // ✅ Import useAuth

import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import TeamDetail from "./pages/TeamDetail";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import UserProfilePage from "./pages/UserProfilePage";

/* =======================
   ✅ Protected Route (Reactive)
======================= */
function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth(); // ✅ Reactive hook
  const location = useLocation();

  // ✅ Check cả isAuthenticated và token
  if (!isAuthenticated || !token) {
    // Lưu current location để redirect về sau khi login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

/* =======================
   ✅ Guest Route (Chỉ cho chưa login)
======================= */
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect về trang trước đó hoặc dashboard
    const from = location.state?.from || '/tongquan';
    return <Navigate to={from} replace />;
  }

  return children;
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
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ✅ Guest routes - Chỉ cho chưa login */}
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        
        {/* ✅ Google callback - Không cần protect vì đang xử lý login */}
        <Route path="/auth/callback" element={<GoogleCallback />} />

        {/* ✅ Protected routes - Cần login */}
        <Route 
          path="/tongquan" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/nhom" 
          element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/nhom/:id" 
          element={
            <ProtectedRoute>
              <TeamDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/duan/:id" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/congviec/:id" 
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* 404 - Redirect to dashboard if logged in, login if not */}
        <Route path="*" element={<Navigate to="/tongquan" replace />} />
      </Routes>
    </>
  );
}