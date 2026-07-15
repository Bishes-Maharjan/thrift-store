
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import CancelOrderButton from './CancelOrderButton'
import ContinuePaymentButton from '@/components/ContinuewithPayment'
import type { OrderWithDetails } from '@/types/db-schema'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const { id } = await params

  const order: OrderWithDetails | null = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      address: true,
      payment: true,
    }
  })
  const payment = await prisma.payment.findUnique({
    where: {
      orderId: id
    }
  })

  if (!order || (order.userId !== session.user.id && session.user.role !== 'ADMIN')) {
    return notFound()
  }
  const handleSubmit = async () => {

    // Initiate Khalti payment
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/khalti/callback`
    const purchaseOrderId = order.id

    const khaltiPayload = {
      return_url: returnUrl,
      website_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      amount: order.totalAmount * 100, // Khalti expects amount in paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Order ${order.id}`,
      customer_info: {
        name: session.user.name || 'Customer',
        email: session.user.email || 'customer@example.com',
        phone: session.user.phone || '' // Placeholder if no phone
      }
    }

    try {
      const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(khaltiPayload)
      })

      const data = await response.json()

      if (response.ok && data.payment_url) {
        // Update payment with pidx
        // await prisma.payment.update({
        //   where: { id: payment.id },
        //   data: { pidx: data.pidx }
        // })

        // // Remove purchased items from cart
        // await prisma.cartItem.deleteMany({
        //   where: { id: { in: order.items.map(i => i.id) } }
        // })

        return { redirectUrl: data.payment_url }
      } else {
        console.error('Khalti init error:', data)
        return { error: 'Could not initiate Khalti payment' }
      }
    } catch (e) {
      console.error(e)
      return { error: 'Error connecting to Khalti' }
    }

  }

  return (
    <div className="bg-[#f5f5f7] min-h-screen pt-12 pb-24">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#86868b]">Thank you!</h1>
          <p className="mt-2 text-4xl font-black tracking-tighter uppercase text-[#1d1d1f]">Order Confirmed</p>
          <p className="mt-2 text-sm text-[#86868b]">Your order #{order.id.slice(0, 8).toUpperCase()} has been placed.</p>
          <span className={`inline-block mt-4 px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
            }`}>
            {order.status}
          </span>
        </div>

        <div className="mt-10 border-t border-[#d2d2d7]">
          <h2 className="sr-only">Your order</h2>

          <h3 className="sr-only">Items</h3>
          {order.items.map((item) => (
            <div key={item.id} className="py-8 border-b border-[#d2d2d7] flex justify-between items-start">
              <div className="flex-auto flex flex-col">
                <h4 className="text-sm font-bold uppercase tracking-wide text-[#1d1d1f]">{item.productName}</h4>
                <p className="mt-2 text-xs font-bold tracking-widest uppercase text-[#86868b]">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-black text-[#1d1d1f]">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="mt-8 grid grid-cols-2 gap-x-6 text-sm">
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Delivery Address</dt>
              <dd className="text-sm text-[#1d1d1f]">
                <address className="not-italic">
                  <span className="block">{order.address.line1}</span>
                  <span className="block">{order.address.city}, {order.address.province} {order.address.postalCode}</span>
                </address>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold tracking-widest uppercase text-[#86868b] mb-2">Payment Method</dt>
              <dd className="text-sm text-[#1d1d1f]">
                <p className="font-bold">{order.payment?.method}</p>
                <p className="mt-1 text-[#86868b]">Status: <span className="font-bold text-[#1d1d1f]">{order.payment?.status}</span></p>
              </dd>
            </div>
          </div>

          <div className="mt-10 border-t border-[#d2d2d7] pt-6 flex justify-between items-center">
            <dt className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f]">Total</dt>
            <dd className="text-xl font-black text-[#1d1d1f]">${order.totalAmount.toFixed(2)}</dd>
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4">
          {['PENDING', 'PAID'].includes(order.status) && (
            <CancelOrderButton orderId={order.id} />
          )}
          {/* <Link href="/products" className="bg-[#0071e3] text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#0077ed] transition-colors rounded-full flex items-center justify-center">
            Continue Shopping
          </Link> */}
          {order.status == 'PENDING' && payment?.method == 'KHALTI' && (
            <ContinuePaymentButton orderId={order.id} />
          )}

        </div>
      </main>
    </div>
  )
}
