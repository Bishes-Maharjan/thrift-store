'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { addToCartSchema } from '@/lib/schemas'
import { getSessionId, ensureSessionId } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function getCart() {
  const session = await auth()
  const sessionId = await getSessionId() // read-only, safe in Server Components

  const userId = session?.user?.id

  // If no user and no session cookie yet, cart is empty
  if (!userId && !sessionId) return null

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
        orderBy: { id: 'asc' },
      },
    },
  })

  return cart
}

export async function addToCart(formData: FormData) {
  const data = {
    productId: formData.get('productId') as string,
    quantity: parseInt(formData.get('quantity') as string, 10),
  }

  const parsed = addToCartSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Invalid data' }
  }

  const { productId, quantity } = parsed.data

  const session = await auth()
  const sessionId = await ensureSessionId() // Server Action — safe to create cookie
  const userId = session?.user?.id

  // Check product existence and active status
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || !product.isActive) {
    return { error: 'Product is not available' }
  }

  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        sessionId: userId ? null : sessionId,
      },
    })
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  })

  let cartItemId: string

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    const updated = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    })
    cartItemId = updated.id
  } else {
    const created = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    })
    cartItemId = created.id
  }

  revalidatePath('/cart')
  revalidatePath('/products')
  return { success: true, cartItemId }
}

export async function removeCartItem(itemId: string) {
  const session = await auth()
  const sessionId = await getSessionId()
  const userId = session?.user?.id

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (!cart) return { error: 'Cart not found' }

  await prisma.cartItem.deleteMany({
    where: {
      id: itemId,
      cartId: cart.id,
    },
  })

  revalidatePath('/cart')
  return { success: true }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const session = await auth()
  const sessionId = await getSessionId()
  const userId = session?.user?.id

  if (quantity < 1) return { error: 'Quantity must be at least 1' }

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
  })

  if (!cart) return { error: 'Cart not found' }

  // Verify the item belongs to this cart
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: itemId,
      cartId: cart.id,
    }
  })

  if (!cartItem) return { error: 'Cart item not found' }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity }
  })

  revalidatePath('/cart')
  return { success: true }
}
