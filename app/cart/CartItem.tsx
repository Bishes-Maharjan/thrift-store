/* eslint-disable @next/next/no-img-element */
'use client'

import { removeCartItem } from '@/app/actions/cart'
import { useState } from 'react'
import { Prisma } from '@prisma/client'

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    productVariant: {
      include: {
        product: {
          include: { images: true }
        }
      }
    }
  }
}>

export default function CartItemComponent({ 
  item,
  isSelected,
  onToggle
}: { 
  item: CartItemWithProduct
  isSelected?: boolean
  onToggle?: () => void 
}) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    await removeCartItem(item.id)
    setIsRemoving(false)
  }

  const image = item.productVariant.product.images[0]?.url

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
            <h3>{item.productVariant.product.name}</h3>
            <p className="ml-4">${(item.productVariant.price * item.quantity).toFixed(2)}</p>
          </div>
          <p className="mt-1 text-sm text-[#86868b]">{item.productVariant.sku}</p>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <p className="text-[#86868b]">Qty {item.quantity}</p>

          <div className="flex">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="font-medium text-[#0071e3] hover:text-[#0077ed] disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
