// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook để quản lý authentication state
 * Reactive với localStorage changes và cung cấp helper methods
 */
export const useAuth = () => {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  // ✅ Sync với localStorage changes (từ tabs khác hoặc mutations)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userId") {
        setUserId(e.newValue);
      }
      if (e.key === "token") {
        setToken(e.newValue);
        setIsAuthenticated(!!e.newValue);
      }
      if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ✅ Poll localStorage mỗi giây để catch changes trong cùng tab
  useEffect(() => {
    const interval = setInterval(() => {
      const currentUserId = localStorage.getItem("userId");
      const currentToken = localStorage.getItem("token");
      const currentUser = localStorage.getItem("user");

      if (currentUserId !== userId) setUserId(currentUserId);
      if (currentToken !== token) {
        setToken(currentToken);
        setIsAuthenticated(!!currentToken);
      }
      if (currentUser !== JSON.stringify(user)) {
        setUser(currentUser ? JSON.parse(currentUser) : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, token, user]);

  // ✅ Login helper - Lưu đầy đủ thông tin
  const login = useCallback((userData, authToken) => {
    const newUserId = userData._id || userData.id;
    
    localStorage.setItem("userId", newUserId);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    
    setUserId(newUserId);
    setToken(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  // ✅ Logout helper - Xóa hết
  const logout = useCallback(() => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    setUserId(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ✅ Update user info helper
  const updateUser = useCallback((updatedUserData) => {
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  }, []);

  return {
    userId,
    token,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
};