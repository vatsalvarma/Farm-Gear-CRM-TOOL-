'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Phone, MapPin, CreditCard, Building2, Upload, CheckCircle2,
  AlertCircle, Clock, XCircle, ChevronRight, Shield, FileText,
  Camera, ArrowLeft, Send, RefreshCw, Info
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/authStore'
import { kycApi, KycData } from '@/lib/api/kyc'

const STEPS = [
  { id: 'personal',  label: 'Personal Info',  icon: User },
  { id: 'address',   label: 'Address',         icon: MapPin },
  { id: 'identity',  label: 'Identity (KYC)',  icon: Shield },
  { id: 'bank',      label: 'Bank Details',    icon: CreditCard },
  { id: 'documents', label: 'Documents',       icon: FileText },
]

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started',        color: 'text-gray-500',  bg: 'bg-gray-100',  icon: Info },
  PENDING:     { label: 'Draft',              color: 'text-blue-600',  bg: 'bg-blue-50',   icon: Clock },
  SUBMITTED:   { label: 'Under Review',       color: 'text-amber-600', bg: 'bg-amber-50',  icon: Clock },
  APPROVED:    { label: 'Verified ✓',         color: 'text-green-600', bg: 'bg-green-50',  icon: CheckCircle2 },
  REJECTED:    { label: 'Rejected – Fix Needed', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
}

interface UploadSlot {
  key: 'AADHAAR_FRONT' | 'AADHAAR_BACK' | 'PAN' | 'PASSBOOK' | 'COMPANY' | 'PROFILE'
  label: string
  field: keyof KycData
  required: boolean
  ownerOnly?: boolean
}

const UPLOAD_SLOTS: UploadSlot[] = [
  { key: 'PROFILE',      label: 'Profile Photo',          field: 'profilePhotoUrl', required: false },
  { key: 'AADHAAR_FRONT',label: 'Aadhaar Front',          field: 'aadhaarFrontUrl', required: true },
  { key: 'AADHAAR_BACK', label: 'Aadhaar Back',           field: 'aadhaarBackUrl',  required: true },
  { key: 'PAN',          label: 'PAN Card',               field: 'panCardUrl',      required: true },
  { key: 'PASSBOOK',     label: 'Bank Passbook / Cheque', field: 'passbookUrl',     required: true },
  { key: 'COMPANY',      label: 'Company Document',       field: 'companyDocUrl',   required: false, ownerOnly: true },
]

