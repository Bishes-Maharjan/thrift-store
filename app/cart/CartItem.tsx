/* eslint-disable @next/next/no-img-element */
'use client'

import { removeCartItem, updateCartItemQuantity } from '@/app/actions/cart'
import { useState } from 'react'
import DeleteModal from '@/components/ui/DeleteModal'
import type { CartItemWithDetails } from '@/types/db-schema'

export default function CartItemComponent({ 
  item,
  isSelected,
  onToggle
}: { 
  item: CartItemWithDetails
  isSelected?: boolean
  onToggle?: () => void 
}) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    await removeCartItem(item.id)
    setIsRemoving(false)
    setIsModalOpen(false)
  }

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return
    setIsUpdating(true)
    await updateCartItemQuantity(item.id, newQuantity)
    setIsUpdating(false)
  }

  const image = item.product.images[0]?.url

  return (
    <li className="flex py-6">
      {onToggle && (
        <div className="flex items-center pr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="h-4 w-4 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3]"
          />
        </div>
      )}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[#d2d2d7]">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover object-center" />
        ) : (
          <div className="h-full w-full bg-[#f5f5f7]" />
        )}
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium text-[#1d1d1f]">
            <h3>{item.product.name}</h3>
            <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
          {/* We don't have sku anymore, so just leave empty or remove sku. Product slug?  */}
          <p className="mt-1 text-sm text-[#86868b]">{item.product.slug}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center space-x-3 bg-white border border-[#d2d2d7] rounded-full px-3 py-1">
            <button 
              type="button" 
              className="text-[#86868b] hover:text-[#1d1d1f] focus:outline-none disabled:opacity-50"
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
            </button>
            <span className="text-[#1d1d1f] font-bold min-w-[1.5rem] text-center">{item.quantity}</span>
            <button 
              type="button" 
              className="text-[#86868b] hover:text-[#1d1d1f] focus:outline-none disabled:opacity-50"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={isUpdating}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </button>
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isRemoving}
              className="font-medium text-[#0071e3] hover:text-[#0077ed] disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleRemove}
        title="Remove Item"
        message={`Are you sure you want to remove ${item.product.name} from your cart?`}
        isDeleting={isRemoving}
      />
    </li>
  )
}
