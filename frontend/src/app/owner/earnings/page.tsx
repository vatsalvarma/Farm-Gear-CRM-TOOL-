'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle2,
  Calendar,
  Tractor,
  RefreshCw,
  Timer,
  Sun,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { bookingsApi, Booking } from '@/lib/api/bookings'

interface EarningsSummary {
  totalReceived: number
  pendingCollection: number
  depositPending: number
  completedBookings: number
  activeBookings: number
  perDayEarned: number
  perHourEarned: number
}

export default function OwnerEarningsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [allBookings, setAllBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<EarningsSummary>({
    totalReceived: 0,
    pendingCollection: 0,
    depositPending: 0,
    completedBookings: 0,
    activeBookings: 0,
    perDayEarned: 0,
    perHourEarned: 0,
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [earningsRes, bookingsRes] = await Promise.allSettled([
        bookingsApi.getEarnings(),
        bookingsApi.getOwnerBookings(undefined, 0, 100),
      ])

      const bookings: Booking[] = bookingsRes.status === 'fulfilled'
        ? (bookingsRes.value?.content || [])
        : []

      setAllBookings(bookings)

      const completed = bookings.filter(b => b.status === 'COMPLETED')
      const active = bookings.filter(b => b.status === 'APPROVED' || b.status === 'ACTIVE')

      const totalReceived = earningsRes.status === 'fulfilled'
        ? Number(earningsRes.value) || completed.reduce((s, b) => s + b.totalAmount, 0)
        : completed.reduce((s, b) => s + b.totalAmount, 0)

      const pendingCollection = active.reduce((s, b) => s + b.totalAmount, 0)
      const depositPending = active.reduce((s, b) => s + (b.depositAmount || 0), 0)

      const daysBetween = (start: string, end: string) =>
        Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000))

      const perDayEarned = completed.reduce((s, b) => {
        const days = daysBetween(b.startDate, b.endDate)
        return s + (days > 0 ? b.totalAmount / days : b.totalAmount)
      }, 0)

      const perHourEarned = perDayEarned / 24

      setSummary({
        totalReceived,
        pendingCollection,
        depositPending,
        completedBookings: completed.length,
        activeBookings: active.length,
        perDayEarned,
        perHourEarned,
      })
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) =>
    `₹${Math.round(n).toLocaleString('en-IN')}`

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED')
  const activeBookings = allBookings.filter(b => b.status === 'APPROVED' || b.status === 'ACTIVE')
  const pendingBookings = allBookings.filter(b => b.status === 'PENDING')

  const statCards = [
    {
      label: 'Total Received',
      value: fmt(summary.totalReceived),
      sub: `${summary.completedBookings} completed bookings`,
      icon: CheckCircle2,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      border: 'border-green-100',
    },
    {
      label: 'Pending Collection',
      value: fmt(summary.pendingCollection),
      sub: `${summary.activeBookings} active/approved bookings`,
      icon: Clock,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Deposit Pending',
      value: fmt(summary.depositPending),
      sub: 'Deposits not yet collected',
      icon: Wallet,
      bg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      border: 'border-orange-100',
    },
    {
      label: 'Avg. Per Day',
      value: fmt(summary.perDayEarned),
      sub: 'Average daily earning per booking',
      icon: Sun,
      bg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      border: 'border-purple-100',
    },
    {
      label: 'Avg. Per Hour',
      value: fmt(summary.perHourEarned),
      sub: 'Average hourly earning per booking',
      icon: Timer,
      bg: 'bg-pink-50',
      iconColor: 'text-pink-600',
      border: 'border-pink-100',
    },
    {
      label: 'Total Earnings (All Time)',
      value: fmt(summary.totalReceived + summary.pendingCollection),
      sub: 'Received + pending',
      icon: TrendingUp,
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      border: 'border-yellow-100',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Earnings Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your income from equipment rentals</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`${card.bg} border ${card.border} rounded-xl p-3 sm:p-5`}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">{card.label}</p>
              <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconColor} flex-shrink-0 ml-1`} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Pending Deposits Alert */}
      {pendingBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {pendingBookings.length} booking{pendingBookings.length > 1 ? 's' : ''} awaiting your review
            </p>
            <button
              onClick={() => router.push('/owner/bookings?status=PENDING')}
              className="text-xs text-yellow-700 hover:text-yellow-900 font-medium mt-0.5"
            >
              Review now →
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Received Payments
            </h2>
            <span className="text-xs text-gray-400">{completedBookings.length} bookings</span>
          </div>
          <div className="divide-y divide-gray-50">
            {completedBookings.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No completed bookings yet</p>
            ) : (
              completedBookings.slice(0, 8).map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded overflow-hidden">
                    {b.equipment.primaryImageUrl
                      ? <img src={b.equipment.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Tractor className="w-4 h-4 text-gray-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.equipment.title}</p>
                    <p className="text-xs text-gray-400">{b.farmer.fullName} · {formatDate(b.endDate)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-green-600">+{fmt(b.totalAmount)}</p>
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-medium">Received</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending / Active Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Pending & Active
            </h2>
            <span className="text-xs text-gray-400">{activeBookings.length} bookings</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activeBookings.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No active bookings</p>
            ) : (
              activeBookings.slice(0, 8).map(b => (
                <div key={b.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded overflow-hidden">
                    {b.equipment.primaryImageUrl
                      ? <img src={b.equipment.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Tractor className="w-4 h-4 text-gray-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.equipment.title}</p>
                    <p className="text-xs text-gray-400">
                      {b.farmer.fullName} · {formatDate(b.startDate)} – {formatDate(b.endDate)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-600">{fmt(b.totalAmount)}</p>
                    {b.depositAmount ? (
                      <p className="text-[10px] text-orange-600">Deposit: {fmt(b.depositAmount)}</p>
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        b.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                      }`}>{b.status}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
