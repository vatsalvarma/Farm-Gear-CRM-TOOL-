'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tractor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  IndianRupee,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { equipmentApi } from '@/lib/api/equipment'
import type { Equipment, PageResponse } from '@/types'

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; title: string }>({
    open: false, id: '', title: '',
  })
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [preview, setPreview] = useState<Equipment | null>(null)

  const load = () => {
    setLoading(true)
    equipmentApi.getPendingApprovals(page, 10)
      .then(r => {
        const res = r as PageResponse<Equipment>
        setEquipment(res.content)
        setTotalPages(res.totalPages)
        setTotalElements(res.totalElements ?? res.content.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const approve = async (id: string) => {
    setActionLoading(id + '_approve')
    try {
      await equipmentApi.approve(id)
      toast.success('Listing approved! It is now live on the marketplace.')
      load()
    } catch {
      toast.error('Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (id: string, title: string) => {
    setRejectReason('')
    setRejectModal({ open: true, id, title })
  }

  const confirmReject = async () => {
    setActionLoading(rejectModal.id + '_reject')
    try {
      await equipmentApi.reject(rejectModal.id, rejectReason || 'Does not meet listing standards')
      toast.success('Listing rejected. Owner has been notified.')
      setRejectModal({ open: false, id: '', title: '' })
      load()
    } catch {
      toast.error('Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment Approvals</h1>
        <p className="text-gray-500 mt-1">
          {totalElements > 0 ? `${totalElements} listing${totalElements !== 1 ? 's' : ''} pending review` : 'Review equipment listing requests'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : equipment.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p className="font-medium text-gray-500">All caught up!</p>
            <p className="text-sm mt-1">No pending listings to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {equipment.map(eq => (
              <motion.div
                key={eq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Equipment Image */}
                <div
                  className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setPreview(eq)}
                >
                  {eq.images && eq.images.length > 0 ? (
                    <img
                      src={eq.images[0].imageUrl}
                      alt={eq.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <ImageOff className="w-6 h-6 text-gray-300" />
                      <span className="text-[9px] text-gray-300">No image</span>
                    </div>
                  )}
                  {eq.images && eq.images.length > 1 && (
                    <div className="relative -mt-5 text-center">
                      <span className="bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded">
                        +{eq.images.length - 1} more
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{eq.title}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      Pending Review
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{eq.category?.replace(/_/g, ' ')}</span>
                    <span>·</span>
                    <span>{eq.brand}</span>
                    {eq.modelNumber && <><span>·</span><span>{eq.modelNumber}</span></>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {eq.district}, {eq.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {eq.pricePerDay?.toLocaleString('en-IN')}/day
                      {eq.pricePerHour ? ` · ₹${eq.pricePerHour?.toLocaleString('en-IN')}/hr` : ''}
                    </span>
                  </div>
                  {eq.owner && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>Owner: <span className="font-medium text-gray-700">{eq.owner.fullName}</span></span>
                    </div>
                  )}
                  {eq.description && (
                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-2">{eq.description}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(eq.id)}
                    disabled={actionLoading === eq.id + '_approve'}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 min-w-[90px] justify-center"
                  >
                    {actionLoading === eq.id + '_approve' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(eq.id, eq.title)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 min-w-[90px] justify-center border border-red-100"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => setPreview(eq)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-xs px-3 py-2 rounded-lg font-medium transition-colors border border-gray-100 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─── Reject Modal ─── */}
      <AnimatePresence>
        {rejectModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Reject Listing</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Rejecting <span className="font-medium text-gray-700">"{rejectModal.title}"</span>
                  </p>
                </div>
                <button onClick={() => setRejectModal({ open: false, id: '', title: '' })} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 text-sm text-orange-700">
                The owner will receive a notification with your reason. They can fix and resubmit.
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Images are unclear, price is missing, description incomplete…"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">If left blank, a default reason will be sent.</p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setRejectModal({ open: false, id: '', title: '' })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={actionLoading === rejectModal.id + '_reject'}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading === rejectModal.id + '_reject' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Preview Modal ─── */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Image gallery */}
              {preview.images && preview.images.length > 0 ? (
                <div className="grid grid-cols-5 gap-1 p-3">
                  <div className="col-span-5 aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img src={preview.images[0].imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  {preview.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square rounded overflow-hidden bg-gray-100">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-t-2xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageOff className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">No images uploaded</p>
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{preview.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{preview.brand} · {preview.category?.replace(/_/g, ' ')}</p>
                  </div>
                  <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-gray-400" />{preview.district}, {preview.state}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4 text-gray-400" />{preview.pricePerDay?.toLocaleString('en-IN')}/day</span>
                  {preview.pricePerHour && <span>₹{preview.pricePerHour?.toLocaleString('en-IN')}/hr</span>}
                </div>

                {preview.owner && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>Owner: <span className="font-medium text-gray-800">{preview.owner.fullName}</span></span>
                  </div>
                )}

                {preview.description && (
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{preview.description}</p>
                )}

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => { const id = preview.id; setPreview(null); approve(id) }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Go Live
                  </button>
                  <button
                    onClick={() => { const id = preview.id; const title = preview.title; setPreview(null); openRejectModal(id, title) }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
