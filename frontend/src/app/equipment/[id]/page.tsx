'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, MapPin, IndianRupee, Calendar, Clock,
  Tractor, User, ChevronLeft, ChevronRight, X, CheckCircle2,
  Fuel, Wrench, Shield, Info, Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import { equipmentApi } from '@/lib/api/equipment'
import { bookingsApi } from '@/lib/api/bookings'
import { useAuthStore } from '@/lib/store/authStore'
import type { Equipment } from '@/types'

const AVAIL_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  AVAILABLE:         { label: 'Available',        dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700 border-green-200' },
  IN_USE:            { label: 'In Use',           dot: 'bg-blue-500',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  UNDER_MAINTENANCE: { label: 'Under Maintenance',dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  UNAVAILABLE:       { label: 'Unavailable',      dot: 'bg-red-500',    badge: 'bg-red-100 text-red-700 border-red-200' },
}

declare global {
  interface Window { Razorpay: any }
}

const RAZORPAY_TEST_KEY = 'rzp_test_1DP5mmOlF5G5ag'

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuthStore()

  const [equipment, setEquipment] = useState<Equipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  // Booking modal state
  const [showBooking, setShowBooking] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [farmerNote, setFarmerNote] = useState('')
  const [payLoading, setPayLoading] = useState(false)

  useEffect(() => {
    equipmentApi.getById(id)
      .then(setEquipment)
      .catch(() => toast.error('Failed to load equipment'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (searchParams.get('book') === 'true' && equipment) {
      handleBookNow()
    }
  }, [equipment])

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=/equipment/${id}?book=true`)
      return
    }
    if (user?.role !== 'FARMER') {
      toast.error('Only farmers can book equipment')
      return
    }
    setShowBooking(true)
  }

  const today = new Date().toISOString().split('T')[0]

  const numDays = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 0

  const totalAmount = numDays > 0 && equipment
    ? numDays * Number(equipment.pricePerDay)
    : 0

  const depositAmount = equipment?.depositAmount ? Number(equipment.depositAmount) : 0
  const grandTotal = totalAmount + depositAmount

  const handlePayAndBook = async () => {
    if (!startDate || !endDate) { toast.error('Please select start and end dates'); return }
    if (new Date(endDate) <= new Date(startDate)) { toast.error('End date must be after start date'); return }

    setPayLoading(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) { toast.error('Failed to load payment gateway. Check your connection.'); setPayLoading(false); return }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || RAZORPAY_TEST_KEY,
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      name: 'Farm Gear Connect',
      description: `Book: ${equipment?.title} (${numDays} day${numDays > 1 ? 's' : ''})`,
      image: 'https://raw.githubusercontent.com/farm-gear-connect/assets/main/logo.png',
      handler: async (response: any) => {
        try {
          await bookingsApi.create({
            equipmentId: id,
            startDate,
            endDate,
            farmerNote: farmerNote || undefined,
          })
          toast.success('Booking confirmed! The owner will review and approve it.')
          setShowBooking(false)
          router.push('/farmer/bookings')
        } catch (err: any) {
          toast.error(err?.message || 'Booking created — but failed to save. Contact support.')
        }
      },
      prefill: {
        name: user?.fullName || '',
        email: user?.email || '',
        contact: '',
      },
      notes: {
        equipment_id: id,
        start_date: startDate,
        end_date: endDate,
        owner: equipment?.owner?.fullName || '',
      },
      theme: { color: '#16a34a' },
      modal: {
        ondismiss: () => setPayLoading(false),
        confirm_close: true,
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp: any) => {
      toast.error(`Payment failed: ${resp.error.description}`)
      setPayLoading(false)
    })
    rzp.open()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
    </div>
  )

  if (!equipment) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Tractor className="w-16 h-16 text-gray-300" />
      <p className="text-gray-500 text-lg">Equipment not found</p>
      <button onClick={() => router.back()} className="text-green-600 hover:underline">Go back</button>
    </div>
  )

  const images = equipment.images || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <span className="text-sm font-medium text-gray-500 truncate max-w-xs">{equipment.title}</span>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ─── Left: Images + Info ─── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[activeImg]?.imageUrl}
                      alt={equipment.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setActiveImg(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${i === activeImg ? 'bg-white' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                    {equipment.featured && (
                      <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">Featured</span>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                    <Tractor className="w-16 h-16" />
                    <span className="text-sm">No images uploaded</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-green-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{equipment.title}</h1>
                    {(() => {
                      const avail = AVAIL_CONFIG[equipment.availabilityStatus ?? 'AVAILABLE']
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${avail.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} />
                          {avail.label}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                      {equipment.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{equipment.district}, {equipment.state}</span>
                    {equipment.village && <span>{equipment.village}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-800">{equipment.averageRating?.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({equipment.totalReviews})</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">₹{Number(equipment.pricePerDay).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">per day</p>
                </div>
                {equipment.pricePerHour && (
                  <div className="text-center border-x border-gray-100">
                    <p className="text-xl font-bold text-blue-600">₹{Number(equipment.pricePerHour).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">per hour</p>
                  </div>
                )}
                {equipment.depositAmount && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-orange-500">₹{Number(equipment.depositAmount).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-0.5">deposit</p>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-4">Equipment Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Tractor, label: 'Brand', value: equipment.brand },
                  { icon: Wrench, label: 'Model', value: equipment.modelNumber || '—' },
                  { icon: Fuel, label: 'Fuel Type', value: equipment.fuelType?.replace(/_/g, ' ') || '—' },
                  { icon: Clock, label: 'Min Rental', value: equipment.minRentalDurationHours ? `${equipment.minRentalDurationHours}h` : '—' },
                  { icon: Calendar, label: 'Available From', value: equipment.availableFrom || 'Anytime' },
                  { icon: Calendar, label: 'Available To', value: equipment.availableTo || 'Flexible' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {equipment.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-400" /> Description
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{equipment.description}</p>
              </div>
            )}

            {/* Specifications */}
            {equipment.specifications && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" /> Specifications
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{equipment.specifications}</p>
              </div>
            )}
          </div>

          {/* ─── Right: Booking Card + Owner ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">

            {/* Booking Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
              <div className="mb-4">
                <p className="text-3xl font-bold text-green-600">₹{Number(equipment.pricePerDay).toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-400">per day</p>
              </div>

              {equipment.availabilityStatus && equipment.availabilityStatus !== 'AVAILABLE' ? (
                <div className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold border ${AVAIL_CONFIG[equipment.availabilityStatus].badge}`}>
                  <span className={`w-2 h-2 rounded-full ${AVAIL_CONFIG[equipment.availabilityStatus].dot}`} />
                  {AVAIL_CONFIG[equipment.availabilityStatus].label} — Cannot Book
                </div>
              ) : (
                <button
                  onClick={handleBookNow}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </button>
              )}

              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Booking confirmed after owner approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Secure payment via Razorpay</span>
                </div>
                {equipment.depositAmount && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Refundable deposit: ₹{Number(equipment.depositAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                🔒 Test mode — use card 4111 1111 1111 1111
              </p>
            </div>

            {/* Owner Card */}
            {equipment.owner && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Equipment Owner</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {equipment.owner.profilePhotoUrl ? (
                      <img src={equipment.owner.profilePhotoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{equipment.owner.fullName}</p>
                    {equipment.owner.district && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {equipment.owner.district}, {equipment.owner.state}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  Verified owner · {equipment.totalBookings} completed bookings
                </div>
              </div>
            )}
            </div>{/* end sticky wrapper */}
          </div>
        </div>
      </div>

      {/* ─── Booking Modal ─── */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            onClick={(e) => { if (e.target === e.currentTarget) setShowBooking(false) }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Book Equipment</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{equipment.title}</p>
                </div>
                <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date Inputs */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate('') }}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    min={startDate || today}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note to Owner <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={farmerNote}
                    onChange={e => setFarmerNote(e.target.value)}
                    placeholder="Any special requirements or message..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              {numDays > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm"
                >
                  <div className="flex justify-between text-gray-600">
                    <span>₹{Number(equipment.pricePerDay).toLocaleString('en-IN')} × {numDays} day{numDays > 1 ? 's' : ''}</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {depositAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Security deposit (refundable)</span>
                      <span>₹{depositAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-green-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </motion.div>
              )}

              {/* Razorpay Test Note */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-600">
                <p className="font-semibold mb-1">🧪 Test Mode — Razorpay</p>
                <p>Card: <span className="font-mono">4111 1111 1111 1111</span> · CVV: <span className="font-mono">123</span> · Expiry: <span className="font-mono">12/25</span> · OTP: <span className="font-mono">1234</span></p>
              </div>

              <button
                onClick={handlePayAndBook}
                disabled={payLoading || !startDate || !endDate}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
              >
                {payLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <IndianRupee className="w-5 h-5" />
                    {numDays > 0 ? `Pay ₹${grandTotal.toLocaleString('en-IN')}` : 'Select Dates to Continue'}
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
