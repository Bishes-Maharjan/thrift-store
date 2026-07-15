import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OrderWithDetails } from '@/types/db-schema'

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account/orders')
  }

  const orders: OrderWithDetails[] = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      payment: true,
      address: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <>
      <h2 className="text-xl font-black uppercase text-[#1d1d1f] mb-8 border-b border-[#d2d2d7] pb-4">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#f5f5f7] border border-dashed border-[#d2d2d7] rounded-xl">
          <p className="text-sm font-bold tracking-widest uppercase text-[#86868b]">You haven't placed any orders yet.</p>
          <div className="mt-6">
            <Link href="/products" className="inline-block bg-[#0071e3] text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#0077ed] transition-colors rounded-full">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border border-[#d2d2d7] bg-white rounded-xl shadow-sm">
              <div className="bg-[#f5f5f7] px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#d2d2d7] rounded-t-xl">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-1">Order Placed</p>
                  <p className="text-sm font-black text-[#1d1d1f]">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-1">Total</p>
                  <p className="text-sm font-black text-[#1d1d1f]">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-1">Order #</p>
                  <p className="text-sm font-black text-[#1d1d1f]">{order.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                  <Link href={`/orders/${order.id}`} className="text-xs font-bold tracking-widest uppercase text-[#0071e3] hover:underline mb-2 sm:mb-0">
                    View Details
                  </Link>
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase mt-2 sm:mt-1 ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-4">{order.items!.length} {order.items!.length === 1 ? 'Item' : 'Items'}</p>
                <ul className="divide-y divide-[#d2d2d7] border-t border-[#d2d2d7]">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-4 flex justify-between">
                      <div className="flex">
                        <div>
                          <h4 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wide">{item.productName}</h4>
                          <p className="mt-1 text-xs font-bold tracking-widest uppercase text-[#86868b]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-[#1d1d1f]">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
