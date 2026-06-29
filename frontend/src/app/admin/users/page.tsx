'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Users, Search, ShieldBan, ShieldCheck, Trash2,
  ChevronLeft, ChevronRight, AlertTriangle, X, Eye,
} from 'lucide-react'
import {
  getUsers, banUser, unbanUser, deleteUser,
  type AdminUser,
} from '@/lib/api/admin'

// ── small reusable confirm modal ──────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel, children,
}: {
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onCancel: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-[fadeInUp_0.2s_ease]">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        {children}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ user }: { user: AdminUser }) {
  if (user.suspended) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
        <ShieldBan className="w-3 h-3" /> Banned
      </span>
    )
  }
  if (user.active) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
        <ShieldCheck className="w-3 h-3" /> Active
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inactive</span>
  )
}

const roleColor: Record<string, string> = {
  ADMIN:  'bg-red-100 text-red-700',
  OWNER:  'bg-blue-100 text-blue-700',
  FARMER: 'bg-green-100 text-green-700',
}

// ── profile drawer ────────────────────────────────────────────────────────────
function ProfileDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const fields: [string, string | undefined][] = [
    ['Email',       user.email],
    ['Phone',       user.phone],
    ['Role',        user.role],
    ['State',       user.state],
    ['District',    user.district],
    ['Village',     user.village],
    ['Email Verified', user.emailVerified ? 'Yes' : 'No'],
    ['Last Login',  user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'],
    ['Joined',      new Date(user.createdAt).toLocaleDateString()],
    ['Ban Reason',  user.suspensionReason],
    ['Banned At',   user.bannedAt ? new Date(user.bannedAt).toLocaleString() : undefined],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto animate-[slideInRight_0.25s_ease]">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
              {user.fullName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <StatusBadge user={user} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {fields.map(([label, val]) =>
            val ? (
              <div key={label} className="flex justify-between gap-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
                <span className="text-sm text-gray-800 text-right">{val}</span>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalEl,    setTotalEl]    = useState(0)

  // modals
  const [banTarget,    setBanTarget]    = useState<AdminUser | null>(null)
  const [banReason,    setBanReason]    = useState('')
  const [unbanTarget,  setUnbanTarget]  = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [profileUser,  setProfileUser]  = useState<AdminUser | null>(null)
  const [actionMsg,    setActionMsg]    = useState<string | null>(null)
  const [busy,         setBusy]         = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getUsers({ search: search || undefined, role: roleFilter || undefined, page, size: 20 })
      .then(r => {
        setUsers(r.content)
        setTotalPages(r.totalPages)
        setTotalEl(r.totalElements)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, roleFilter, page])

  useEffect(() => { load() }, [load])

  const flash = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(null), 3500)
  }

  const handleBan = async () => {
    if (!banTarget) return
    setBusy(true)
    try {
      await banUser(banTarget.id, banReason || 'Violated platform policy')
      flash(`${banTarget.fullName} has been banned and logged out from all sessions.`)
      setBanTarget(null)
      setBanReason('')
      load()
    } catch { flash('Failed to ban user. Please try again.') }
    finally { setBusy(false) }
  }

  const handleUnban = async () => {
    if (!unbanTarget) return
    setBusy(true)
    try {
      await unbanUser(unbanTarget.id)
      flash(`${unbanTarget.fullName} has been unbanned.`)
      setUnbanTarget(null)
      load()
    } catch { flash('Failed to unban user.') }
    finally { setBusy(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteUser(deleteTarget.id)
      flash(`${deleteTarget.fullName}'s account has been deleted.`)
      setDeleteTarget(null)
      load()
    } catch { flash('Failed to delete user.') }
    finally { setBusy(false) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {totalEl.toLocaleString()} registered users
          </p>
        </div>
        {/* Role filter */}
        <div className="flex gap-2">
          {(['', 'FARMER', 'OWNER', 'ADMIN'] as const).map(r => (
            <button key={r}
              onClick={() => { setRoleFilter(r); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Flash message */}
      {actionMsg && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          {actionMsg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_80px_100px_160px] px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-50">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
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
              <div key={u.id}
                className={`px-4 py-3 flex flex-col md:grid md:grid-cols-[1fr_1fr_80px_100px_160px] items-start md:items-center gap-2 md:gap-4 transition-colors ${
                  u.suspended ? 'bg-red-50/40' : 'hover:bg-gray-50/60'
                }`}>

                {/* Name + avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                    u.suspended ? 'bg-red-100 text-red-700' : 'bg-brand-50 text-brand-700'
                  }`}>
                    {u.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.fullName}</div>
                    {u.suspended && u.suspensionReason && (
                      <div className="text-xs text-red-500 truncate mt-0.5">
                        Ban reason: {u.suspensionReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="text-xs text-gray-500 truncate hidden md:block">{u.email}</div>

                {/* Role */}
                <div className="hidden md:block">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden md:block">
                  <StatusBadge user={u} />
                </div>

                {/* Mobile: role + status inline */}
                <div className="flex flex-wrap gap-1.5 md:hidden">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  <StatusBadge user={u} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 md:justify-end w-full md:w-auto">
                  {/* View profile */}
                  <button
                    title="View profile"
                    onClick={() => setProfileUser(u)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Ban / Unban */}
                  {u.suspended ? (
                    <button
                      title="Unban user"
                      onClick={() => setUnbanTarget(u)}
                      className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    u.role !== 'ADMIN' && (
                      <button
                        title="Ban user"
                        onClick={() => { setBanTarget(u); setBanReason('') }}
                        className="p-1.5 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                        <ShieldBan className="w-4 h-4" />
                      </button>
                    )
                  )}

                  {/* Delete */}
                  {u.role !== 'ADMIN' && (
                    <button
                      title="Delete user"
                      onClick={() => setDeleteTarget(u)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Ban modal */}
      {banTarget && (
        <ConfirmModal
          title={`Ban ${banTarget.fullName}?`}
          message="This will immediately log them out from all active sessions. They won't be able to log in until unbanned."
          confirmLabel={busy ? 'Banning…' : 'Ban User'}
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleBan}
          onCancel={() => setBanTarget(null)}>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Ban Reason (optional)</label>
            <input
              type="text"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              placeholder="e.g. Spamming, Fake listing, Fraud…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        </ConfirmModal>
      )}

      {/* Unban modal */}
      {unbanTarget && (
        <ConfirmModal
          title={`Unban ${unbanTarget.fullName}?`}
          message="Their account will be restored and they'll be able to log in again."
          confirmLabel={busy ? 'Unbanning…' : 'Unban User'}
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleUnban}
          onCancel={() => setUnbanTarget(null)}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.fullName}?`}
          message="This will permanently soft-delete the account. This action cannot be undone."
          confirmLabel={busy ? 'Deleting…' : 'Delete Account'}
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Profile drawer */}
      {profileUser && (
        <ProfileDrawer user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  )
}
