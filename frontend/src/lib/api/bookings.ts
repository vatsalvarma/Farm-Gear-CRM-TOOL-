import apiClient, { handleApiError } from './client'
import { BookingStatus } from '@/types'

export interface BookingRequest {
  equipmentId: string
  startDate: string
  endDate: string
  farmerNote?: string
}

export interface Booking {
  id: string
  bookingReference: string
  status: BookingStatus
  startDate: string
  endDate: string
  totalAmount: number
  depositAmount?: number
  farmerNote?: string
  ownerNote?: string
  rejectionReason?: string
  approvedAt?: string
  createdAt: string
  equipment: {
    id: string
    title: string
    primaryImageUrl?: string
    district: string
    state: string
  }
  farmer: {
    id: string
    fullName: string
    profilePhotoUrl?: string
  }
  owner: {
    id: string
    fullName: string
    profilePhotoUrl?: string
  }
}

export const bookingsApi = {
  // Create booking request
  create: async (data: BookingRequest): Promise<Booking> => {
    try {
      const response = await apiClient.post('/farmer/bookings', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get farmer's bookings
  getFarmerBookings: async (
    status?: BookingStatus,
    page = 0,
    size = 10
  ): Promise<any> => {
    try {
      const response = await apiClient.get('/farmer/bookings', {
        params: { status, page, size },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get owner's bookings
  getOwnerBookings: async (
    status?: BookingStatus,
    page = 0,
    size = 10
  ): Promise<any> => {
    try {
      const response = await apiClient.get('/owner/bookings', {
        params: { status, page, size },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Approve booking (owner)
  approve: async (id: string, ownerNote?: string): Promise<Booking> => {
    try {
      const response = await apiClient.post(`/owner/bookings/${id}/approve`, {
        ownerNote,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Reject booking (owner)
  reject: async (id: string, reason: string): Promise<Booking> => {
    try {
      const response = await apiClient.post(`/owner/bookings/${id}/reject`, {
        reason,
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Complete booking (owner)
  complete: async (id: string): Promise<Booking> => {
    try {
      const response = await apiClient.post(`/owner/bookings/${id}/complete`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Cancel booking (both)
  cancel: async (id: string): Promise<Booking> => {
    try {
      const response = await apiClient.post(`/bookings/${id}/cancel`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get owner earnings
  getEarnings: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/owner/earnings')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}
