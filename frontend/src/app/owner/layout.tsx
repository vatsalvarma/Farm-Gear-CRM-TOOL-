'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tractor, BarChart3, Plus, MessageCircle, Bell, User, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'

const navItems = [
  { href: '/owner/dashboard', icon: BarChart3, label: 'Dashboard' },
  { href: '/owner/equipment/new', icon: Plus, label: 'Add Equipment' },
  { href: '/owner/chat', icon: MessageCircle, label: 'Messages' },
  { href: '/owner/notifications', icon: Bell, label: 'Notifications' },
  { href: '/owner/profile', icon: User, label: 'Profile' },
  { href: '/owner/settings', icon: Settings, label: 'Settings' },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, clearAuth } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Tractor className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Farm Gear</span>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3 px-3">
              <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.fullName?.charAt(0) ?? 'O'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</div>
                <div className="text-xs text-gray-400 truncate">Equipment Owner</div>
              </div>
            </div>
            <button
              onClick={() => { clearAuth(); window.location.href = '/login' }}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-2 w-full rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
