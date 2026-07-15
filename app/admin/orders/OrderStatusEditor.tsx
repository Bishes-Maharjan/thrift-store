'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export default function OrderStatusEditor({ 
  orderId, 
  currentStatus 
}: { 
  orderId: string, 
  currentStatus: OrderStatus 
}) {
  const router = useRouter()
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleUpdate = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update status')
      }
      
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  const statuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  return (
    <div className="flex items-center space-x-4">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="block w-48 border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-2 bg-white text-[#1d1d1f] rounded-sm"
      >
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      
      <button
        onClick={handleUpdate}
        disabled={isLoading || status === currentStatus}
        className="bg-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 disabled:opacity-50 rounded-full transition-colors"
      >
        {isLoading ? 'Saving...' : 'Update'}
      </button>
      
      {error && <span className="text-red-500 text-xs font-bold">{error}</span>}
    </div>
  )
}
