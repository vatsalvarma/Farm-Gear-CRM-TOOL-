'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Tractor, Calendar, Bell,
  BarChart3, CheckCircle, XCircle, Clock,
  Megaphone, Tag
} from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api/client'
import { equipmentApi } from '@/lib/api/equipment'
import { useAuthStore } from '@/lib/store/authStore'
import { formatCurrency } from '@/lib/utils'
import type { Equipment, PageResponse } from '@/types'

interface Analytics {
  totalUsers: number
  totalFarmers: number
  totalOwners: number
  totalEquipment: number
  pendingApprovals: number
  totalBookings: number
  completedBookings: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [pendingEquipment, setPendingEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [analyticsRes, pendingRes] = await Promise.allSettled([
      apiClient.get<Analytics>('/admin/analytics'),
      equipmentApi.getPendingApprovals(0, 10),
    ])
    if (analyticsRes.status === 'fulfilled') {
      setAnalytics(analyticsRes.value.data)
    } else {
      toast.error('Failed to load analytics')
    }
    if (pendingRes.status === 'fulfilled') {
      setPendingEquipment((pendingRes.value as PageResponse<Equipment>).content ?? [])
    } else {
      toast.error('Failed to load pending approvals')
    }
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    try {
      await equipmentApi.approve(id)
      toast.success('Equipment approved — now live on the marketplace!')
      loadData()
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleReject = async (id: string) => {
    const reason = window.prompt('Rejection reason (optional):')
    if (reason === null) return
    try {
      await equipmentApi.reject(id, reason || 'Does not meet listing standards')
      toast.success('Equipment rejected — owner has been notified')
      loadData()
    } catch {
      toast.error('Failed to reject')
    }
  }

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMsg) return
    setBroadcasting(true)
    try {
      await apiClient.post('/admin/broadcast', { title: broadcastTitle, body: broadcastMsg })
      toast.success('Notification broadcast sent')
      setBroadcastTitle('')
      setBroadcastMsg('')
    } catch { /* handled */ } finally {
      setBroadcasting(false)
    }
  }

  const statCards = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Farmers', value: analytics.totalFarmers, icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Owners', value: analytics.totalOwners, icon: Tractor, color: 'bg-brand-50 text-brand-600' },
    { label: 'Pending Approvals', value: analytics.pendingApprovals, icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Total Equipment', value: analytics.totalEquipment, icon: Tractor, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Bookings', value: analytics.totalBookings, icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Completed', value: analytics.completedBookings, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Revenue', value: formatCurrency(analytics.totalRevenue || 0), icon: BarChart3, color: 'bg-rose-50 text-rose-600' },
  ] : []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Platform overview and management</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 animate-pulse h-24 sm:h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {statCards.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm"
                  >
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${s.color}`}>
                      <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{s.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Pending Approvals */}
              <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Pending Equipment Approvals</h2>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                    {pendingEquipment.length} pending
                  </span>
                </div>
                {pendingEquipment.length === 0 ? (
                  <div className="p-8 sm:p-12 text-center text-gray-400">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                    All caught up!
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pendingEquipment.map(eq => (
                      <div key={eq.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {eq.images?.[0] ? (
                            <img src={eq.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tractor className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                          <div className="font-medium text-gray-900 truncate text-sm sm:text-base">{eq.title}</div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {eq.owner.fullName} · {eq.district}, {eq.state}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatCurrency(eq.pricePerDay)}/day
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleApprove(eq.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(eq.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Broadcast Notification */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone className="w-5 h-5 text-brand-600" />
                  <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Broadcast Notification</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                    <input
                      value={broadcastTitle}
                      onChange={e => setBroadcastTitle(e.target.value)}
                      placeholder="Announcement title"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                    <textarea
                      value={broadcastMsg}
                      onChange={e => setBroadcastMsg(e.target.value)}
                      rows={4}
                      placeholder="Write your announcement..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleBroadcast}
                    disabled={broadcasting || !broadcastTitle || !broadcastMsg}
                    className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium
                               hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed
                               transition-colors flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    {broadcasting ? 'Sending...' : 'Send to All Users'}
                  </button>
                </div>
              </div>
            </div>
    </div>
  )
}
