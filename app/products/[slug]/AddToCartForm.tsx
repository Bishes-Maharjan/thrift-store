'use client'

import { useState } from 'react'
import { addToCart } from '@/app/actions/cart'
import { useRouter } from 'next/navigation'

export default function AddToCartForm({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleAddToCart = async (buyNow: boolean = false) => {
    if (buyNow) setIsBuyingNow(true)
    else setIsLoading(true)
    
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('productId', productId)
    formData.append('quantity', quantity.toString())

    const result = await addToCart(formData)

    if (buyNow) setIsBuyingNow(false)
    else setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      if (buyNow && result.cartItemId) {
        router.push(`/checkout?items=${result.cartItemId}`)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-8">
        <label htmlFor="quantity" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-3">
          Quantity
        </label>
        <div className="flex items-center space-x-4 bg-white border border-[#d2d2d7] rounded-full px-4 py-2 w-max">
          <button 
            type="button" 
            className="text-[#86868b] hover:text-[#1d1d1f] focus:outline-none disabled:opacity-50"
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
          </button>
          <span className="text-[#1d1d1f] font-bold min-w-[2rem] text-center text-sm">{quantity}</span>
          <button 
            type="button" 
            className="text-[#86868b] hover:text-[#1d1d1f] focus:outline-none disabled:opacity-50"
            onClick={() => setQuantity(q => q + 1)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-4">{error}</p>}
      {success && <p className="text-green-600 text-xs font-bold tracking-widest uppercase mb-4">Added to cart successfully!</p>}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isLoading || isBuyingNow}
          className="flex-1 bg-white border-2 border-[#d2d2d7] py-4 px-8 flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] disabled:opacity-50 transition-colors rounded-full"
        >
          {isLoading ? 'Adding...' : 'Add to bag'}
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isLoading || isBuyingNow}
          className="flex-1 bg-[#0071e3] border-2 border-[#0071e3] py-4 px-8 flex items-center justify-center text-xs font-bold tracking-widest uppercase text-white hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] disabled:opacity-50 transition-colors rounded-full"
        >
          {isBuyingNow ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
