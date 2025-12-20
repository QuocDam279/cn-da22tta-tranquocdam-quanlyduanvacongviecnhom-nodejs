// src/hooks/useProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUsersByIds,      // ✅ Thêm
  findUserByEmail,    // ✅ Thêm
} from '../services/authService';


// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

// Lấy thông tin profile của user hiện tại
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // cache 5 phút
    retry: 1,
  });
};

// ✅ Lấy thông tin nhiều user theo IDs
export const useUsersByIds = (ids = []) => {
  return useQuery({
    queryKey: ['users', ids],
    queryFn: () => getUsersByIds(ids),
    enabled: ids.length > 0, // chỉ chạy khi có IDs
    staleTime: 10 * 60 * 1000, // cache 10 phút (thông tin user ít thay đổi)
  });
};

// ✅ Tìm user theo email (dùng cho tìm kiếm bạn bè)
export const useFindUserByEmail = (email) => {
  return useQuery({
    queryKey: ['user', 'find', email],
    queryFn: () => findUserByEmail(email),
    enabled: !!email && email.length > 0, // chỉ chạy khi có email
    staleTime: 2 * 60 * 1000, // cache 2 phút
    retry: false, // không retry nếu không tìm thấy
  });
};


// ========================
// 🟩 MUTATION HOOKS (UPDATE)
// ========================

// Cập nhật tên người dùng
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], (oldData) => ({
        ...oldData,
        user: data.user,
      }));
    },
  });
};

// Upload avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          user: {
            ...oldData.user,
            avatar: data.avatar,
          },
        };
      });
    },
  });
};

// Đổi mật khẩu
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};