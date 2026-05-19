'use client'

import { useEffect, useState } from 'react'
import { Tractor, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { equipmentApi } from '@/lib/api/equipment'
import type { Equipment, PageResponse } from '@/types'

const statusColor: Record<string, string> = {
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-gray-100 text-gray-600',
}

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = () => {
    setLoading(true)
    equipmentApi.getPendingApprovals(page, 20)
      .then(r => {
        const res = r as PageResponse<Equipment>
        setEquipment(res.content)
        setTotalPages(res.totalPages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const approve = async (id: string) => {
    try { await equipmentApi.adminApprove(id); toast.success('Approved'); load() } catch {}
  }
  const reject = async (id: string) => {
    const reason = prompt('Rejection reason?')
    if (!reason) return
    try { await equipmentApi.adminReject(id, reason); toast.success('Rejected'); load() } catch {}
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve equipment listings</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : equipment.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            All caught up!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {equipment.map(eq => (
              <div key={eq.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tractor className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{eq.name}</div>
                  <div className="text-xs text-gray-500">{eq.category} · {eq.district}, {eq.state}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[eq.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {eq.status?.replace('_', ' ')}
                </span>
                {eq.status === 'PENDING_APPROVAL' && (
                  <div className="flex gap-2">
                    <button onClick={() => approve(eq.id)}
                      className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => reject(eq.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
