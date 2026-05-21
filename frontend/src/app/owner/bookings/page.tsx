'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Tractor,
  User,
  IndianRupee,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { bookingsApi, Booking } from '@/lib/api/bookings'
import { BookingStatus } from '@/types'

const STATUS_TABS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING:   { label: 'Pending',   classes: 'bg-yellow-100 text-yellow-700' },
  APPROVED:  { label: 'Approved',  classes: 'bg-green-100 text-green-700' },
  ACTIVE:    { label: 'Active',    classes: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', classes: 'bg-purple-100 text-purple-700' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-600' },
  REJECTED:  { label: 'Rejected',  classes: 'bg-red-100 text-red-700' },
}

export default function OwnerBookingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const PAGE_SIZE = 10

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    fetchBookings()
  }, [activeTab, page])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const status = activeTab === 'ALL' ? undefined : activeTab
      const data = await bookingsApi.getOwnerBookings(status, page, PAGE_SIZE)
      setBookings(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: BookingStatus | 'ALL') => {
    setActiveTab(tab)
    setPage(0)
  }

  const filteredBookings = bookings.filter((b) =>
    search
      ? b.equipment.title.toLowerCase().includes(search.toLowerCase()) ||
        b.farmer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        b.bookingReference?.toLowerCase().includes(search.toLowerCase())
      : true
  )

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalElements} booking{totalElements !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                {pendingCount} pending review
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by farmer name, equipment, or booking reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'ALL'
              ? 'No farmers have booked your equipment yet.'
              : `No ${activeTab.toLowerCase()} bookings.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Equipment image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {booking.equipment.primaryImageUrl ? (
                      <img
                        src={booking.equipment.primaryImageUrl}
                        alt={booking.equipment.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tractor className="w-7 h-7 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.equipment.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {booking.equipment.district}, {booking.equipment.state}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig[booking.status]?.classes ?? 'bg-gray-100 text-gray-600'}`}>
                        {statusConfig[booking.status]?.label ?? booking.status}
                      </span>
                    </div>

                    {/* Farmer info */}
                    <div className="mt-3 flex items-center gap-3 flex-wrap text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          {booking.farmer.profilePhotoUrl ? (
                            <img src={booking.farmer.profilePhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-green-600" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{booking.farmer.fullName}</span>
                      </div>
                      {booking.bookingReference && (
                        <span className="font-mono text-xs text-gray-400">#{booking.bookingReference}</span>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span>
                    </div>

                    {booking.farmerNote && (
                      <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded px-2 py-1">
                        "{booking.farmerNote}"
                      </p>
                    )}

                    {booking.rejectionReason && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {booking.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Amount + actions */}
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center justify-end gap-0.5 text-lg font-bold text-gray-900">
                      <IndianRupee className="w-4 h-4" />
                      {booking.totalAmount.toLocaleString('en-IN')}
                    </div>
                    {booking.depositAmount ? (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Deposit: ₹{booking.depositAmount.toLocaleString('en-IN')}
                      </p>
                    ) : null}

                    {booking.status === 'PENDING' && (
                      <div className="mt-3 flex flex-col gap-1.5">
                        <button
                          onClick={() => router.push(`/owner/bookings/${booking.id}`)}
                          className="flex items-center justify-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
