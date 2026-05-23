'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Tractor,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { equipmentApi } from '@/lib/api/equipment'
import { bookingsApi } from '@/lib/api/bookings'

export default function OwnerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeListings: 0,
    pendingApproval: 0,
    totalEarnings: 0,
    pendingBookings: 0,
    activeBookings: 0,
  })
  const [myEquipment, setMyEquipment] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch equipment
      const equipmentData = await equipmentApi.getMyListings(0, 10)
      setMyEquipment(equipmentData.content || [])
      
      // Calculate equipment stats
      const total = equipmentData.content?.length || 0
      const active = equipmentData.content?.filter((e: any) => 
        e.status === 'APPROVED'
      ).length || 0
      const pending = equipmentData.content?.filter((e: any) => 
        e.status === 'PENDING_APPROVAL'
      ).length || 0
      
      // Fetch bookings
      const bookingsData = await bookingsApi.getOwnerBookings(undefined, 0, 5)
      setRecentBookings(bookingsData.content || [])
      
      const pendingBookings = bookingsData.content?.filter((b: any) => 
        b.status === 'PENDING'
      ).length || 0
      const activeBookings = bookingsData.content?.filter((b: any) => 
        b.status === 'APPROVED' || b.status === 'ACTIVE'
      ).length || 0
      
      // Fetch earnings
      const earnings = await bookingsApi.getEarnings()
      
      setStats({
        totalEquipment: total,
        activeListings: active,
        pendingApproval: pending,
        totalEarnings: earnings || 0,
        pendingBookings,
        activeBookings,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your equipment and bookings</p>
            </div>
            <button
              onClick={() => router.push('/owner/equipment/new')}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: 'Total Equipment',
              value: stats.totalEquipment,
              icon: Tractor,
              color: 'bg-blue-500',
            },
            {
              label: 'Active Listings',
              value: stats.activeListings,
              icon: CheckCircle,
              color: 'bg-green-500',
            },
            {
              label: 'Pending Approval',
              value: stats.pendingApproval,
              icon: Clock,
              color: 'bg-yellow-500',
            },
            {
              label: 'Total Earnings',
              value: `₹${stats.totalEarnings.toLocaleString()}`,
              icon: DollarSign,
              color: 'bg-purple-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Booking Alerts */}
        {stats.pendingBookings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8"
          >
            <div className="flex items-start sm:items-center gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-yellow-900 text-sm sm:text-base">
                  You have {stats.pendingBookings} pending booking request{stats.pendingBookings > 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => router.push('/owner/bookings?status=PENDING')}
                  className="text-yellow-700 hover:text-yellow-800 text-xs sm:text-sm font-medium mt-1"
                >
                  Review now →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* My Equipment */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Equipment</h2>
              <button
                onClick={() => router.push('/owner/equipment')}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {myEquipment.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <Tractor className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">No equipment listed yet</p>
                  <button
                    onClick={() => router.push('/owner/equipment/new')}
                    className="text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
                  >
                    Add your first equipment →
                  </button>
                </div>
              ) : (
                myEquipment.slice(0, 5).map((equipment) => (
                  <div
                    key={equipment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/owner/equipment/${equipment.id}`)}
                  >
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {equipment.images[0] ? (
                        <img
                          src={equipment.images[0].imageUrl}
                          alt={equipment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tractor className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{equipment.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{equipment.category}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                          equipment.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : equipment.status === 'PENDING_APPROVAL'
                            ? 'bg-yellow-100 text-yellow-700'
                            : equipment.status === 'DRAFT'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {equipment.status}
                      </span>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{equipment.pricePerDay}
                      </p>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/owner/bookings')}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/owner/bookings/${booking.id}`)}
                  >
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {booking.equipment.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        by {booking.farmer.fullName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {booking.startDate} - {booking.endDate}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                          booking.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        ₹{booking.totalAmount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              title: 'Add Equipment',
              description: 'List new equipment for rent',
              icon: Plus,
              action: () => router.push('/owner/equipment/new'),
              color: 'bg-green-600',
            },
            {
              title: 'View Bookings',
              description: 'Manage booking requests',
              icon: Calendar,
              action: () => router.push('/owner/bookings'),
              color: 'bg-blue-600',
            },
            {
              title: 'View Earnings',
              description: 'Track your income',
              icon: TrendingUp,
              action: () => router.push('/owner/earnings'),
              color: 'bg-purple-600',
            },
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={action.action}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className={`${action.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-xs sm:text-sm">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
