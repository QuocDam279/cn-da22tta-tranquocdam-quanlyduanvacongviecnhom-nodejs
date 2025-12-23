import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register, login, logout, loginWithGoogle, handleGoogleCallback } from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Đăng ký
export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};

// Đăng nhập thường
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      // ✅ Invalidate tất cả cache liên quan
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['my-teams'] }),
        queryClient.invalidateQueries({ queryKey: ['my-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['my-activities'] }),
      ]);
      
      console.log("✅ All cache invalidated after login");
    },
  });
};

// Đăng nhập Google - Chỉ redirect, không cần mutation
export const useGoogleLogin = () => {
  return {
    mutate: () => {
      loginWithGoogle(); // Tự động redirect đến Google
    },
    isLoading: false, // Không có loading state vì redirect ngay
  };
};

// Xử lý Google Callback
export const useGoogleCallback = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const result = handleGoogleCallback();
      
      if (!result.success) {
        throw new Error(result.error || 'Google login failed');
      }
      
      return result;
    },
    onSuccess: async (data) => {
      // ✅ Invalidate tất cả cache sau khi Google login thành công
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['my-teams'] }),
        queryClient.invalidateQueries({ queryKey: ['my-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['my-activities'] }),
      ]);
      
      console.log("✅ All cache invalidated after Google login");
      
      // Redirect đến trang đã lưu hoặc dashboard
      navigate(data.redirectPath || '/dashboard');
    },
    onError: (error) => {
      console.error("❌ Google login error:", error);
      navigate(`/login?error=${error.message}`);
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
      // ✅ Clear toàn bộ cache
      queryClient.clear();
      console.log("✅ Cache cleared after logout");
      
      // Redirect về trang login
      navigate('/login');
    },
  });
};