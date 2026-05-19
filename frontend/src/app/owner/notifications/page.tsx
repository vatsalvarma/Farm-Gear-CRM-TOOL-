'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import apiClient from '@/lib/api/client'
import type { Notification, PageResponse } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/notifications?page=0&size=30')
      .then(r => setNotifications(((r.data as PageResponse<Notification>).content) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markAllRead = async () => {
    await apiClient.patch('/notifications/read-all').catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const markRead = async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500 mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
            <CheckCheck className="w-4 h-4" />Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-brand-50/40' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-brand-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{n.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{n.body}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
