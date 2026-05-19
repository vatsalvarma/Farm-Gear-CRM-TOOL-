'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Eye, EyeOff, Loader2, Mail, MapPin, Phone, Save, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/lib/store/authStore'
import { userApi, type UserProfile } from '@/lib/api/user'

export default function OwnerProfilePage() {
  const { user: authUser, updateUser } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [form, setForm] = useState({ fullName: '', phone: '', state: '', district: '', village: '', preferredLanguage: 'ENGLISH' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)

  const [emailStep, setEmailStep] = useState<'idle' | 'otp'>('idle')
  const [newEmail, setNewEmail] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)

  useEffect(() => {
    userApi.getMe().then(p => {
      setProfile(p)
      setForm({ fullName: p.fullName, phone: p.phone, state: p.state, district: p.district, village: p.village, preferredLanguage: p.preferredLanguage })
    }).catch(() => {
      if (authUser) {
        setForm({ fullName: authUser.fullName, phone: '', state: '', district: '', village: '', preferredLanguage: authUser.preferredLanguage })
      }
    })
  }, [authUser])

  const pickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { toast.error('Only JPG and PNG files are allowed'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10 MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const saveAvatar = async () => {
    if (!avatarFile) return
    setSavingAvatar(true)
    try {
      const res = await userApi.uploadAvatar(avatarFile)
      updateUser({ profilePhotoUrl: res.profilePhotoUrl })
      setProfile(prev => prev ? { ...prev, profilePhotoUrl: res.profilePhotoUrl } : prev)
      setAvatarFile(null)
      toast.success('Profile photo updated!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Avatar upload failed')
    }
    finally { setSavingAvatar(false) }
  }

  const saveProfile = async () => {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return }
    setSavingProfile(true)
    try {
      const updated = await userApi.updateProfile(form)
      setProfile(updated)
      updateUser({ fullName: updated.fullName })
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSavingProfile(false) }
  }

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill in all password fields'); return }
    if (pwForm.newPassword.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setSavingPw(true)
    try {
      await userApi.changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed successfully!')
    } catch { toast.error('Failed to change password') }
    finally { setSavingPw(false) }
  }

  const sendEmailOtp = async () => {
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) { toast.error('Enter a valid email address'); return }
    setSendingOtp(true)
    try {
      await userApi.requestEmailChange(newEmail)
      setEmailStep('otp')
      toast.success('OTP sent! Check your new email inbox.')
    } catch { toast.error('Failed to send OTP') }
    finally { setSendingOtp(false) }
  }

  const confirmEmailChange = async () => {
    if (!emailOtp.trim()) { toast.error('Enter the OTP'); return }
    setSavingEmail(true)
    try {
      await userApi.confirmEmailChange(newEmail, emailOtp)
      toast.success('Email changed! Please log in again.')
      setTimeout(() => window.location.href = '/login', 1500)
    } catch { toast.error('Invalid or expired OTP') }
    finally { setSavingEmail(false) }
  }

  const displayPhoto = avatarPreview || profile?.profilePhotoUrl || ''
  const initial = (profile?.fullName ?? authUser?.fullName ?? 'O').charAt(0).toUpperCase()
  const inputCls = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white'

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* ── Avatar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {displayPhoto ? <img src={displayPhoto} alt="avatar" className="w-full h-full object-cover" /> : initial}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white hover:bg-brand-700 shadow">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-600">JPG or PNG · Max 10 MB</p>
            {avatarFile && (
              <button onClick={saveAvatar} disabled={savingAvatar}
                className="mt-2 inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-brand-700 disabled:opacity-70 transition-colors">
                {savingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingAvatar ? 'Uploading...' : 'Save Photo'}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={pickAvatar} />
        </div>
      </div>

      {/* ── Basic Info ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
            <input value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1"><Phone className="w-3 h-3 inline mr-1" />Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9XXXXXXXXX" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
              <select value={form.preferredLanguage} onChange={e => setForm(p => ({ ...p, preferredLanguage: e.target.value }))} className={inputCls}>
                <option value="ENGLISH">English</option>
                <option value="TELUGU">Telugu</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['state', 'district', 'village'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-medium text-gray-500 mb-1 capitalize"><MapPin className="w-3 h-3 inline mr-1" />{f}</label>
                <input value={(form as Record<string, string>)[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} className={inputCls} />
              </div>
            ))}
          </div>
        </div>
        <button onClick={saveProfile} disabled={savingProfile}
          className="mt-4 inline-flex items-center gap-2 bg-brand-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-70 transition-colors">
          {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <div className="space-y-3">
          {([
            { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
            { key: 'newPassword',     label: 'New Password',     show: showPw.newPw,   toggle: () => setShowPw(p => ({ ...p, newPw: !p.newPw })) },
            { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
          ] as const).map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className={inputCls + ' pr-10'}
                />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={changePassword} disabled={savingPw}
          className="mt-4 inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors">
          {savingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {savingPw ? 'Changing...' : 'Change Password'}
        </button>
      </div>

      {/* ── Change Email ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Change Email</h2>
        <p className="text-xs text-gray-400 mb-4">Current: <span className="font-medium text-gray-700">{profile?.email ?? authUser?.email}</span></p>
        {emailStep === 'idle' ? (
          <div className="flex gap-2">
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" className={inputCls} />
            <button onClick={sendEmailOtp} disabled={sendingOtp}
              className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-70 transition-colors whitespace-nowrap">
              {sendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-green-600 font-medium">OTP sent to <strong>{newEmail}</strong></p>
            <div className="flex gap-2">
              <input type="text" value={emailOtp} onChange={e => setEmailOtp(e.target.value)} placeholder="Enter 6-digit OTP" maxLength={6} className={inputCls} />
              <button onClick={confirmEmailChange} disabled={savingEmail}
                className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-brand-700 disabled:opacity-70 transition-colors whitespace-nowrap">
                {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {savingEmail ? 'Verifying...' : 'Verify & Change'}
              </button>
            </div>
            <button onClick={() => { setEmailStep('idle'); setEmailOtp('') }} className="text-xs text-gray-400 hover:text-gray-600">
              ← Use different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
