import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@store/storage';
import { User, AuthState } from '@/types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string | null) => 
        set({ 
          user, 
          token, 
          isAuthenticated: !!token 
        }),

      logout: () => 
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        }),

      updateUser: (userData: User) => 
        set((state) => ({ 
          user: state.user ? { ...state.user, ...userData } : null
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
