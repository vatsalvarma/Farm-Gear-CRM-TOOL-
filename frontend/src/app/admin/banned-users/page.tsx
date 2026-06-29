'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  ShieldBan, ShieldCheck, Search, Trash2,
  ChevronLeft, ChevronRight, AlertTriangle, X, Eye,
} from 'lucide-react'
import {
  getBannedUsers, unbanUser, deleteUser,
  type AdminUser,
} from '@/lib/api/admin'

// ── profile drawer ────────────────────────────────────────────────────────────
function ProfileDrawer({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const fields: [string, string | undefined][] = [
    ['Email',       user.email],
    ['Phone',       user.phone],
    ['Role',        user.role],
    ['State',       user.state],
    ['District',    user.district],
    ['Village',     user.village],
    ['Ban Reason',  user.suspensionReason],
    ['Banned At',   user.bannedAt ? new Date(user.bannedAt).toLocaleString() : undefined],
    ['Last Login',  user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'],
    ['Joined',      new Date(user.createdAt).toLocaleDateString()],
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-lg">
              {user.fullName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium mt-0.5">
                <ShieldBan className="w-3 h-3" /> Banned
              </span>
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
                <span className="text-sm text-gray-800 text-right break-words max-w-[60%]">{val}</span>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

// ── confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel,
}: {
  title: string; message: string; confirmLabel: string
  confirmClass: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
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

const roleColor: Record<string, string> = {
  OWNER:  'bg-blue-100 text-blue-700',
  FARMER: 'bg-green-100 text-green-700',
  ADMIN:  'bg-red-100 text-red-700',
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function BannedUsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([])
  const [loading,    setLoading]    = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalEl,    setTotalEl]    = useState(0)

  const [unbanTarget,  setUnbanTarget]  = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [profileUser,  setProfileUser]  = useState<AdminUser | null>(null)
  const [actionMsg,    setActionMsg]    = useState<string | null>(null)
  const [busy,         setBusy]         = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getBannedUsers({ role: roleFilter || undefined, page, size: 20 })
      .then(r => {
        setUsers(r.content)
        setTotalPages(r.totalPages)
        setTotalEl(r.totalElements)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [roleFilter, page])

  useEffect(() => { load() }, [load])

  const flash = (msg: string) => {
    setActionMsg(msg)
    setTimeout(() => setActionMsg(null), 3500)
  }

  const handleUnban = async () => {
    if (!unbanTarget) return
    setBusy(true)
    try {
      await unbanUser(unbanTarget.id)
      flash(`${unbanTarget.fullName} has been unbanned successfully.`)
      setUnbanTarget(null)
      load()
    } catch { flash('Failed to unban user. Please try again.') }
    finally { setBusy(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteUser(deleteTarget.id)
      flash(`${deleteTarget.fullName}'s account has been permanently deleted.`)
      setDeleteTarget(null)
      load()
    } catch { flash('Failed to delete user.') }
    finally { setBusy(false) }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldBan className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Banned Users</h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {totalEl.toLocaleString()} banned account{totalEl !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Role filter */}
        <div className="flex gap-2 flex-wrap">
          {(['', 'FARMER', 'OWNER'] as const).map(r => (
            <button key={r}
              onClick={() => { setRoleFilter(r); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                roleFilter === r
                  ? 'bg-red-600 text-white border-red-600'
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

      {/* Info banner */}
      <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Banned users are <strong>locked out</strong> from all sessions and cannot log in.
          Use the <strong>Unban</strong> button to restore access.
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_80px_1fr_160px] px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-50">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Ban Reason</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-100 rounded w-40" />
                  <div className="h-3 bg-gray-100 rounded w-56" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="font-medium text-gray-700">No banned users</p>
            <p className="text-sm text-gray-400 mt-1">
              {roleFilter ? `No banned ${roleFilter.toLowerCase()}s at the moment.` : 'All users are in good standing.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map(u => (
              <div key={u.id}
                className="px-4 py-3 bg-red-50/30 flex flex-col md:grid md:grid-cols-[1fr_1fr_80px_1fr_160px] items-start md:items-center gap-2 md:gap-4 hover:bg-red-50/60 transition-colors">

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center font-semibold text-sm text-red-700 flex-shrink-0">
                    {u.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{u.fullName}</div>
                    {u.bannedAt && (
                      <div className="text-xs text-gray-400">
                        Banned {new Date(u.bannedAt).toLocaleDateString()}
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

                {/* Ban reason */}
                <div className="hidden md:block text-xs text-red-600 truncate max-w-[200px]">
                  {u.suspensionReason || 'No reason specified'}
                </div>

                {/* Mobile chips */}
                <div className="flex flex-wrap gap-1.5 md:hidden">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span>
                  {u.suspensionReason && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 max-w-[200px] truncate">
                      {u.suspensionReason}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 md:justify-end w-full md:w-auto">
                  {/* View profile */}
                  <button title="View profile" onClick={() => setProfileUser(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </button>

                  {/* Unban */}
                  <button title="Unban user" onClick={() => setUnbanTarget(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Unban</span>
                  </button>

                  {/* Delete */}
                  <button title="Delete user" onClick={() => setDeleteTarget(u)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
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

      {/* Modals */}
      {unbanTarget && (
        <ConfirmModal
          title={`Unban ${unbanTarget.fullName}?`}
          message="Their account will be fully restored. They can log in again immediately."
          confirmLabel={busy ? 'Unbanning…' : 'Unban User'}
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleUnban}
          onCancel={() => setUnbanTarget(null)}
        />
      )}

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

      {profileUser && (
        <ProfileDrawer user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  )
}
