import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@store/storage';
import { secureStorage } from '@store/secureStorage';
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
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const baseState = mmkvStorage.getItem(name);
          const token = await secureStorage.getItem(`${name}-token`);
          
          if (!baseState) return null;
          
          try {
            const parsed = JSON.parse(baseState);
            return JSON.stringify({
              ...parsed,
              state: {
                ...parsed.state,
                token: token,
              },
            });
          } catch {
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            const parsed = JSON.parse(value);
            const token = parsed.state.token;
            
            // Save token securely
            if (token) {
              await secureStorage.setItem(`${name}-token`, token);
            } else {
              await secureStorage.removeItem(`${name}-token`);
            }
            
            const stateToPersist = {
              ...parsed,
              state: {
                ...parsed.state,
                token: null,
              },
            };
            
            mmkvStorage.setItem(name, JSON.stringify(stateToPersist));
          } catch (error) {
            console.error('AuthStore setItem error:', error);
          }
        },
        removeItem: async (name) => {
          mmkvStorage.removeItem(name);
          await secureStorage.removeItem(`${name}-token`);
        },
      })),
    }
  )
);
