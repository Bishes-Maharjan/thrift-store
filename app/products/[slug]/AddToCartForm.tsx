'use client'

import { useState } from 'react'
import { addToCart } from '@/app/actions/cart'
import { ProductVariant } from '@prisma/client'
import { useRouter } from 'next/navigation'

export default function AddToCartForm({ variants }: { variants: ProductVariant[] }) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const activeVariant = variants.find(v => v.id === selectedVariant)

  const handleAddToCart = async (buyNow: boolean = false) => {
    if (buyNow) setIsBuyingNow(true)
    else setIsLoading(true)
    
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('productVariantId', selectedVariant)
    formData.append('quantity', quantity.toString())

    const result = await addToCart(formData)

    if (buyNow) setIsBuyingNow(false)
    else setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      if (buyNow) {
        router.push('/checkout')
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    }
  }

  return (
    <div className="mt-8">
      {/* Variant Selector */}
      <div className="mb-8">
        <h3 className="text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-3">Select Variant</h3>
        <div className="flex gap-3 flex-wrap">
          {variants.map((variant) => {
            const attrs = variant.attributes as Record<string, string>
            const label = attrs ? Object.values(attrs).join(' / ') : variant.sku
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant.id)}
                className={`border rounded-sm py-3 px-6 text-xs font-bold uppercase tracking-widest transition-colors ${
                  selectedVariant === variant.id
                    ? 'border-[#0071e3] bg-[#0071e3] text-white'
                    : 'border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3] hover:bg-[#f5f5f7]'
                } ${variant.stockQuantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={variant.stockQuantity === 0}
              >
                {label} - ${variant.price.toFixed(2)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="quantity" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-3">
          Quantity
        </label>
        <select
          id="quantity"
          name="quantity"
          className="block w-full sm:w-32 pl-3 pr-10 py-3 text-sm border-[#d2d2d7] focus:outline-none focus:ring-[#0071e3] focus:border-[#0071e3] rounded-sm border bg-white text-[#1d1d1f]"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {[...Array(Math.min(10, activeVariant?.stockQuantity || 0))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-bold tracking-widest text-[#86868b] uppercase">
          {activeVariant?.stockQuantity} available in stock
        </p>
      </div>

      {error && <p className="text-red-600 text-xs font-bold tracking-widest uppercase mb-4">{error}</p>}
      {success && <p className="text-green-600 text-xs font-bold tracking-widest uppercase mb-4">Added to cart successfully!</p>}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isLoading || isBuyingNow || !activeVariant || activeVariant.stockQuantity === 0}
          className="flex-1 bg-white border-2 border-[#d2d2d7] py-4 px-8 flex items-center justify-center text-xs font-bold tracking-widest uppercase text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] disabled:opacity-50 transition-colors rounded-full"
        >
          {isLoading ? 'Adding...' : 'Add to bag'}
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isLoading || isBuyingNow || !activeVariant || activeVariant.stockQuantity === 0}
          className="flex-1 bg-[#0071e3] border-2 border-[#0071e3] py-4 px-8 flex items-center justify-center text-xs font-bold tracking-widest uppercase text-white hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071e3] disabled:opacity-50 transition-colors rounded-full"
        >
          {isBuyingNow ? 'Processing...' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
