'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteModal from '@/components/ui/DeleteModal'

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    setIsCancelling(true)
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      
      if (!res.ok) {
        throw new Error('Failed to cancel order')
      }
      
      router.refresh()
      setIsModalOpen(false)
    } catch (error) {
      alert('Could not cancel order. Please try again.')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-red-50 text-red-600 px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-red-100 transition-colors rounded-full border border-red-200"
      >
        Cancel Order
      </button>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        isDeleting={isCancelling}
      />
    </>
  )
}
