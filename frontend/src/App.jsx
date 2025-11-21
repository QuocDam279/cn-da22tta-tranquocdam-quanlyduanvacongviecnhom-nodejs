import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";

// Component bảo vệ route cần đăng nhập
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Trang mặc định chuyển về login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected routes */}
      <Route
        path="/tongquan"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      /> 
      
      <Route
        path="/nhom"
        element={
          <RequireAuth>
            <Team />
          </RequireAuth>
        }
      />
      
    </Routes>
  );
}

export default App;