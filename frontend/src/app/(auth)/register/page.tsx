'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tractor, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { UserRole } from '@/types'
import { OAuthSessionSync } from '@/components/auth/OAuthSessionSync'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER' as UserRole,
    state: '',
    district: '',
    village: '',
    couponCode: '',
  })
  const [showPassword, setShowPassword]     = useState(false)
  const [loading, setLoading]               = useState(false)
  const [oauthLoading, setOauthLoading]     = useState(false)
  const [error, setError]                   = useState('')

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleOAuth = async () => {
    setError('')
    setOauthLoading(true)
    try {
      await signIn('google', { callbackUrl: `/?oauthRole=${formData.role}` })
    } finally {
      setOauthLoading(false)
    }
  }

  // ── Step validation ───────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Please fill in all required fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(formData.password)) {
        setError('Password must contain uppercase, lowercase and a number (e.g. Farmer@1)')
        return
      }
    }
    setError('')
    setStep(s => s + 1)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await authApi.register({
        fullName:   formData.fullName,
        email:      formData.email,
        phone:      formData.phone || undefined,
        password:   formData.password,
        role:       formData.role,
        state:      formData.state    || undefined,
        district:   formData.district || undefined,
        village:    formData.village  || undefined,
        couponCode: formData.couponCode || undefined,
      })
      setAuth(response.user, response.accessToken, response.refreshToken)
      router.push('/verify-email')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <OAuthSessionSync />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-xl px-7 py-6">

          {/* ── Logo ── */}
          <div className="text-center mb-4">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2">
              <Tractor className="w-8 h-8 text-green-600" />
              <span className="text-lg font-bold text-gray-900">FarmGearConnect</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-xs text-gray-500 mt-0.5">Join our farming community</p>
          </div>

          {/* ── Progress dots ── */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-green-600' : s < step ? 'w-2 bg-green-500' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* ── Error ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-xs">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>

            {/* ════ STEP 1: Basic info ════ */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                {/* Google OAuth */}
                <button
                  id="reg-oauth-google-btn"
                  type="button"
                  onClick={handleOAuth}
                  disabled={oauthLoading || loading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  {oauthLoading ? <Loader2 className="w-4 h-4 animate-spin text-green-600" /> : <GoogleIcon />}
                  Sign up with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or with email</span></div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" required value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className={inputClass} placeholder="John Doe" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="email" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass} placeholder="you@email.com" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Min 8 chars, Aa1" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={inputClass} placeholder="••••••••" />
                  </div>
                </div>

                <button type="button" onClick={handleNext}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Next →
                </button>
              </motion.div>
            )}

            {/* ════ STEP 2: Role & Phone ════ */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">I am a *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: 'FARMER', label: '🌾 Farmer' }, { value: 'OWNER', label: '🚜 Equipment Owner' }].map(r => (
                      <button key={r.value} type="button"
                        onClick={() => setFormData({ ...formData, role: r.value as UserRole })}
                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-all ${
                          formData.role === r.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'
                        }`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="tel" value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass} placeholder="+91 9876543210" />
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                    ← Back
                  </button>
                  <button type="button" onClick={handleNext}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                    Next →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ════ STEP 3: Location & Submit ════ */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-3"
              >
                {[
                  { label: 'State', key: 'state', placeholder: 'Andhra Pradesh' },
                  { label: 'District', key: 'district', placeholder: 'Guntur' },
                  { label: 'Village', key: 'village', placeholder: 'Village name' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
                    <input type="text" value={(formData as any)[key]}
                      onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder={placeholder} />
                  </div>
                ))}

                {formData.role === 'OWNER' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code (Optional)</label>
                    <input type="text" value={formData.couponCode}
                      onChange={e => setFormData({ ...formData, couponCode: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      placeholder="Enter coupon code" />
                    <p className="text-xs text-gray-400 mt-1">First 30 registrations get free annual subscription</p>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
