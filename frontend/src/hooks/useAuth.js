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
      // 👇 [THÊM MỚI] Lưu thông tin user vào localStorage để dùng cho Comment
      // Giả sử API trả về data có dạng: { user: {...}, token: "..." }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
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

// Đăng nhập Google - Chỉ redirect
export const useGoogleLogin = () => {
  return {
    mutate: () => {
      loginWithGoogle(); 
    },
    isLoading: false, 
  };
};

// Xử lý Google Callback
export const useGoogleCallback = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const result = await handleGoogleCallback(); // Thêm await cho chắc chắn
      
      if (!result || !result.success) { // Kiểm tra kỹ hơn
        throw new Error(result?.error || 'Google login failed');
      }
      
      return result;
    },
    onSuccess: async (data) => {
      // 👇 [THÊM MỚI] Lưu thông tin user vào localStorage
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // ✅ Invalidate tất cả cache
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['profile'] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['my-teams'] }),
        queryClient.invalidateQueries({ queryKey: ['my-projects'] }),
        queryClient.invalidateQueries({ queryKey: ['my-activities'] }),
      ]);
      
      console.log("✅ All cache invalidated after Google login");
      
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
      // 👇 [THÊM MỚI] Xóa user khỏi localStorage khi đăng xuất
      localStorage.removeItem('user');
      // Nếu có lưu token riêng thì xóa luôn: localStorage.removeItem('token');

      // ✅ Clear toàn bộ cache
      queryClient.clear();
      console.log("✅ Cache cleared after logout");
      
      navigate('/login');
    },
  });
};