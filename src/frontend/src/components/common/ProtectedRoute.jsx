// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * Component bảo vệ routes yêu cầu authentication
 * Tự động redirect về /login nếu chưa đăng nhập
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  // ✅ Kiểm tra cả isAuthenticated và token
  if (!isAuthenticated || !token) {
    // Lưu URL hiện tại để redirect về sau khi login
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  return children;
}

/**
 * Component ngược lại - chỉ cho phép truy cập khi CHƯA đăng nhập
 * Dùng cho trang Login, Register
 */
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect về trang trước đó hoặc dashboard
    const from = location.state?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
}