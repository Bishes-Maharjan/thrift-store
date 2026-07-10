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
          productVariant: {
            include: {
              product: {
                include: { images: true },
              },
            },
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
    productVariantId: formData.get('productVariantId') as string,
    quantity: parseInt(formData.get('quantity') as string, 10),
  }

  const parsed = addToCartSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Invalid data' }
  }

  const { productVariantId, quantity } = parsed.data

  const session = await auth()
  const sessionId = await ensureSessionId() // Server Action — safe to create cookie
  const userId = session?.user?.id

  // Check stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
  })

  if (!variant || variant.stockQuantity < quantity) {
    return { error: 'Not enough stock available' }
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
      productVariantId,
    },
  })

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity
    if (variant.stockQuantity < newQuantity) {
      return { error: 'Not enough stock available' }
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    })
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId,
        quantity,
      },
    })
  }

  revalidatePath('/cart')
  revalidatePath('/products')
  return { success: true }
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
