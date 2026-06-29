import apiClient from './client'

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  state: string
  district: string
  village: string
  profilePhotoUrl: string
  emailVerified: boolean
  preferredLanguage: string
  kycCompleted?: boolean
}

const getData = (r: { data: unknown }) => r.data as UserProfile

export const userApi = {
  getMe: () => apiClient.get('/users/me').then(getData),

  updateProfile: (body: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'state' | 'district' | 'village' | 'preferredLanguage'>>) =>
    apiClient.patch('/users/me', body).then(getData),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient
      .post('/users/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data as { profilePhotoUrl: string })
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/users/me/change-password', { currentPassword, newPassword })
      .then(r => r.data as { message: string }),

  requestEmailChange: (newEmail: string) =>
    apiClient.post('/users/me/request-email-change', { newEmail })
      .then(r => r.data as { message: string }),

  confirmEmailChange: (newEmail: string, otp: string) =>
    apiClient.post('/users/me/confirm-email-change', { newEmail, otp })
      .then(r => r.data as { message: string }),
}
