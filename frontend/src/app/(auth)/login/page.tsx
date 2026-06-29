'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Tractor, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
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

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [formData, setFormData]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError]           = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // ── Credential login ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to continue.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await authApi.login(formData)
      setAuth(response.user, response.accessToken, response.refreshToken)
      if (response.user.role === 'ADMIN')       router.push('/admin/dashboard')
      else if (response.user.role === 'OWNER')  router.push('/owner/dashboard')
      else                                       router.push('/farmer/dashboard')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ── OAuth login ───────────────────────────────────────────────────────────
  const handleOAuth = async () => {
    if (!acceptedTerms) {
      setError('Please accept the Terms and Conditions to continue.')
      return
    }
    setError('')
    setOauthLoading(true)
    try {
      await signIn('google', { callbackUrl: '/' })
    } finally {
      setOauthLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      <OAuthSessionSync />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-2xl shadow-xl px-7 py-6">

          {/* ── Logo + Title ── */}
          <div className="text-center mb-5">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
              <Tractor className="w-8 h-8 text-green-600" />
              <span className="text-lg font-bold text-gray-900">FarmGearConnect</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sign in to your account</p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          {/* ── Email ── */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="login-email"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="you@email.com"
              />
            </div>
          </div>

          {/* ── Password ── */}
          <div className="mb-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ── Forgot password ── */}
          <div className="flex justify-end mb-4">
            <Link href="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* ── Terms & Conditions ── */}
          <div className="flex items-start gap-2 mb-4">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="accept-terms" className="text-xs text-gray-600 cursor-pointer select-none leading-relaxed">
              I have read and agree to the{' '}
              <Link href="/terms" target="_blank" className="text-green-600 hover:text-green-700 font-medium underline underline-offset-2">
                Terms and Conditions
              </Link>
            </label>
          </div>

          {/* ── Continue with Google ── */}
          <button
            id="oauth-google-btn"
            type="button"
            onClick={handleOAuth}
            disabled={oauthLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 mb-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 font-medium text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {oauthLoading
              ? <Loader2 className="w-4 h-4 animate-spin text-green-600" />
              : <GoogleIcon />}
            Continue with Google
          </button>

          {/* ── Sign In button ── */}
          <form onSubmit={handleSubmit}>
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : 'Sign In'}
            </button>
          </form>

          {/* ── Register link ── */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
