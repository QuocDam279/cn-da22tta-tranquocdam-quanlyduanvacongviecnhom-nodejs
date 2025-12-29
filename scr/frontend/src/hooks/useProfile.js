// src/hooks/useProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUsersByIds,
  findUserByEmail,
} from '../services/authService';

// ========================
// 🔧 HELPER FUNCTIONS
// ========================

/**
 * Sync user data với localStorage và dispatch event
 * để useAuth() hook có thể catch được changes
 */
const syncUserToLocalStorage = (userData) => {
  if (!userData) return;
  
  try {
    // ✅ Update localStorage
    const currentUser = localStorage.getItem('user');
    const parsedUser = currentUser ? JSON.parse(currentUser) : {};
    
    const updatedUser = {
      ...parsedUser,
      ...userData,
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // ✅ Dispatch custom event để useAuth() hook catch được
    window.dispatchEvent(new Event('storage'));
    
    console.log('✅ User data synced to localStorage:', updatedUser);
  } catch (error) {
    console.error('❌ Failed to sync user to localStorage:', error);
  }
};

// ========================
// 🟦 QUERY HOOKS (GET)
// ========================

/**
 * Lấy thông tin profile của user hiện tại
 * Auto cache 5 phút, retry 1 lần nếu fail
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // cache 5 phút
    retry: 1,
    onSuccess: (data) => {
      // ✅ Sync initial profile data với localStorage
      if (data?.user) {
        syncUserToLocalStorage(data.user);
      }
    },
  });
};

/**
 * Lấy thông tin nhiều user theo IDs
 * Dùng cho: hiển thị members, assigned users, etc.
 */
export const useUsersByIds = (ids = []) => {
  return useQuery({
    queryKey: ['users', ids],
    queryFn: () => getUsersByIds(ids),
    enabled: ids.length > 0,
    staleTime: 10 * 60 * 1000, // cache 10 phút
  });
};

/**
 * Tìm user theo email
 * Dùng cho: add members, assign tasks, etc.
 */
export const useFindUserByEmail = (email) => {
  return useQuery({
    queryKey: ['user', 'find', email],
    queryFn: () => findUserByEmail(email),
    enabled: !!email && email.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: false, // Không retry nếu không tìm thấy
  });
};

// ========================
// 🟩 MUTATION HOOKS (UPDATE)
// ========================

/**
 * Cập nhật profile (name, bio, etc.)
 * Auto sync với localStorage và invalidate related queries
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // ✅ 1. Update React Query cache
      queryClient.setQueryData(['profile'], (oldData) => ({
        ...oldData,
        user: data.user,
      }));
      
      // ✅ 2. Sync với localStorage
      syncUserToLocalStorage(data.user);
      
      // ✅ 3. Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      console.log('✅ Profile updated successfully');
    },
    onError: (error) => {
      console.error('❌ Profile update failed:', error);
    },
  });
};

/**
 * Upload avatar
 * Auto sync với localStorage và update all related caches
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      // ✅ 1. Update React Query cache
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
      
      // ✅ 2. Sync avatar với localStorage
      syncUserToLocalStorage({ avatar: data.avatar });
      
      // ✅ 3. Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      console.log('✅ Avatar uploaded successfully');
    },
    onError: (error) => {
      console.error('❌ Avatar upload failed:', error);
    },
  });
};

/**
 * Đổi mật khẩu
 * Không cần sync localStorage vì không thay đổi user info
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      console.log('✅ Password changed successfully');
    },
    onError: (error) => {
      console.error('❌ Password change failed:', error);
    },
  });
};

// ========================
// 🔄 UTILITY HOOKS
// ========================

/**
 * Hook để manual refetch profile
 * Dùng khi cần force refresh data
 */
export const useRefetchProfile = () => {
  const queryClient = useQueryClient();
  
  return () => {
    return queryClient.invalidateQueries({ queryKey: ['profile'] });
  };
};