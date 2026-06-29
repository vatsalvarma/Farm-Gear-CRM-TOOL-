'use client'

import { useEffect, useState } from 'react'
import { Bell, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import apiClient from '@/lib/api/client'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    apiClient.get('/notifications?page=0&size=30')
      .then(r => setNotifications(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const broadcast = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Fill in title and message'); return }
    setSending(true)
    try {
      await apiClient.post('/admin/broadcast', { title, message })
      toast.success('Broadcast sent!')
      setTitle(''); setMessage('')
    } catch {}
    finally { setSending(false) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Broadcast messages and notification history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 text-sm">Recent Notifications</div>
          {loading ? (
            <div className="p-8 sm:p-12 text-center text-gray-400">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-auto">
              {notifications.map(n => (
                <div key={n.id} className={`p-3 sm:p-4 ${n.read ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Bell className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 break-words">{n.message}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5 h-fit">
          <div className="flex items-center gap-2 mb-4 font-semibold text-gray-900 text-sm">
            <Megaphone className="w-4 h-4 text-brand-600" />
            Broadcast to All Users
          </div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement…"
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <button
              onClick={broadcast}
              disabled={sending}
              className="w-full bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send to All Users'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
