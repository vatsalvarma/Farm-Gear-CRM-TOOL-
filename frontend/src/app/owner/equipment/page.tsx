'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Tractor,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  MapPin,
  ImageOff,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/authStore'
import { equipmentApi } from '@/lib/api/equipment'
import type { Equipment } from '@/types'

const statusConfig: Record<string, { label: string; classes: string; icon: React.ElementType; desc: string }> = {
  APPROVED: {
    label: 'Approved – Live',
    classes: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    desc: 'Your listing is visible in the marketplace.',
  },
  PENDING_APPROVAL: {
    label: 'Pending Review',
    classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    desc: 'Admin is reviewing your listing.',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    desc: 'Your listing was rejected. See reason below and resubmit.',
  },
  DRAFT: {
    label: 'Draft',
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: FileText,
    desc: 'Not yet submitted for review.',
  },
  SUSPENDED: {
    label: 'Suspended',
    classes: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle,
    desc: 'This listing has been suspended.',
  },
}

export default function OwnerEquipmentPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') router.push('/login')
  }, [isAuthenticated, user, router])

  useEffect(() => {
    load()
  }, [page])

  const load = () => {
    setLoading(true)
    equipmentApi.getMyListings(page, 12)
      .then(r => {
        setEquipment(r.content || [])
        setTotalPages(r.totalPages || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const resubmit = async (id: string) => {
    try {
      await equipmentApi.submitForApproval(id)
      toast.success('Resubmitted for admin review!')
      load()
    } catch {
      toast.error('Failed to resubmit')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Equipment</h1>
          <p className="text-sm text-gray-500 mt-1">{equipment.length} listing{equipment.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push('/owner/equipment/new')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : equipment.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center">
          <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No equipment listed yet</h3>
          <p className="text-gray-400 text-sm mb-6">Add your first piece of equipment to start renting.</p>
          <button
            onClick={() => router.push('/owner/equipment/new')}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {equipment.map((eq, index) => {
            const cfg = statusConfig[eq.status] ?? statusConfig.DRAFT
            const StatusIcon = cfg.icon
            return (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-4 flex items-start gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {eq.images && eq.images.length > 0 ? (
                      <img src={eq.images[0].imageUrl} alt={eq.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <ImageOff className="w-6 h-6 text-gray-300" />
                        <span className="text-[9px] text-gray-300">No image</span>
                      </div>
                    )}
                  </div>
                  {eq.images && eq.images.length > 1 && (
                    <span className="text-[10px] text-gray-400 -mt-1 ml-1">{eq.images.length} photos</span>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{eq.title}</h3>
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.classes}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      <span>{eq.category?.replace(/_/g, ' ')} · {eq.brand}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{eq.district}, {eq.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />{eq.pricePerDay?.toLocaleString('en-IN')}/day
                        {eq.pricePerHour ? ` · ₹${eq.pricePerHour.toLocaleString('en-IN')}/hr` : ''}
                      </span>
                    </div>

                    {/* Status description */}
                    <p className="mt-1.5 text-xs text-gray-400">{cfg.desc}</p>

                    {/* Rejection reason from admin */}
                    {eq.status === 'REJECTED' && eq.adminNote && (
                      <div className="mt-2 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-red-700">Admin note: </span>
                          <span className="text-xs text-red-600">{eq.adminNote}</span>
                        </div>
                      </div>
                    )}

                    {/* Admin note for approved */}
                    {eq.status === 'APPROVED' && eq.adminNote && (
                      <div className="mt-2 flex items-start gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-green-700">{eq.adminNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {eq.status === 'REJECTED' && (
                      <button
                        onClick={() => resubmit(eq.id)}
                        className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        Fix &amp; Resubmit
                      </button>
                    )}
                    {eq.status === 'DRAFT' && (
                      <button
                        onClick={() => resubmit(eq.id)}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                      >
                        Submit for Review
                      </button>
                    )}
                    {eq.status === 'APPROVED' && (
                      <a
                        href={`/marketplace?id=${eq.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-2 rounded-lg font-medium transition-colors text-center"
                      >
                        View Live
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              ←
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
