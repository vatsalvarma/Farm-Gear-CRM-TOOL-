'use client'

import { useState } from 'react'
import { MapPin, Loader2, Navigation, Tractor } from 'lucide-react'
import Link from 'next/link'
import { equipmentApi } from '@/lib/api/equipment'
import { formatCurrency } from '@/lib/utils'
import type { Equipment } from '@/types'

const AVAIL_CONFIG: Record<string, { label: string; classes: string }> = {
  AVAILABLE:         { label: 'Available',         classes: 'bg-green-100 text-green-700' },
  IN_USE:            { label: 'In Use',             classes: 'bg-blue-100 text-blue-700' },
  UNDER_MAINTENANCE: { label: 'Under Maintenance',  classes: 'bg-orange-100 text-orange-700' },
  UNAVAILABLE:       { label: 'Unavailable',        classes: 'bg-red-100 text-red-700' },
}

export default function NearbyPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [located, setLocated] = useState(false)
  const [error, setError] = useState('')

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false)
        setLoading(true)
        try {
          const res = await equipmentApi.getNearby(pos.coords.latitude, pos.coords.longitude, 50)
          setEquipment(res as Equipment[])
          setLocated(true)
        } catch {
          setError('Failed to load nearby equipment. Please try again.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLocating(false)
        setError('Location access denied. Please allow location in your browser settings.')
      }
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/marketplace" className="text-sm text-brand-600 hover:underline font-medium">
            ← Back to Marketplace
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Equipment Near Me</h1>
          <p className="text-gray-500 mt-1">Find equipment available within 50 km of your location</p>
        </div>

        {!located && !loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Share Your Location</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Allow location access to find equipment available near you within 50 km.
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={findNearby}
              disabled={locating}
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-70 transition-colors"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {locating ? 'Getting location...' : 'Find Nearby Equipment'}
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-gray-500">Searching for equipment near you...</p>
          </div>
        )}

        {located && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {equipment.length} equipment found within 50 km
              </p>
              <button onClick={() => { setLocated(false); setEquipment([]) }} className="text-sm text-brand-600 hover:underline">
                Search again
              </button>
            </div>

            {equipment.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                <Tractor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No equipment found within 50 km</p>
                <Link href="/marketplace" className="text-brand-600 text-sm mt-2 inline-block hover:underline">
                  Browse all equipment →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipment.map(eq => (
                  <Link
                    key={eq.id}
                    href="/marketplace"
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow block"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {eq.images?.[0]?.imageUrl ? (
                          <img src={eq.images[0].imageUrl} alt={eq.title} className="w-full h-full object-cover" />
                        ) : (
                          <Tractor className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5 mb-0.5">
                          <span className="font-medium text-gray-900 truncate">{eq.title}</span>
                          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            AVAIL_CONFIG[eq.availabilityStatus ?? 'AVAILABLE']?.classes
                          }`}>
                            {AVAIL_CONFIG[eq.availabilityStatus ?? 'AVAILABLE']?.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {eq.district}, {eq.state}
                          {eq.distanceKm != null && (
                            <span className="text-brand-600 ml-1 font-medium">· {eq.distanceKm.toFixed(1)} km</span>
                          )}
                        </div>
                        <div className="text-sm font-semibold text-brand-700 mt-1">
                          {formatCurrency(eq.pricePerDay)}/day
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
