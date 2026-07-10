/* eslint-disable @next/next/no-img-element */
import { getCart } from '@/app/actions/cart'
import CheckoutForm from './CheckoutForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/checkout')
  }

  const resolvedParams = await searchParams
  const cart = await getCart()
  let items = cart?.items || []

  const selectedItemsRaw = resolvedParams.items
  if (selectedItemsRaw && typeof selectedItemsRaw === 'string') {
    const selectedItemIds = new Set(selectedItemsRaw.split(','))
    items = items.filter(item => selectedItemIds.has(item.id))
  }

  if (items.length === 0) {
    redirect('/cart')
  }

  const subtotal = items.reduce((acc, item) => acc + item.productVariant.price * item.quantity, 0)
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const itemIdsParam = items.map(i => i.id).join(',')

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <main className="max-w-7xl mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tighter text-[#1d1d1f] uppercase mb-8">Checkout</h1>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
              <CheckoutForm cartTotal={subtotal} itemsCount={itemsCount} itemIds={itemIdsParam} />
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="bg-white px-4 py-6 sm:p-6 lg:p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
              <h2 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-6">Order Summary</h2>
              <ul className="divide-y divide-[#d2d2d7] border-t border-[#d2d2d7]">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 w-20 h-24 bg-[#f5f5f7] overflow-hidden rounded-lg">
                      {item.productVariant.product.images[0] && (
                        <img src={item.productVariant.product.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="ml-6 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between text-sm font-bold text-[#1d1d1f] uppercase tracking-wide">
                        <h3>{item.productVariant.product.name}</h3>
                        <p>${(item.productVariant.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-2 text-xs font-bold tracking-widest uppercase text-[#86868b]">Qty: {item.quantity}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#d2d2d7] pt-6 mt-6">
                <div className="flex justify-between text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-6">
                  <p>Total ({itemsCount} items)</p>
                  <p className="text-xl font-black">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
