'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tractor, BarChart3, Plus, Calendar, TrendingUp, MessageCircle, Bell, User, Settings, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import KycBanner from '@/components/KycBanner'

const navItems = [
  { href: '/owner/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/owner/equipment/new', icon: Plus, label: 'Add Equipment' },
  { href: '/owner/equipment', icon: Tractor, label: 'My Equipment' },
  { href: '/owner/bookings', icon: Calendar, label: 'View Bookings' },
  { href: '/owner/earnings', icon: TrendingUp, label: 'View Earnings' },
  { href: '/owner/chat', icon: MessageCircle, label: 'Messages' },
  { href: '/owner/notifications', icon: Bell, label: 'Notifications' },
  { href: '/owner/profile', icon: User, label: 'Profile' },
  { href: '/owner/settings', icon: Settings, label: 'Settings' },
  { href: '/kyc', icon: Shield, label: 'KYC Verification' },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base">Farm Gear</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-3 sm:p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3 px-2 sm:px-3">
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.fullName?.charAt(0) ?? 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</div>
                <div className="text-xs text-gray-400 truncate">Equipment Owner</div>
              </div>
            </div>
            <button
              onClick={() => { clearAuth(); window.location.href = '/login' }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 sm:px-3 py-2 w-full rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto pt-16 lg:pt-0">
          <KycBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
