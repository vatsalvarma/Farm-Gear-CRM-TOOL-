import apiClient from './client'

export interface AdminUser {
  id: string
  fullName: string
  email: string
  phone?: string
  role: 'FARMER' | 'OWNER' | 'ADMIN'
  active: boolean
  suspended: boolean
  suspensionReason?: string
  bannedAt?: string
  emailVerified: boolean
  phoneVerified: boolean
  state?: string
  district?: string
  village?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
}

// ── User listing ────────────────────────────────────────────────────────────

export async function getUsers(params: {
  search?: string
  role?: string
  page?: number
  size?: number
}): Promise<PageResponse<AdminUser>> {
  const { data } = await apiClient.get('/admin/users', { params })
  return data
}

export async function getUser(id: string): Promise<AdminUser> {
  const { data } = await apiClient.get(`/admin/users/${id}`)
  return data
}

export async function getBannedUsers(params: {
  role?: string
  page?: number
  size?: number
}): Promise<PageResponse<AdminUser>> {
  const { data } = await apiClient.get('/admin/users/banned', { params })
  return data
}

// ── Ban / Unban ─────────────────────────────────────────────────────────────

export async function banUser(id: string, reason: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/admin/users/${id}/ban`, { reason })
  return data
}

export async function unbanUser(id: string): Promise<{ message: string }> {
  const { data } = await apiClient.patch(`/admin/users/${id}/unban`)
  return data
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}

// ── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalytics(): Promise<Record<string, number>> {
  const { data } = await apiClient.get('/admin/analytics')
  return data
}
