'use client'

import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import apiClient from '@/lib/api/client'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  active: boolean
  emailVerified: boolean
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    setLoading(true)
    apiClient.get(`/admin/users?search=${search}&page=${page}&size=20`)
      .then(r => {
        setUsers(r.data.content)
        setTotalPages(r.data.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, page])

  const roleColor: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    OWNER: 'bg-blue-100 text-blue-700',
    FARMER: 'bg-green-100 text-green-700',
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage all registered users</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="flex-1 text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-100 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-60" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No users found
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map(u => (
              <div key={u.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center font-semibold text-brand-700">
                  {u.fullName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                  {u.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {u.active ? 'Active' : 'Inactive'}
                </span>
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
