'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { equipmentApi } from '@/lib/api/equipment'
import type { EquipmentCategory, FuelType } from '@/types'

const CATEGORIES: EquipmentCategory[] = [
  'TRACTOR', 'HARVESTER', 'PLOUGH', 'SEEDER', 'SPRAYER',
  'IRRIGATION_PUMP', 'THRESHER', 'CULTIVATOR', 'ROTAVATOR',
  'POWER_TILLER', 'COMBINE_HARVESTER', 'RICE_TRANSPLANTER',
  'POTATO_PLANTER', 'SUGARCANE_HARVESTER', 'OTHER',
]

const FUEL_TYPES: FuelType[] = ['DIESEL', 'PETROL', 'ELECTRIC', 'MANUAL', 'SOLAR']

const MAX_IMAGES = 5

interface FormData {
  title: string
  description: string
  category: EquipmentCategory
  brand: string
  fuelType: FuelType
  modelNumber: string
  pricePerDay: number
  pricePerHour: number
  depositAmount: number
  state: string
  district: string
  village: string
  address: string
}

const inputClass = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white'

export default function NewEquipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = MAX_IMAGES - images.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length === 0) return
    const newImages = [...images, ...toAdd]
    setImages(newImages)
    toAdd.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const payload = { ...data }
      if (!payload.pricePerHour || isNaN(payload.pricePerHour)) delete (payload as Record<string, unknown>).pricePerHour
      if (!payload.depositAmount || isNaN(payload.depositAmount)) delete (payload as Record<string, unknown>).depositAmount
      const created = await equipmentApi.create(payload as Record<string, unknown>) as { id: string }

      if (images.length > 0) {
        try {
          await equipmentApi.uploadImages(created.id, images)
          toast.success(`Equipment saved with ${images.length} image${images.length > 1 ? 's' : ''}!`)
        } catch {
          toast.warning('Equipment created but image upload failed. You can add images later.')
        }
      }

      try {
        await equipmentApi.submitForApproval(created.id)
        toast.success('Listing submitted for admin approval!')
      } catch {
        toast.warning('Listing saved as draft. Go to dashboard to submit for approval.')
      }
      router.push('/owner/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Equipment</h1>
        <p className="text-gray-500 mt-1">Fill in the details to list your equipment for rent</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Equipment Photos</h2>
              <p className="text-xs text-gray-400 mt-0.5">Upload up to {MAX_IMAGES} photos. First photo will be the cover image.</p>
            </div>
            <span className="text-sm text-gray-400">{images.length}/{MAX_IMAGES}</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-green-200 group">
                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] text-center py-0.5 font-medium">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-brand-400 hover:bg-brand-50 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-400">Add Photo</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g. John Deere 5050D Tractor"
              className={inputClass}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('category', { required: true })} className={inputClass}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <input
                {...register('brand', { required: 'Brand is required' })}
                placeholder="e.g. John Deere"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select {...register('fuelType')} className={inputClass}>
                <option value="">Select fuel type</option>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input
                {...register('modelNumber')}
                placeholder="e.g. 5050D"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={3}
              placeholder="Describe your equipment, condition, features..."
              className={inputClass + ' resize-none'}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Pricing (₹)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Day *</label>
              <input
                type="number"
                {...register('pricePerDay', { required: true, valueAsNumber: true, min: 1 })}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Per Hour</label>
              <input
                type="number"
                {...register('pricePerHour', { valueAsNumber: true })}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <input
                type="number"
                {...register('depositAmount', { valueAsNumber: true })}
                placeholder="0"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                {...register('state', { required: true })}
                placeholder="e.g. Telangana"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <input
                {...register('district', { required: true })}
                placeholder="e.g. Warangal"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input
                {...register('village')}
                placeholder="e.g. Narsampet"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                {...register('address', { required: true })}
                placeholder="Street address or landmark"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  )
}
