'use client'

import { useState } from 'react'
import { Bell, Globe, Shield } from 'lucide-react'

export default function OwnerSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [bookingAlerts, setBookingAlerts] = useState(true)

  const toggleItems = [
    { label: 'Email notifications', desc: 'Booking updates via email', value: emailNotifs, set: setEmailNotifs },
    { label: 'SMS notifications', desc: 'Booking updates via SMS', value: smsNotifs, set: setSmsNotifs },
    { label: 'Booking alerts', desc: 'Instant alert for new booking requests', value: bookingAlerts, set: setBookingAlerts },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="max-w-lg space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            {toggleItems.map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => item.set(!item.value)}
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${item.value ? 'bg-brand-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.value ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Language</h2>
          </div>
          <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="ENGLISH">English</option>
            <option value="TELUGU">Telugu</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Security</h2>
          </div>
          <button className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            Change Password →
          </button>
        </div>
      </div>
    </div>
  )
}
