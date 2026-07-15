import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()

    const order = await prisma.order.findUnique({ where: { id: orderId } })

    if (!order || order.userId !== session.user.id) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/khalti/callback`

    const khaltiPayload = {
        return_url: returnUrl,
        website_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        amount: order.totalAmount * 100,
        purchase_order_id: order.id,
        purchase_order_name: `Order ${order.id}`,
        customer_info: {
            name: session.user.name || 'Customer',
            email: session.user.email || 'customer@example.com',
            phone: session.user.phone || '',
        },
    }

    try {
        const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
            method: 'POST',
            headers: {
                Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(khaltiPayload),
        })

        const data = await response.json()

        if (response.ok && data.payment_url) {
            return NextResponse.json({ redirectUrl: data.payment_url })
        }

        console.error('Khalti init error:', data)
        return NextResponse.json({ error: 'Could not initiate Khalti payment' }, { status: 400 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Error connecting to Khalti' }, { status: 500 })
    }
}