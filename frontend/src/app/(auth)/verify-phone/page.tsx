'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Phone, Tractor, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'

function VerifyPhoneContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const phone = searchParams.get('phone') ?? ''
  const { user } = useAuthStore()

  const goToDashboard = () => {
    if (user?.role === 'ADMIN') router.push('/admin/dashboard')
    else if (user?.role === 'OWNER') router.push('/owner/dashboard')
    else router.push('/farmer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Tractor className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Farm Gear Connect</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verify your phone</h1>
          <p className="text-gray-500 text-sm mb-1">
            An OTP was sent to
          </p>
          <p className="text-brand-600 font-medium text-sm mb-6">{phone}</p>

          <button
            onClick={goToDashboard}
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href="/login" className="text-brand-600 hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <VerifyPhoneContent />
    </Suspense>
  )
}
