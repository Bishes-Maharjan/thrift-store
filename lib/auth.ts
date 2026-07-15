import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { prisma } from './db'
import { cookies } from 'next/headers'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (passwordsMatch) {
          const cookieStore = await cookies()
          const sessionId = cookieStore.get('guest_session_id')?.value

          if (sessionId) {
            // Find guest cart
            const guestCart = await prisma.cart.findFirst({
              where: { sessionId, userId: null },
              include: { items: true }
            })

            if (guestCart && guestCart.items.length > 0) {
              // Find user cart
              let userCart = await prisma.cart.findFirst({
                where: { userId: user.id }
              })

              if (!userCart) {
                userCart = await prisma.cart.create({ data: { userId: user.id } })
              }

              // Move items
              for (const item of guestCart.items) {
                const existing = await prisma.cartItem.findFirst({
                  where: { cartId: userCart.id, productId: item.productId }
                })

                if (existing) {
                  await prisma.cartItem.update({
                    where: { id: existing.id },
                    data: { quantity: existing.quantity + item.quantity }
                  })
                } else {
                  await prisma.cartItem.update({
                    where: { id: item.id },
                    data: { cartId: userCart.id }
                  })
                }
              }
              // Delete old guest cart
              await prisma.cart.delete({ where: { id: guestCart.id } })
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone
          }
        }

        return null
      },
    }),
  ],
})
