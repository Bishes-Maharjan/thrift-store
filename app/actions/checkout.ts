'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function placeOrder(formData: { line1: string; city: string; province: string; postalCode?: string; latitude: number; longitude: number; paymentMethod: 'KHALTI' | 'COD', itemIds?: string[] }) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: 'You must be logged in to place an order' }
  }

  const { line1, city, province, postalCode, latitude, longitude, paymentMethod, itemIds } = formData

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  if (!cart || cart.items.length === 0) {
    return { error: 'Your cart is empty' }
  }

  // Filter items if itemIds were provided
  const itemsToPurchase = itemIds && itemIds.length > 0
    ? cart.items.filter(item => itemIds.includes(item.id))
    : cart.items

  if (itemsToPurchase.length === 0) {
    return { error: 'No items selected for purchase' }
  }

  // Check if all selected items are still active
  const inactiveItems = itemsToPurchase.filter(item => !item.product.isActive)
  if (inactiveItems.length > 0) {
    return { error: 'One or more items are no longer available for purchase' }
  }

  // Calculate total and snapshot items
  let totalAmount = 0
  const orderItemsData = itemsToPurchase.map(item => {
    totalAmount += item.product.price * item.quantity
    return {
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      priceAtPurchase: item.product.price
    }
  })

  // Create address
  let address = await prisma.address.findFirst({
    where: {
      userId,
      line1,
      city,
      province,
      postalCode,
    }
  })


  if (!address) {
    address = await prisma.address.create({
      data: {
        userId,
        line1,
        city,
        province,
        postalCode,
        latitude,
        longitude,
      }
    })
  }
  // Create Order
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      addressId: address.id,
      status: 'PENDING',
      items: {
        create: orderItemsData
      }
    }
  })

  // Create Payment record
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method: paymentMethod,
      amount: totalAmount,
      status: 'PENDING'
    }
  })

  // If COD, we can confirm immediately (no stock decrement needed anymore)
  if (paymentMethod === 'COD') {
    // Remove purchased items from cart
    await prisma.cartItem.deleteMany({
      where: { id: { in: itemsToPurchase.map(i => i.id) } }
    })

    return { success: true, orderId: order.id }
  }

  if (paymentMethod === 'KHALTI') {
    // Initiate Khalti payment
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/khalti/callback`
    const purchaseOrderId = order.id

    const khaltiPayload = {
      return_url: returnUrl,
      website_url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      amount: totalAmount * 100, // Khalti expects amount in paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Order ${order.id}`,
      customer_info: {
        name: session.user.name || 'Customer',
        email: session.user.email || 'customer@example.com',
        phone: session.user.phone || '9800000000' // Placeholder if no phone
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
        await prisma.payment.update({
          where: { id: payment.id },
          data: { pidx: data.pidx }
        })

        // Remove purchased items from cart
        await prisma.cartItem.deleteMany({
          where: { id: { in: itemsToPurchase.map(i => i.id) } }
        })

        console.log('Khalti payment initiated successfully', data)
        return { redirectUrl: data.payment_url, pidx: data.pidx }
      } else {
        console.error('Khalti init error:', data)
        return { error: 'Could not initiate Khalti payment' }
      }
    } catch (e) {
      console.error(e)
      return { error: 'Error connecting to Khalti' }
    }
  }

  return { error: 'Invalid payment method' }
}

export async function getPayment(orderId: string) {
  const payment = await prisma.payment.findFirst({ where: { orderId }, include: { order: true } })
  return payment?.pidx
}
