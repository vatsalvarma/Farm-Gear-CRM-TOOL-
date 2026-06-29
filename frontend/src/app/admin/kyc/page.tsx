'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, CheckCircle2, XCircle, Clock, RefreshCw, Search,
  User, Phone, MapPin, CreditCard, FileText, Eye, X, AlertCircle,
  ChevronDown, Filter
} from 'lucide-react'
import { kycApi, KycData } from '@/lib/api/kyc'

const STATUS_OPTIONS = ['ALL', 'NOT_STARTED', 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
  PENDING:     { label: 'Draft',       color: 'text-blue-700',  bg: 'bg-blue-100',  dot: 'bg-blue-500' },
  SUBMITTED:   { label: 'Submitted',   color: 'text-amber-700', bg: 'bg-amber-100', dot: 'bg-amber-500' },
  APPROVED:    { label: 'Approved',    color: 'text-green-700', bg: 'bg-green-100', dot: 'bg-green-500' },
  REJECTED:    { label: 'Rejected',    color: 'text-red-700',   bg: 'bg-red-100',   dot: 'bg-red-500' },
}

export default function AdminKycPage() {
  const [records, setRecords] = useState<KycData[]>([])
  const [filtered, setFiltered] = useState<KycData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<KycData | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])
  useEffect(() => { applyFilter() }, [records, statusFilter, search])

  const load = async () => {
    setLoading(true)
    try {
      const data = await kycApi.adminListKyc()
      setRecords(data)
    } catch { setMsg('Failed to load KYC records') }
    finally { setLoading(false) }
  }

  const applyFilter = () => {
    let r = records
    if (statusFilter !== 'ALL') r = r.filter(k => k.kycStatus === statusFilter)
    if (search) r = r.filter(k =>
      k.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      k.email?.toLowerCase().includes(search.toLowerCase()) ||
      k.phone?.includes(search)
    )
    setFiltered(r)
  }

  const openDetail = async (userId: string) => {
    try {
      const data = await kycApi.adminGetUserKyc(userId)
      setSelected(data)
    } catch { setMsg('Failed to load user KYC') }
  }

  const handleApprove = async () => {
    if (!selected?.userId) return
    setActionLoading(true)
    try {
      await kycApi.adminApprove(selected.userId)
      setMsg('KYC Approved ✅')
      setSelected(null)
      await load()
    } catch (e: any) { setMsg(e?.response?.data?.message || 'Failed to approve') }
    finally { setActionLoading(false) }
  }

  const handleReject = async () => {
    if (!selected?.userId || !rejectReason.trim()) return
    setActionLoading(true)
    try {
      await kycApi.adminReject(selected.userId, rejectReason)
      setMsg('KYC Rejected')
      setSelected(null)
      setShowRejectModal(false)
      setRejectReason('')
      await load()
    } catch (e: any) { setMsg(e?.response?.data?.message || 'Failed to reject') }
    finally { setActionLoading(false) }
  }

  const stats = {
    total: records.length,
    submitted: records.filter(r => r.kycStatus === 'SUBMITTED').length,
    approved: records.filter(r => r.kycStatus === 'APPROVED').length,
    rejected: records.filter(r => r.kycStatus === 'REJECTED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-600" />
            KYC Verification Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage user identity verification</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     val: stats.total,     color: 'text-gray-700',  bg: 'bg-white' },
            { label: 'Pending',   val: stats.submitted,  color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Approved',  val: stats.approved,   color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Rejected',  val: stats.rejected,   color: 'text-red-600',   bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 shadow-sm`}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Alert */}
        {msg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {msg}
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-400 focus:border-transparent" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-green-400">
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : STATUS_CONFIG[s]?.label || s}</option>
            ))}
          </select>
          <button onClick={load} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No KYC records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">KYC Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Submitted</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const sc = STATUS_CONFIG[r.kycStatus || 'NOT_STARTED']
                    return (
                      <motion.tr key={r.userId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {r.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{r.fullName}</p>
                              <p className="text-xs text-gray-400">{r.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            r.role === 'FARMER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>{r.role}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.phone || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.district || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => r.userId && openDetail(r.userId)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 mx-auto">
                            <Eye className="w-3.5 h-3.5" /> Review
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-start justify-end">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">

              {/* Drawer Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selected.fullName}</h2>
                  <p className="text-xs text-gray-500">{selected.email} · {selected.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.kycStatus === 'SUBMITTED' && (
                    <>
                      <button onClick={handleApprove} disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                        {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                      <button onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6">
                {/* Status */}
                <div className={`p-4 rounded-xl border ${
                  selected.kycStatus === 'APPROVED' ? 'bg-green-50 border-green-200' :
                  selected.kycStatus === 'REJECTED' ? 'bg-red-50 border-red-200' :
                  selected.kycStatus === 'SUBMITTED' ? 'bg-amber-50 border-amber-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <p className="text-sm font-semibold text-gray-700">KYC Status: <span className="font-bold">{selected.kycStatus || 'NOT STARTED'}</span></p>
                  {selected.rejectionReason && <p className="text-sm text-red-700 mt-1">Reason: {selected.rejectionReason}</p>}
                  {selected.submittedAt && <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(selected.submittedAt).toLocaleString('en-IN')}</p>}
                </div>

                {/* Personal */}
                <Section title="Personal Information" icon={User}>
                  <Row label="Full Name" value={selected.fullName} />
                  <Row label="Email" value={selected.email} />
                  <Row label="Phone" value={selected.phone} />
                  <Row label="State" value={selected.state} />
                  <Row label="District" value={selected.district} />
                  <Row label="Village" value={selected.village} />
                  <Row label="Address" value={selected.address} />
                  <Row label="Mandal" value={selected.mandal} />
                  <Row label="Pincode" value={selected.pincode} />
                </Section>

                {/* Identity */}
                <Section title="Identity" icon={Shield}>
                  <Row label="Aadhaar Number" value={selected.aadhaarNumber} sensitive />
                  <Row label="PAN Number" value={selected.panNumber} sensitive />
                </Section>

                {/* Bank */}
                <Section title="Bank Details" icon={CreditCard}>
                  <Row label="Account Holder" value={selected.bankAccountHolderName} />
                  <Row label="Account Number" value={selected.bankAccountNumber} sensitive />
                  <Row label="IFSC Code" value={selected.ifscCode} />
                  <Row label="Bank Name" value={selected.bankName} />
                </Section>

                {/* Owner extras */}
                {(selected.companyName || selected.gstNumber || selected.businessAddress) && (
                  <Section title="Business Details" icon={FileText}>
                    <Row label="Company Name" value={selected.companyName} />
                    <Row label="GST Number" value={selected.gstNumber} />
                    <Row label="Business Address" value={selected.businessAddress} />
                  </Section>
                )}

                {/* Documents */}
                <Section title="KYC Documents" icon={FileText}>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Aadhaar Front', data: selected.aadhaarFrontData },
                      { label: 'Aadhaar Back', data: selected.aadhaarBackData },
                      { label: 'PAN Card', data: selected.panCardData },
                      { label: 'Bank Passbook', data: selected.passbookData },
                      { label: 'Company Doc', data: selected.companyDocData },
                    ].filter(d => d.data).map(doc => (
                      <div key={doc.label} className="border border-gray-200 rounded-xl overflow-hidden">
                        <p className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5">{doc.label}</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={doc.data} alt={doc.label} className="w-full h-32 object-cover" />
                      </div>
                    ))}
                    {![selected.aadhaarFrontData, selected.aadhaarBackData, selected.panCardData, selected.passbookData].some(Boolean) && (
                      <p className="col-span-2 text-sm text-gray-400 text-center py-4">No documents uploaded yet</p>
                    )}
                  </div>
                </Section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" /> Reject KYC
              </h3>
              <p className="text-sm text-gray-500 mb-4">Provide a reason. The user will be notified and can resubmit.</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g., Aadhaar image is blurry, please re-upload a clear image..."
                rows={4} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-400 resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={handleReject} disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Confirm Reject
                </button>
                <button onClick={() => { setShowRejectModal(false); setRejectReason('') }}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
        <Icon className="w-4 h-4 text-green-600" /> {title}
      </h3>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value, sensitive }: { label: string; value?: string | null; sensitive?: boolean }) {
  const [show, setShow] = useState(false)
  if (!value) return null
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium text-right flex-1">
        {sensitive && !show
          ? <span className="blur-sm cursor-pointer" onClick={() => setShow(true)}>{value}</span>
          : value
        }
        {sensitive && !show && (
          <button onClick={() => setShow(true)} className="ml-2 text-xs text-green-600 underline">show</button>
        )}
      </span>
    </div>
  )
}
