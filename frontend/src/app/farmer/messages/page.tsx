'use client'

import { MessageCircle, Tractor } from 'lucide-react'
import Link from 'next/link'

export default function FarmerMessagesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <MessageCircle className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Coming Soon</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
          Real-time messaging with equipment owners will be available soon.
          For now, you can contact owners through your booking details.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/farmer/bookings"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            View My Bookings
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Tractor className="w-4 h-4" />
            Browse Equipment
          </Link>
        </div>
      </div>
    </div>
  )
}
