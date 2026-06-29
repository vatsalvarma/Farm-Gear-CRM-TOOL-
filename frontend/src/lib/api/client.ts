import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/backend'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api')

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// In-flight refresh promise — prevents multiple simultaneous refresh calls
let refreshPromise: Promise<string> | null = null

function syncTokensToZustand(accessToken: string, refreshToken: string) {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.state) {
      parsed.state.accessToken = accessToken
      parsed.state.refreshToken = refreshToken
      localStorage.setItem('auth-storage', JSON.stringify(parsed))
    }
  } catch {
    // Ignore parse errors
  }
}

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // Only intercept 401 (expired/missing token). 403 = forbidden, not expired.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Reuse an in-flight refresh to avoid multiple simultaneous refresh calls
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) throw new Error('No refresh token')

          refreshPromise = axios
            .post('/backend/auth/refresh', { refreshToken })
            .then((res) => {
              const { accessToken, refreshToken: newRefreshToken } = res.data
              localStorage.setItem('accessToken', accessToken)
              localStorage.setItem('refreshToken', newRefreshToken)
              // Keep Zustand auth-storage in sync so page reloads use fresh tokens
              syncTokensToZustand(accessToken, newRefreshToken)
              return accessToken
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const newAccessToken = await refreshPromise

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        refreshPromise = null
        // Only log out when the refresh token is definitively rejected (401/403).
        // Network errors or 5xx mean the backend is temporarily down — keep the
        // user logged in so they aren't kicked out during a server restart.
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined
        if (refreshStatus === 401 || refreshStatus === 403) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          localStorage.removeItem('auth-storage')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

// Helper function to handle API errors
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>
    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      'An unexpected error occurred'
    )
  }
  return 'An unexpected error occurred'
}

// Helper function to upload files
export async function uploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key])
    })
  }

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

// Helper function to upload multiple files
export async function uploadFiles(
  endpoint: string,
  files: File[],
  additionalData?: Record<string, any>
): Promise<any> {
  const formData = new FormData()
  
  files.forEach((file) => {
    formData.append('files', file)
  })

  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key])
    })
  }

  const response = await apiClient.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
