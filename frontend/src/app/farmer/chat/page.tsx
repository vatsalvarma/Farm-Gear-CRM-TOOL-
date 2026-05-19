'use client'

import { MessageCircle, Tractor } from 'lucide-react'
import Link from 'next/link'

export default function FarmerChatPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-brand-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Chat Coming Soon</h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Real-time messaging with equipment owners will be available soon.
          For now, you can contact owners through your booking details.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors"
        >
          <Tractor className="w-4 h-4" />
          Browse Equipment
        </Link>
      </div>
    </div>
  )
}