export default function KycPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [kyc, setKyc] = useState<KycData>({})
  const [form, setForm] = useState<Partial<KycData>>({})
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const isOwner = user?.role === 'OWNER'
  const isApproved = kyc.kycStatus === 'APPROVED'
  const isSubmitted = kyc.kycStatus === 'SUBMITTED'

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    loadKyc()
  }, [user])

  const loadKyc = async () => {
    try {
      const data = await kycApi.getMyKyc()
      setKyc(data)
      setForm({
        phone: data.phone || user?.phone || '',
        state: data.state || '',
        district: data.district || '',
        village: data.village || '',
        address: data.address || '',
        pincode: data.pincode || '',
        mandal: data.mandal || '',
        aadhaarNumber: data.aadhaarNumber || '',
        panNumber: data.panNumber || '',
        bankAccountHolderName: data.bankAccountHolderName || '',
        bankAccountNumber: data.bankAccountNumber || '',
        ifscCode: data.ifscCode || '',
        bankName: data.bankName || '',
        companyName: data.companyName || '',
        gstNumber: data.gstNumber || '',
        businessAddress: data.businessAddress || '',
      })
    } catch (e) {
      setError('Failed to load KYC data')
    }
  }

  const completionPercent = () => {
    const fields = [
      form.phone, form.state, form.district, form.address, form.pincode,
      form.aadhaarNumber, form.panNumber,
      form.bankAccountHolderName, form.bankAccountNumber, form.ifscCode, form.bankName,
      kyc.aadhaarFrontUrl, kyc.aadhaarBackUrl, kyc.panCardUrl, kyc.passbookUrl,
    ]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await kycApi.saveKyc(form)
      setKyc(prev => ({ ...prev, ...updated }))
      setSuccess('Details saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (completionPercent() < 60) {
      setError('Please fill all required fields and upload documents before submitting.')
      return
    }
    setSubmitting(true)
    try {
      await kycApi.saveKyc(form)
      await kycApi.submitKyc()
      setSuccess('KYC submitted for review! Admin will verify your documents shortly.')
      await loadKyc()
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpload = async (slot: UploadSlot, file: File) => {
    setUploadingDoc(slot.key)
    setError('')
    try {
      await kycApi.uploadDoc(slot.key, file)
      setSuccess(`${slot.label} uploaded!`)
      await loadKyc()
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingDoc(null)
    }
  }

  const set = (field: keyof KycData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const visible = UPLOAD_SLOTS.filter(s => !s.ownerOnly || isOwner)
  const statusCfg = STATUS_CONFIG[kyc.kycStatus || 'NOT_STARTED']
  const StatusIcon = statusCfg.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">Complete Your Profile & KYC</h1>
            <p className="text-xs text-gray-500">All information is securely stored</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusCfg.label}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Rejection Banner */}
        {kyc.kycStatus === 'REJECTED' && kyc.rejectionReason && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800">KYC Rejected</p>
              <p className="text-sm text-red-700 mt-0.5">{kyc.rejectionReason}</p>
              <p className="text-xs text-red-600 mt-1">Please update your information and resubmit.</p>
            </div>
          </motion.div>
        )}

        {/* Submitted Banner */}
        {kyc.kycStatus === 'SUBMITTED' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">KYC Under Review</p>
              <p className="text-sm text-amber-700">Your documents are being verified by our team. This usually takes 1–2 business days.</p>
            </div>
          </motion.div>
        )}

        {/* Approved Banner */}
        {kyc.kycStatus === 'APPROVED' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">KYC Verified ✓</p>
              <p className="text-sm text-green-700">Your account is fully verified. You have complete access to all features.</p>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
            <span className="text-2xl font-bold text-green-600">{completionPercent()}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent()}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
            />
          </div>
        </div>

        {/* Step Nav */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setStep(i)}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                  step === i ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-green-50 border border-gray-100'
                }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block text-center leading-tight">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Alerts */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

              {/* Step 0: Personal */}
              {step === 0 && (
                <div className="space-y-5">
                  <SectionTitle icon={User} title="Personal Information" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" value={user?.fullName || ''} disabled />
                    <Field label="Email" value={user?.email || ''} disabled />
                    <Field label="Mobile Number *" value={form.phone || ''} onChange={v => set('phone', v)} placeholder="+91 9XXXXXXXXX" type="tel" />
                    {isOwner && <Field label="Company Name" value={form.companyName || ''} onChange={v => set('companyName', v)} placeholder="ABC Agro Pvt Ltd" />}
                    {isOwner && <Field label="GST Number (Optional)" value={form.gstNumber || ''} onChange={v => set('gstNumber', v)} placeholder="22AAAAA0000A1Z5" />}
                  </div>
                </div>
              )}

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="space-y-5">
                  <SectionTitle icon={MapPin} title="Address Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Full Address *" value={form.address || ''} onChange={v => set('address', v)} placeholder="House No, Street, Area" multiline />
                    </div>
                    <Field label="Village / Town" value={form.village || ''} onChange={v => set('village', v)} placeholder="Village name" />
                    <Field label="Mandal / Taluk" value={form.mandal || ''} onChange={v => set('mandal', v)} placeholder="Mandal name" />
                    <Field label="District *" value={form.district || ''} onChange={v => set('district', v)} placeholder="District" />
                    <Field label="State *" value={form.state || ''} onChange={v => set('state', v)} placeholder="State" />
                    <Field label="Pincode *" value={form.pincode || ''} onChange={v => set('pincode', v)} placeholder="500001" type="number" />
                    {isOwner && (
                      <div className="sm:col-span-2">
                        <Field label="Business Address" value={form.businessAddress || ''} onChange={v => set('businessAddress', v)} placeholder="Business / office address" multiline />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Identity */}
              {step === 2 && (
                <div className="space-y-5">
                  <SectionTitle icon={Shield} title="Identity Verification (KYC)" />
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700 flex gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Your Aadhaar and PAN details are encrypted and stored securely. They will only be used for identity verification.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Aadhaar Number *" value={form.aadhaarNumber || ''} onChange={v => set('aadhaarNumber', v)} placeholder="XXXX XXXX XXXX" type="text" maxLength={14} />
                    <Field label="PAN Number *" value={form.panNumber || ''} onChange={v => set('panNumber', v.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
                  </div>
                </div>
              )}

              {/* Step 3: Bank */}
              {step === 3 && (
                <div className="space-y-5">
                  <SectionTitle icon={CreditCard} title="Bank Account Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Account Holder Name *" value={form.bankAccountHolderName || ''} onChange={v => set('bankAccountHolderName', v)} placeholder="As on passbook" />
                    <Field label="Account Number *" value={form.bankAccountNumber || ''} onChange={v => set('bankAccountNumber', v)} placeholder="Bank account number" type="text" />
                    <Field label="IFSC Code *" value={form.ifscCode || ''} onChange={v => set('ifscCode', v.toUpperCase())} placeholder="SBIN0001234" maxLength={11} />
                    <Field label="Bank Name *" value={form.bankName || ''} onChange={v => set('bankName', v)} placeholder="State Bank of India" />
                  </div>
                </div>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <div className="space-y-5">
                  <SectionTitle icon={FileText} title="Upload Documents" />
                  <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WEBP (max 5MB each)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visible.map(slot => {
                      const isUploaded = !!kyc[slot.field]
                      const isLoading = uploadingDoc === slot.key
                      return (
                        <div key={slot.key}
                          className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-green-400 ${
                            isUploaded ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                          } ${isApproved || isSubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                          onClick={() => !isApproved && !isSubmitted && fileRefs.current[slot.key]?.click()}>
                          <input ref={el => { fileRefs.current[slot.key] = el }}
                            type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(slot, f) }}
                          />
                          {isLoading ? (
                            <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
                          ) : isUploaded ? (
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          ) : (
                            <Upload className="w-8 h-8 text-gray-400" />
                          )}
                          <p className="text-sm font-medium text-gray-700 text-center">{slot.label}</p>
                          <p className="text-xs text-gray-400">
                            {isUploaded ? '✓ Uploaded — click to replace' : slot.required ? 'Required' : 'Optional'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation & Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-3">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              ← Previous
            </button>
            <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              Next →
            </button>
          </div>

          <div className="flex gap-3">
            {!isApproved && !isSubmitted && (
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 bg-white border border-green-300 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-50 disabled:opacity-60 flex items-center gap-2 transition-all">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
            )}
            {!isApproved && !isSubmitted && (
              <button onClick={handleSubmit} disabled={submitting || completionPercent() < 40}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 flex items-center gap-2 shadow-md transition-all">
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-green-100 rounded-lg">
        <Icon className="w-5 h-5 text-green-700" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, disabled, type = 'text', multiline, maxLength }: {
  label: string; value: string; onChange?: (v: string) => void
  placeholder?: string; disabled?: boolean; type?: string; multiline?: boolean; maxLength?: number
}) {
  const cls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-400"
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
          disabled={disabled} rows={3} maxLength={maxLength}
          className={cls + ' resize-none'} />
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder} disabled={disabled} maxLength={maxLength}
          className={cls} />
      )}
    </div>
  )
}
