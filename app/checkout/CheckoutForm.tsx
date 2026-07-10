'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { placeOrder } from '@/app/actions/checkout'
import { useRouter } from 'next/navigation'

const MapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md">Loading Map...</div>
})

export default function CheckoutForm({ cartTotal, itemsCount, itemIds }: { cartTotal: number, itemsCount: number, itemIds?: string }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    line1: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: 0,
    longitude: 0,
    paymentMethod: 'KHALTI' as 'KHALTI' | 'COD'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLocationSelect = (lat: number, lng: number, address: { city: string; province: string; postalCode: string; line1: string } | null) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ...(address && {
        city: address.city || prev.city,
        province: address.province || prev.province,
        postalCode: address.postalCode || prev.postalCode,
        line1: address.line1 || prev.line1,
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.latitude || !formData.longitude) {
      setError('Please select a delivery location on the map.')
      setIsLoading(false)
      return
    }

    const payload = {
      ...formData,
      itemIds: itemIds ? itemIds.split(',') : undefined
    }

    const result = await placeOrder(payload)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result?.redirectUrl) {
      window.location.href = result.redirectUrl // Khalti redirect
    } else if (result?.success) {
      router.push(`/orders/${result.orderId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* Map Picker */}
      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-2">Delivery Location</h3>
        <p className="text-xs font-bold tracking-widest text-[#86868b] uppercase mb-6">Click on the map to select your delivery location.</p>
        <MapPicker onLocationSelect={handleLocationSelect} />
      </div>

      {/* Address Form */}
      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-6 border-b border-[#d2d2d7] pb-2">Address Details</h3>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
          <div className="sm:col-span-2">
            <label htmlFor="line1" className="block text-xs font-bold tracking-widest uppercase text-[#1d1d1f]">Address Line 1</label>
            <input
              type="text"
              id="line1"
              required
              value={formData.line1}
              onChange={(e) => setFormData(prev => ({ ...prev, line1: e.target.value }))}
              className="mt-2 block w-full border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm border px-4 py-3 rounded-sm bg-white text-[#1d1d1f]"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-xs font-bold tracking-widest uppercase text-[#1d1d1f]">City</label>
            <input
              type="text"
              id="city"
              required
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              className="mt-2 block w-full border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm border px-4 py-3 rounded-sm bg-white text-[#1d1d1f]"
            />
          </div>
          <div>
            <label htmlFor="province" className="block text-xs font-bold tracking-widest uppercase text-[#1d1d1f]">Province / State</label>
            <input
              type="text"
              id="province"
              required
              value={formData.province}
              onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
              className="mt-2 block w-full border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm border px-4 py-3 rounded-sm bg-white text-[#1d1d1f]"
            />
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-xs font-bold tracking-widest uppercase text-[#1d1d1f]">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              className="mt-2 block w-full border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm border px-4 py-3 rounded-sm bg-white text-[#1d1d1f]"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-6 border-b border-[#d2d2d7] pb-2">Payment Method</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="payment-khalti"
              name="paymentMethod"
              type="radio"
              checked={formData.paymentMethod === 'KHALTI'}
              onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'KHALTI' }))}
              className="h-4 w-4 border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
            />
            <label htmlFor="payment-khalti" className="ml-3 block text-sm font-bold text-[#1d1d1f] tracking-wide">
              Khalti Digital Wallet
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="payment-cod"
              name="paymentMethod"
              type="radio"
              checked={formData.paymentMethod === 'COD'}
              onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'COD' }))}
              className="h-4 w-4 border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
            />
            <label htmlFor="payment-cod" className="ml-3 block text-sm font-bold text-[#1d1d1f] tracking-wide">
              Cash on Delivery (COD)
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-[#d2d2d7] pt-6">
        {error && <div className="mb-6 text-xs font-bold tracking-widest uppercase text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-2 border-[#0071e3] bg-[#0071e3] px-4 py-4 text-xs font-bold tracking-widest uppercase text-white hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 transition-colors rounded-full"
        >
          {isLoading ? 'Processing...' : formData.paymentMethod === 'KHALTI' ? 'Pay with Khalti' : 'Place Order'}
        </button>
      </div>
    </form>
  )
}
