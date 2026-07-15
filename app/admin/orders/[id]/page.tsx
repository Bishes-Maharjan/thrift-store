import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import OrderStatusEditor from '../OrderStatusEditor'
import Link from 'next/link'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      payment: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order) return notFound()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-[#1d1d1f]">Order Details</h1>
        <Link href="/admin/orders" className="text-xs font-bold uppercase tracking-widest text-[#0071e3] hover:underline">
          &larr; Back to Orders
        </Link>
      </div>

      <div className="bg-white p-8 border border-[#d2d2d7] rounded-xl shadow-sm space-y-8">
        
        {/* Status Editing */}
        <div className="bg-[#f5f5f7] p-6 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center border border-[#d2d2d7]">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-1">Order Status</p>
            <p className="text-sm font-black text-[#1d1d1f]">Current: {order.status}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <OrderStatusEditor orderId={order.id} currentStatus={order.status as any} />
          </div>
        </div>

        {/* Customer & Address Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-black uppercase text-[#1d1d1f] mb-4 border-b border-[#d2d2d7] pb-2">Customer Info</h3>
            <p className="text-sm text-[#1d1d1f]"><span className="font-bold">Name:</span> {order.user.name}</p>
            <p className="text-sm text-[#1d1d1f]"><span className="font-bold">Email:</span> {order.user.email}</p>
            <p className="text-sm text-[#1d1d1f]"><span className="font-bold">Phone:</span> {order.user.phone || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-[#1d1d1f] mb-4 border-b border-[#d2d2d7] pb-2">Shipping Address</h3>
            <p className="text-sm text-[#1d1d1f]">{order.address.line1}</p>
            <p className="text-sm text-[#1d1d1f]">{order.address.city}, {order.address.province} {order.address.postalCode}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div>
          <h3 className="text-sm font-black uppercase text-[#1d1d1f] mb-4 border-b border-[#d2d2d7] pb-2">Payment Info</h3>
          <p className="text-sm text-[#1d1d1f]"><span className="font-bold">Method:</span> {order.payment?.method || 'N/A'}</p>
          <p className="text-sm text-[#1d1d1f]">
            <span className="font-bold">Status:</span> 
            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-bold rounded-full ${
              order.payment?.status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
              order.payment?.status === 'FAILED' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {order.payment?.status || 'PENDING'}
            </span>
          </p>
          {order.payment?.pidx && (
            <p className="text-sm text-[#1d1d1f] mt-1"><span className="font-bold">Transaction ID (PIDX):</span> {order.payment.pidx}</p>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-sm font-black uppercase text-[#1d1d1f] mb-4 border-b border-[#d2d2d7] pb-2">Items</h3>
          <ul className="divide-y divide-[#d2d2d7]">
            {order.items.map(item => (
              <li key={item.id} className="py-4 flex justify-between">
                <div>
                  <p className="text-sm font-bold text-[#1d1d1f]">{item.product.name}</p>
                  <p className="text-xs text-[#86868b] uppercase tracking-widest mt-1">SKU: {item.product.slug} | Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-[#1d1d1f]">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="flex justify-end mt-4 pt-4 border-t border-[#d2d2d7]">
            <p className="text-lg font-black text-[#1d1d1f]">Total: ${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
