'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { kycApi, KycData } from '@/lib/api/kyc'
import { useAuthStore } from '@/lib/store/authStore'

export default function KycBanner() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [kyc, setKyc] = useState<KycData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (user) loadKyc()
  }, [user])

  const loadKyc = async () => {
    try {
      const data = await kycApi.getMyKyc()
      setKyc(data)
    } catch { /* silent */ }
  }

  // Don't show if KYC is approved or user dismissed
  if (!kyc || kyc.kycStatus === 'APPROVED' || dismissed) return null

  const isRejected = kyc.kycStatus === 'REJECTED'
  const isSubmitted = kyc.kycStatus === 'SUBMITTED'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mx-4 mt-4 rounded-2xl border p-4 flex items-start gap-3 ${
          isRejected
            ? 'bg-red-50 border-red-200'
            : isSubmitted
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}
      >
        <div className={`p-2 rounded-xl flex-shrink-0 ${
          isRejected ? 'bg-red-100' : isSubmitted ? 'bg-amber-100' : 'bg-amber-100'
        }`}>
          {isRejected ? (
            <XCircle className="w-5 h-5 text-red-600" />
          ) : isSubmitted ? (
            <Clock className="w-5 h-5 text-amber-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${
            isRejected ? 'text-red-800' : 'text-amber-800'
          }`}>
            {isRejected
              ? '⚠️ KYC Rejected — Action Required'
              : isSubmitted
              ? '⏳ KYC Under Review'
              : '📋 Complete Your Profile & KYC Verification'}
          </p>
          <p className={`text-xs mt-0.5 ${
            isRejected ? 'text-red-600' : 'text-amber-600'
          }`}>
            {isRejected
              ? (kyc.rejectionReason || 'Your KYC was rejected. Please fix the issues and resubmit.')
              : isSubmitted
              ? 'Your documents are being reviewed by our team. This takes 1–2 business days.'
              : 'Add your Aadhaar, PAN, bank details and documents to unlock full access.'}
          </p>
        </div>

        {!isSubmitted && (
          <button
            onClick={() => router.push('/kyc')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-colors ${
              isRejected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            {isRejected ? 'Fix & Resubmit' : 'Complete Now'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
