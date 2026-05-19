import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@/types'

interface User {
  id: string
  fullName: string
  email: string
  phone?: string
  role: UserRole
  profilePhotoUrl?: string
  emailVerified: boolean
  phoneVerified: boolean
  preferredLanguage: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        // Also store in localStorage for API client
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (updates) => {
        set((state) => {
          if (!state.user) return state
          
          const updatedUser = { ...state.user, ...updates }
          localStorage.setItem('user', JSON.stringify(updatedUser))
          
          return {
            user: updatedUser,
          }
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
