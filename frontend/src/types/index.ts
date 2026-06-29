export type UserRole = 'FARMER' | 'OWNER' | 'ADMIN'
export type Language = 'ENGLISH' | 'TELUGU'

export type EquipmentCategory =
  | 'TRACTOR' | 'HARVESTER' | 'PLOUGH' | 'SEEDER' | 'SPRAYER'
  | 'IRRIGATION_PUMP' | 'THRESHER' | 'CULTIVATOR' | 'ROTAVATOR'
  | 'POWER_TILLER' | 'COMBINE_HARVESTER' | 'RICE_TRANSPLANTER'
  | 'POTATO_PLANTER' | 'SUGARCANE_HARVESTER' | 'OTHER'

export type FuelType = 'DIESEL' | 'PETROL' | 'ELECTRIC' | 'MANUAL' | 'SOLAR'

export type EquipmentStatus =
  | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'ARCHIVED'

export type AvailabilityStatus = 'AVAILABLE' | 'IN_USE' | 'UNDER_MAINTENANCE' | 'UNAVAILABLE'

export type BookingStatus =
  | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type MessageType = 'TEXT' | 'VOICE_NOTE' | 'IMAGE' | 'DOCUMENT'

export type NotificationType =
  | 'BOOKING_REQUEST' | 'BOOKING_APPROVED' | 'BOOKING_REJECTED' | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED' | 'LISTING_APPROVED' | 'LISTING_REJECTED' | 'NEW_MESSAGE'
  | 'SUBSCRIPTION_EXPIRY' | 'REVIEW_RECEIVED' | 'ADMIN_ANNOUNCEMENT' | 'SYSTEM'

export interface EquipmentImage {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  sortOrder: number
  primary: boolean
}

export interface OwnerSummary {
  id: string
  fullName: string
  profilePhotoUrl?: string
  district?: string
  state?: string
}

export interface Equipment {
  id: string
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
  status: EquipmentStatus
  availabilityStatus?: AvailabilityStatus
  adminNote?: string
  availableFrom?: string
  availableTo?: string
  specifications?: string
  featured: boolean
  averageRating: number
  totalReviews: number
  totalBookings: number
  images: EquipmentImage[]
  owner: OwnerSummary
  createdAt: string
  distanceKm?: number
}

export interface UserSummary {
  id: string
  fullName: string
  profilePhotoUrl?: string
}

export interface EquipmentSummary {
  id: string
  title: string
  primaryImageUrl?: string
  district: string
  state: string
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
  equipment: EquipmentSummary
  farmer: UserSummary
  owner: UserSummary
}

export interface Message {
  id: string
  content?: string
  messageType: MessageType
  mediaUrl?: string
  mediaDurationSeconds?: number
  read: boolean
  readAt?: string
  createdAt: string
  sender: UserSummary & { profilePhotoUrl?: string }
  receiver: UserSummary & { profilePhotoUrl?: string }
}

export interface ConversationSummary {
  userId: string
  fullName: string
  profilePhotoUrl?: string
  district?: string
  lastMessage?: string
  lastMessageTime?: string
  lastMessageType?: string
  hasUnread: boolean
}

export interface Notification {
  id: string
  title: string
  body: string
  type: NotificationType
  referenceId?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface Review {
  id: string
  rating: number
  comment?: string
  approved: boolean
  createdAt: string
  farmer: UserSummary
}

export interface Subscription {
  id: string
  plan: 'FREE_TRIAL' | 'ANNUAL'
  startDate: string
  expiryDate: string
  active: boolean
  amountPaid?: number
}
