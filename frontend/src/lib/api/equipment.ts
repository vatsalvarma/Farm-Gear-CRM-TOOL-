import apiClient, { handleApiError, uploadFiles } from './client'
import { Equipment, EquipmentCategory, FuelType, EquipmentStatus } from '@/types'

export interface EquipmentRequest {
  title: string
  description: string
  category: EquipmentCategory
  brand: string
  fuelType?: FuelType
  modelNumber?: string
  pricePerHour: number
  pricePerDay: number
  depositAmount?: number
  minRentalDurationHours?: number
  state: string
  district: string
  village?: string
  address: string
  latitude?: number
  longitude?: number
  specifications?: string
  availableFrom?: string
  availableTo?: string
}

export interface SearchParams {
  category?: EquipmentCategory
  brand?: string
  fuelType?: FuelType
  state?: string
  district?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: string
  page?: number
  size?: number
}

export const equipmentApi = {
  // Create equipment listing
  create: async (data: EquipmentRequest): Promise<Equipment> => {
    try {
      const response = await apiClient.post('/owner/equipment', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update equipment listing
  update: async (id: string, data: EquipmentRequest): Promise<Equipment> => {
    try {
      const response = await apiClient.put(`/owner/equipment/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Upload equipment images
  uploadImages: async (id: string, files: File[]): Promise<Equipment> => {
    try {
      return await uploadFiles(`/owner/equipment/${id}/images`, files)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Submit for approval
  submitForApproval: async (id: string): Promise<Equipment> => {
    try {
      const response = await apiClient.post(`/owner/equipment/${id}/submit`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete equipment
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/owner/equipment/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get owner's equipment listings
  getMyListings: async (page = 0, size = 10): Promise<any> => {
    try {
      const response = await apiClient.get('/owner/equipment', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Search marketplace
  search: async (params: SearchParams): Promise<any> => {
    try {
      const response = await apiClient.get('/marketplace', { params })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get nearby equipment
  getNearby: async (lat: number, lng: number, radiusKm = 50): Promise<Equipment[]> => {
    try {
      const response = await apiClient.get('/marketplace/nearby', {
        params: { lat, lng, radiusKm },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get equipment by ID
  getById: async (id: string): Promise<Equipment> => {
    try {
      const response = await apiClient.get(`/equipment/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Admin: Get pending approvals
  getPendingApprovals: async (page = 0, size = 10): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/equipment/pending', {
        params: { page, size },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Admin: Approve equipment
  approve: async (id: string, adminNote?: string): Promise<Equipment> => {
    try {
      const response = await apiClient.post(`/admin/equipment/${id}/approve`, {
        adminNote,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Admin: Reject equipment
  reject: async (id: string, reason: string): Promise<Equipment> => {
    try {
      const response = await apiClient.post(`/admin/equipment/${id}/reject`, {
        reason,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
