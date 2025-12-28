// src/hooks/useAuthMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  register, 
  login, 
  logout, 
  loginWithGoogle, 
  handleGoogleCallback 
} from '../services/authService';

// ✅ Helper function để invalidate tất cả cache
const invalidateAllUserData = async (queryClient) => {
  await queryClient.invalidateQueries({ 
    predicate: (query) => {
      const key = query.queryKey[0];
      return ['profile', 'my-tasks', 'my-teams', 'my-projects', 'my-activities', 'teams', 'projects'].includes(key);
    }
  });
  console.log("✅ All user cache invalidated");
};

// ✅ Helper function để lưu auth data
const saveAuthData = (data) => {
  if (!data) return;

  const { user, token, userId } = data;
  
  if (token) {
    localStorage.setItem("token", token);
  }
  
  if (userId || user?._id) {
    localStorage.setItem("userId", userId || user._id);
  }
  
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

// ✅ Helper function để clear auth data
const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
};

// ==================== MUTATIONS ====================

// Đăng ký
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.message || "Đăng ký thất bại");
    }
  });
};

// Đăng nhập thường
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // ✅ Lưu auth data
      saveAuthData(data);
      
      // ✅ Invalidate cache
      await invalidateAllUserData(queryClient);
      
      // ✅ Dispatch custom event để useAuth hook catch được
      window.dispatchEvent(new Event('storage'));
      
      toast.success(`Chào mừng ${data.user?.full_name || 'bạn'} quay lại! 👋`);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || "Đăng nhập thất bại");
    }
  });
};

// Đăng nhập Google - Chỉ redirect
export const useGoogleLogin = () => {
  return {
    mutate: () => {
      try {
        loginWithGoogle();
      } catch (error) {
        toast.error("Không thể kết nối với Google");
        console.error("Google login error:", error);
      }
    },
    isLoading: false,
    isPending: false,
  };
};

// Xử lý Google Callback
export const useGoogleCallback = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const result = await handleGoogleCallback();
      
      if (!result?.success) {
        throw new Error(result?.error || 'Đăng nhập Google thất bại');
      }
      
      return result;
    },
    onSuccess: async (data) => {
      // ✅ Lưu auth data
      saveAuthData(data);
      
      // ✅ Invalidate cache
      await invalidateAllUserData(queryClient);
      
      // ✅ Dispatch custom event
      window.dispatchEvent(new Event('storage'));
      
      // ✅ Lấy redirect path đã lưu hoặc dùng default
      const savedRedirect = localStorage.getItem("redirectAfterLogin");
      const redirectPath = savedRedirect || data.redirectPath || '/dashboard';
      
      // ✅ Xóa redirect path để tránh dùng lại lần sau
      localStorage.removeItem("redirectAfterLogin");
      
      toast.success(`Đăng nhập thành công! Chào ${data.user?.full_name || 'bạn'} 🎉`);
      navigate(redirectPath);
    },
    onError: (error) => {
      console.error("❌ Google callback error:", error);
      toast.error(error.message || "Đăng nhập Google thất bại");
      localStorage.removeItem("redirectAfterLogin"); // Clean up
      navigate(`/login?error=${encodeURIComponent(error.message)}`);
    },
  });
};

// Đăng xuất
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // ✅ Clear auth data
      clearAuthData();
      
      // ✅ Clear toàn bộ cache
      queryClient.clear();
      
      // ✅ Dispatch custom event
      window.dispatchEvent(new Event('storage'));
      
      console.log("✅ Cache cleared and logged out");
      toast.success("Đã đăng xuất thành công");
      navigate('/login');
    },
    onError: (error) => {
      // ✅ Vẫn clear data dù API lỗi
      clearAuthData();
      queryClient.clear();
      window.dispatchEvent(new Event('storage'));
      
      console.error("Logout error:", error);
      toast.error("Đăng xuất không thành công, nhưng đã xóa session local");
      navigate('/login');
    }
  });
};

// ✅ BONUS: Hook để check auth status
export const useAuthStatus = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  return {
    isAuthenticated: !!token,
    user: user ? JSON.parse(user) : null,
  };
};