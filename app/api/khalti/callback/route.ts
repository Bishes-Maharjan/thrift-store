import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pidx = searchParams.get('pidx')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!pidx) {
    return NextResponse.redirect(new URL(`/cart?error=missing_payment_id`, appUrl))
  }

  try {
    // 1. Find the payment in our DB
    const payment = await prisma.payment.findFirst({
      where: { pidx },
      include: { order: { include: { items: true } } }
    })

    if (!payment) {
      return NextResponse.redirect(new URL(`/cart?error=payment_not_found`, appUrl))
    }

    // 2. Verify with Khalti
    const khaltiPayload = { pidx }
    
    const response = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(khaltiPayload)
    })

    const data = await response.json()

    if (response.ok && data.status === 'Completed') {
      // Payment Successful
      // Update payment
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          paidAt: new Date()
        }
      })

      // Update Order
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID' }
      })

      return NextResponse.redirect(new URL(`/orders/${payment.orderId}?success=true`, appUrl))
    } else {
      // Payment failed or user cancelled or pending
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' }
      })
      return NextResponse.redirect(new URL(`/orders/${payment.orderId}?error=payment_failed`, appUrl))
    }

  } catch (error) {
    console.error('Khalti callback error', error)
    return NextResponse.redirect(new URL(`/cart?error=internal_payment_error`, appUrl))
  }
}
