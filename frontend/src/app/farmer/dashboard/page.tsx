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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/farmer/bookings')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/farmer/bookings/${booking.id}`)}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {booking.equipment.primaryImageUrl ? (
                        <img
                          src={booking.equipment.primaryImageUrl}
                          alt={booking.equipment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tractor className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {booking.equipment.title}
                      </h3>
                      <p className="text-sm text-gray-600">
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
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{booking.totalAmount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby Equipment */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Nearby Equipment</h2>
              <button
                onClick={() => router.push('/marketplace/nearby')}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {nearbyEquipment.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Enable location to see nearby equipment
                </p>
              ) : (
                nearbyEquipment.map((equipment) => (
                  <div
                    key={equipment.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/equipment/${equipment.id}`)}
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      {equipment.images[0] ? (
                        <img
                          src={equipment.images[0].imageUrl}
                          alt={equipment.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tractor className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{equipment.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {equipment.distanceKm?.toFixed(1)} km away
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {equipment.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
              className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
