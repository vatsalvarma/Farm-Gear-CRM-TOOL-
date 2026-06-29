import apiClient, { handleApiError } from './client'

export interface KycData {
  userId?: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
  state?: string
  district?: string
  village?: string
  profilePhotoUrl?: string
  kycCompleted?: boolean
  kycStatus?: 'NOT_STARTED' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  kycId?: string
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
  // Address
  address?: string
  pincode?: string
  mandal?: string
  // Identity
  aadhaarNumber?: string
  panNumber?: string
  // Bank
  bankAccountHolderName?: string
  bankAccountNumber?: string
  ifscCode?: string
  bankName?: string
  // Owner extras
  companyName?: string
  gstNumber?: string
  businessAddress?: string
  // Doc flags
  aadhaarFrontUrl?: string
  aadhaarBackUrl?: string
  panCardUrl?: string
  passbookUrl?: string
  companyDocUrl?: string
  // Actual image data (admin only)
  aadhaarFrontData?: string
  aadhaarBackData?: string
  panCardData?: string
  passbookData?: string
  companyDocData?: string
}

export const kycApi = {
  /** Get current user's KYC record */
  getMyKyc: async (): Promise<KycData> => {
    const res = await apiClient.get('/kyc/me')
    return res.data
  },

  /** Save KYC text fields */
  saveKyc: async (data: Partial<KycData>): Promise<KycData> => {
    const res = await apiClient.post('/kyc/me', data)
    return res.data
  },

  /** Submit KYC for admin review */
  submitKyc: async (): Promise<{ message: string; status: string }> => {
    const res = await apiClient.post('/kyc/me/submit', {})
    return res.data
  },

  /** Upload a document image */
  uploadDoc: async (
    docType: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN' | 'PASSBOOK' | 'COMPANY' | 'PROFILE',
    file: File
  ): Promise<{ field: string; message: string }> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await apiClient.post(`/kyc/me/upload/${docType}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  // ── Admin ──────────────────────────────────────────────────────────────
  adminListKyc: async (status?: string): Promise<KycData[]> => {
    const url = '/kyc/admin/list' + (status ? `?status=${status}` : '')
    const res = await apiClient.get(url)
    return res.data
  },

  adminGetUserKyc: async (userId: string): Promise<KycData> => {
    const res = await apiClient.get(`/kyc/admin/user/${userId}`)
    return res.data
  },

  adminApprove: async (userId: string): Promise<{ message: string }> => {
    const res = await apiClient.patch(`/kyc/admin/user/${userId}/approve`, {})
    return res.data
  },

  adminReject: async (userId: string, reason: string): Promise<{ message: string }> => {
    const res = await apiClient.patch(`/kyc/admin/user/${userId}/reject`, { reason })
    return res.data
  },

  // ── Owner ──────────────────────────────────────────────────────────────
  ownerGetFarmerKyc: async (farmerId: string): Promise<KycData> => {
    const res = await apiClient.get(`/kyc/owner/farmer/${farmerId}`)
    return res.data
  },
}
