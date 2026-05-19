'use client'

import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import apiClient from '@/lib/api/client'

interface Coupon {
  id: string
  code: string
  discountPercent: number
  maxUses: number
  usedCount: number
  active: boolean
  expiryDate: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/admin/coupons?page=0&size=50')
      .then(r => setCoupons(r.data.content ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <p className="text-gray-500 mt-1">Discount coupons for subscriptions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading…</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            No coupons found
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {coupons.map(c => (
              <div key={c.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 font-mono">{c.code}</div>
                  <div className="text-xs text-gray-500">{c.usedCount} / {c.maxUses} uses · Expires {c.expiryDate}</div>
                </div>
                <div className="text-lg font-bold text-brand-600">{c.discountPercent}% off</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
