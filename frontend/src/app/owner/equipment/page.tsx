'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Tractor, Plus, RefreshCw, IndianRupee, MapPin, ImageOff,
  ChevronDown, ChevronUp, Edit2, Save, X, Upload, Trash2,
  CheckCircle2, XCircle, Clock, AlertCircle, FileText,
  Users, Calendar, PhoneCall, Check, Ban,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/authStore'
import { equipmentApi } from '@/lib/api/equipment'
import { bookingsApi } from '@/lib/api/bookings'
import type { Equipment } from '@/types'

// ── Availability options ─────────────────────────────────────────────────────
const AVAIL_OPTIONS = [
  { value: 'AVAILABLE',          label: 'Available',           color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'IN_USE',             label: 'In Use',              color: 'bg-blue-100  text-blue-700  border-blue-300'  },
  { value: 'UNDER_MAINTENANCE',  label: 'Under Maintenance',   color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 'UNAVAILABLE',        label: 'Unavailable',         color: 'bg-red-100   text-red-700   border-red-300'   },
]

const STATUS_CONFIG: Record<string, { label: string; classes: string; Icon: React.ElementType }> = {
  APPROVED:         { label: 'Live',            classes: 'bg-green-100  text-green-700  border-green-200',  Icon: CheckCircle2 },
  PENDING_APPROVAL: { label: 'Pending Review',  classes: 'bg-yellow-100 text-yellow-700 border-yellow-200', Icon: Clock        },
  REJECTED:         { label: 'Rejected',        classes: 'bg-red-100    text-red-700    border-red-200',    Icon: XCircle      },
  DRAFT:            { label: 'Draft',           classes: 'bg-gray-100   text-gray-600   border-gray-200',   Icon: FileText     },
  SUSPENDED:        { label: 'Suspended',       classes: 'bg-orange-100 text-orange-700 border-orange-200', Icon: AlertCircle  },
}

const BOOKING_STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100  text-green-700',
  REJECTED:  'bg-red-100    text-red-700',
  ACTIVE:    'bg-blue-100   text-blue-700',
  COMPLETED: 'bg-purple-100 text-purple-700',
  CANCELLED: 'bg-gray-100   text-gray-500',
}

// ── Types ────────────────────────────────────────────────────────────────────
interface EditState {
  pricePerDay: string
  pricePerHour: string
  depositAmount: string
  availabilityStatus: string
}

interface EquipmentRowProps {
  eq: Equipment
  onUpdate: (updated: Equipment) => void
}

