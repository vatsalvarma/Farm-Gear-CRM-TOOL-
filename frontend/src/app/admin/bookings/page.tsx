'use client'

import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import apiClient from '@/lib/api/client'

interface Booking {
  id: string
  farmer: { fullName: string }
  equipment: { title: string }
  startDate: string
  endDate: string
  status: string
  totalAmount: number
}

const statusColor: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REJECTED: 'bg-red-100 text-red-600',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    apiClient.get(`/admin/bookings?page=${page}&size=20`)
      .then(r => { setBookings(r.data.content); setTotalPages(r.data.totalPages) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">All rental bookings on the platform</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No bookings yet
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.map(b => (
              <div key={b.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{b.equipment?.title}</div>
                  <div className="text-xs text-gray-500">by {b.farmer?.fullName} · {b.startDate} → {b.endDate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-gray-700">₹{b.totalAmount?.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded border disabled:opacity-40">Previous</button>
            <span>Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
