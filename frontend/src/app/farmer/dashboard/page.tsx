'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Tractor,
  Calendar,
  MessageCircle,
  Bell,
  TrendingUp,
  MapPin,
  Clock,
  Star,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { bookingsApi } from '@/lib/api/bookings'
import { equipmentApi } from '@/lib/api/equipment'

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [nearbyEquipment, setNearbyEquipment] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'FARMER') {
      router.push('/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings
      const bookingsData = await bookingsApi.getFarmerBookings(undefined, 0, 5)
      setRecentBookings(bookingsData.content || [])
      
      // Calculate stats
      const active = bookingsData.content?.filter((b: any) => 
        b.status === 'APPROVED' || b.status === 'ACTIVE'
      ).length || 0
      const completed = bookingsData.content?.filter((b: any) => 
        b.status === 'COMPLETED'
      ).length || 0
      const pending = bookingsData.content?.filter((b: any) => 
        b.status === 'PENDING'
      ).length || 0
      
      setStats({
        activeBookings: active,
        completedBookings: completed,
        pendingBookings: pending,
        totalSpent: 0, // Calculate from bookings
      })

      // Fetch nearby equipment if location available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const nearby = await equipmentApi.getNearby(
              position.coords.latitude,
              position.coords.longitude,
              50
            )
            setNearbyEquipment(nearby.slice(0, 4))
          },
          (error) => console.log('Location access denied')
        )
      }
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Here's what's happening with your bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              label: 'Active Bookings',
              value: stats.activeBookings,
              icon: Calendar,
              color: 'bg-blue-500',
            },
            {
              label: 'Pending Requests',
              value: stats.pendingBookings,
              icon: Clock,
              color: 'bg-yellow-500',
            },
            {
              label: 'Completed',
              value: stats.completedBookings,
              icon: TrendingUp,
              color: 'bg-green-500',
            },
            {
              label: 'Total Spent',
              value: `₹${stats.totalSpent}`,
              icon: Star,
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/farmer/bookings')}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/farmer/bookings/${booking.id}`)}
                  >
                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {booking.equipment.primaryImageUrl ? (
                        <img
                          src={booking.equipment.primaryImageUrl}
                          alt={booking.equipment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tractor className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {booking.equipment.title}
                      </h3>
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

          {/* Nearby Equipment */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Nearby Equipment</h2>
              <button
                onClick={() => router.push('/marketplace/nearby')}
                className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {nearbyEquipment.length === 0 ? (
                <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">
                  Enable location to see nearby equipment
                </p>
              ) : (
                nearbyEquipment.map((equipment) => (
                  <div
                    key={equipment.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/equipment/${equipment.id}`)}
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
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mt-1">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>
                          {equipment.distanceKm?.toFixed(1)} km away
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-medium">
                          {equipment.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-base sm:text-lg font-bold text-green-600">
                        ₹{equipment.pricePerDay}
                      </p>
                      <p className="text-xs text-gray-500">per day</p>
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
              title: 'Browse Equipment',
              description: 'Find the perfect equipment for your needs',
              icon: Tractor,
              action: () => router.push('/marketplace'),
              color: 'bg-green-600',
            },
            {
              title: 'My Bookings',
              description: 'View and manage your bookings',
              icon: Calendar,
              action: () => router.push('/farmer/bookings'),
              color: 'bg-blue-600',
            },
            {
              title: 'Messages',
              description: 'Chat with equipment owners',
              icon: MessageCircle,
              action: () => router.push('/farmer/messages'),
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