// ── Single equipment row with expandable sections ────────────────────────────
function EquipmentRow({ eq, onUpdate }: EquipmentRowProps) {
  const router = useRouter()
  const [showBookings, setShowBookings] = useState(false)
  const [showEdit, setShowEdit]         = useState(false)
  const [bookings, setBookings]         = useState<any[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const cfg = STATUS_CONFIG[eq.status] ?? STATUS_CONFIG.DRAFT
  const StatusIcon = cfg.Icon

  const availOpt = AVAIL_OPTIONS.find(o => o.value === (eq as any).availabilityStatus) ?? AVAIL_OPTIONS[0]

  const [edit, setEdit] = useState<EditState>({
    pricePerDay:        String(eq.pricePerDay ?? ''),
    pricePerHour:       String(eq.pricePerHour ?? ''),
    depositAmount:      String(eq.depositAmount ?? ''),
    availabilityStatus: (eq as any).availabilityStatus ?? 'AVAILABLE',
  })

  // Load bookings when panel opens
  useEffect(() => {
    if (!showBookings) return
    setLoadingBookings(true)
    bookingsApi.getBookingsByEquipment(eq.id)
      .then(r => setBookings(r.content ?? []))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoadingBookings(false))
  }, [showBookings, eq.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await equipmentApi.patchDetails(eq.id, {
        pricePerDay:        Number(edit.pricePerDay),
        pricePerHour:       Number(edit.pricePerHour),
        depositAmount:      Number(edit.depositAmount),
        availabilityStatus: edit.availabilityStatus,
      })
      onUpdate(updated)
      setShowEdit(false)
      toast.success('Equipment updated!')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadingImages(true)
    try {
      const updated = await equipmentApi.uploadImages(eq.id, Array.from(files))
      onUpdate(updated)
      toast.success('Images uploaded!')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploadingImages(false)
    }
  }

  const handleBookingAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') await bookingsApi.approve(id)
      else await bookingsApi.reject(id, 'Owner declined')
      setBookings(prev => prev.map(b => b.id === id
        ? { ...b, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
        : b))
      toast.success(action === 'approve' ? 'Booking approved!' : 'Booking rejected')
    } catch {
      toast.error('Action failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* ── Main card row ── */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden relative">
            {eq.images?.length > 0 ? (
              <img src={eq.images[0].imageUrl} alt={eq.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <ImageOff className="w-6 h-6" />
                <span className="text-[9px] mt-1">No photo</span>
              </div>
            )}
            {eq.images?.length > 1 && (
              <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                +{eq.images.length - 1}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{eq.title}</h3>
              <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.classes}`}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
              <span>{eq.category?.replace(/_/g, ' ')} · {eq.brand}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{eq.district}, {eq.state}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="flex items-center gap-0.5 font-bold text-gray-900 text-sm">
                <IndianRupee className="w-3.5 h-3.5" />{eq.pricePerDay?.toLocaleString('en-IN')}<span className="font-normal text-gray-400 text-xs">/day</span>
              </span>
              {eq.pricePerHour > 0 && (
                <span className="text-xs text-gray-500">· ₹{eq.pricePerHour?.toLocaleString('en-IN')}/hr</span>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${availOpt.color}`}>
                {availOpt.label}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { setShowEdit(v => !v); setShowBookings(false) }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            {showEdit ? 'Close Edit' : 'Edit'}
          </button>
          <button
            onClick={() => { setShowBookings(v => !v); setShowEdit(false) }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Booking Requests
            {showBookings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {eq.status === 'APPROVED' && (
            <a
              href={`/marketplace?id=${eq.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
            >
              View Live ↗
            </a>
          )}
          {(eq.status === 'DRAFT' || eq.status === 'REJECTED') && (
            <button
              onClick={() => equipmentApi.submitForApproval(eq.id).then(() => toast.success('Submitted!')).catch(() => toast.error('Failed'))}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
            >
              Submit for Review
            </button>
          )}
        </div>
      </div>

      {/* ── Edit Panel ── */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 sm:p-5 bg-gray-50 space-y-4">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-green-600" /> Edit Equipment Details
              </h4>

              {/* Prices */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Price / Day (₹)', key: 'pricePerDay' },
                  { label: 'Price / Hour (₹)', key: 'pricePerHour' },
                  { label: 'Deposit (₹)',       key: 'depositAmount' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        value={edit[key as keyof EditState]}
                        onChange={e => setEdit(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Availability Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Availability Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAIL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEdit(p => ({ ...p, availabilityStatus: opt.value }))}
                      className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                        edit.availabilityStatus === opt.value
                          ? opt.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Equipment Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {eq.images?.map(img => (
                    <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"
                  >
                    {uploadingImages
                      ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                      : <><Upload className="w-4 h-4" /><span className="text-[9px] mt-0.5">Add</span></>
                    }
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleImageUpload(e.target.files)}
                  />
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {saving ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Booking Requests Panel ── */}
      <AnimatePresence>
        {showBookings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-4 sm:p-5 bg-blue-50/40">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-600" /> Booking Requests
              </h4>

              {loadingBookings ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No booking requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    >
                      {/* Farmer info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                          {booking.farmer?.fullName?.charAt(0) ?? 'F'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{booking.farmer?.fullName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.startDate).toLocaleDateString('en-IN')} →{' '}
                            {new Date(booking.endDate).toLocaleDateString('en-IN')}
                          </p>
                          {booking.farmerNote && (
                            <p className="text-xs text-gray-400 italic truncate">"{booking.farmerNote}"</p>
                          )}
                        </div>
                      </div>

                      {/* Amount + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${BOOKING_STATUS_COLOR[booking.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* Actions (only PENDING) */}
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleBookingAction(booking.id, 'approve')}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleBookingAction(booking.id, 'reject')}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function OwnerEquipmentPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'OWNER') router.push('/login')
  }, [isAuthenticated, user, router])

  useEffect(() => { load() }, [page])

  const load = () => {
    setLoading(true)
    equipmentApi.getMyListings(page, 10)
      .then(r => { setEquipment(r.content ?? []); setTotalPages(r.totalPages ?? 0) })
      .catch(() => toast.error('Failed to load equipment'))
      .finally(() => setLoading(false))
  }

  const handleUpdate = (updated: Equipment) =>
    setEquipment(prev => prev.map(e => e.id === updated.id ? updated : e))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">My Equipment</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {equipment.length} listing{equipment.length !== 1 ? 's' : ''} · tap Edit to update price or status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/owner/equipment/new')}
              className="flex items-center gap-1.5 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Equipment</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
          </div>
        ) : equipment.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No equipment yet</h3>
            <p className="text-gray-400 text-sm mb-6">Add your first piece of equipment to start renting.</p>
            <button
              onClick={() => router.push('/owner/equipment/new')}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Equipment
            </button>
          </div>
        ) : (
          <>
            {equipment.map(eq => (
              <EquipmentRow key={eq.id} eq={eq} onUpdate={handleUpdate} />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >← Prev</button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
