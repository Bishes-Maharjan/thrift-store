import { getCart } from '@/app/actions/cart'
import CartManager from './CartManager'

export default async function CartPage() {
  const cart = await getCart()
  const items = cart?.items || []

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <main className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-4xl font-black tracking-tighter text-[#1d1d1f] uppercase">Shopping Cart</h1>
        <CartManager items={items} />
      </main>
    </div>
  )
}
