'use client'

import { useState } from 'react'
import Link from 'next/link'
import CartItemComponent from './CartItem'

export default function CartManager({ items }: { items: any[] }) {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(items.map((item) => item.id)) // Default all selected
  )

  const toggleItem = (id: string) => {
    const next = new Set(selectedItemIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedItemIds(next)
  }

  const selectedItems = items.filter((item) => selectedItemIds.has(item.id))
  const subtotal = selectedItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  const itemsCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const checkoutUrl = `/checkout?items=${Array.from(selectedItemIds).join(',')}`

  return (
    <form className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
      <section aria-labelledby="cart-heading" className="lg:col-span-7">
        <h2 id="cart-heading" className="sr-only">Items in your shopping cart</h2>

        <ul role="list" className="border-t border-b border-[#d2d2d7] divide-y divide-[#d2d2d7]">
          {items.length === 0 ? (
            <li className="py-12 text-center text-xs font-bold tracking-widest uppercase text-[#86868b]">Your cart is empty</li>
          ) : (
            items.map((item) => (
              <CartItemComponent 
                key={item.id} 
                item={item} 
                isSelected={selectedItemIds.has(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))
          )}
        </ul>
      </section>

      {/* Order summary */}
      <section
        aria-labelledby="summary-heading"
        className="mt-16 bg-white border border-[#d2d2d7] px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5 rounded-xl shadow-sm"
      >
        <h2 id="summary-heading" className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f]">
          Order summary
        </h2>

        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold tracking-widest uppercase text-[#86868b]">Selected Items</dt>
            <dd className="text-sm font-black text-[#1d1d1f]">{itemsCount}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs font-bold tracking-widest uppercase text-[#86868b]">Subtotal</dt>
            <dd className="text-sm font-black text-[#1d1d1f]">${subtotal.toFixed(2)}</dd>
          </div>
          <div className="border-t border-[#d2d2d7] pt-4 flex items-center justify-between">
            <dt className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f]">Order total</dt>
            <dd className="text-xl font-black text-[#1d1d1f]">${subtotal.toFixed(2)}</dd>
          </div>
        </dl>

        <div className="mt-8">
          <Link
            href={checkoutUrl}
            className={`w-full bg-[#0071e3] border-2 border-[#0071e3] py-4 px-4 text-xs font-bold tracking-widest uppercase text-white hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-center block transition-colors rounded-full ${
              selectedItems.length === 0 ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Proceed to Checkout
          </Link>
        </div>
      </section>
    </form>
  )
}
