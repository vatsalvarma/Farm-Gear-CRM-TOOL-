import axios from 'axios'
import apiClient, { handleApiError } from './client'
import { UserRole } from '@/types'

export interface RegisterRequest {
  fullName: string
  email: string
  phone?: string
  password: string
  role: UserRole
  state?: string
  district?: string
  village?: string
  couponCode?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    fullName: string
    email: string
    phone?: string
    role: UserRole
    profilePhotoUrl?: string
    emailVerified: boolean
    phoneVerified?: boolean
    preferredLanguage: string
    kycCompleted?: boolean
  }
}

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data
        if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
          const msgs = Object.entries(data.validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ')
          throw new Error(msgs)
        }
      }
      throw new Error(handleApiError(error))
    }
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', { refreshToken })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Verify email with OTP
  verifyEmail: async (email: string, otp: string): Promise<void> => {
    try {
      await apiClient.post('/auth/verify-email', { email, otp })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Resend OTP
  resendOtp: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/resend-otp', { email })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', { email })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Reset password
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', { email, otp, newPassword })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
