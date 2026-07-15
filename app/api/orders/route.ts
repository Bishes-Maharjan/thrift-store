import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    // Only admins can query all orders or orders for other users
    if (session.user.role !== 'ADMIN' && userId !== session.user.id) {
      if (userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const where: Prisma.OrderWhereInput = {}
    
    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Order creation is primarily handled via the checkout server action
  // But for API completeness we can implement a basic version or return 405 Method Not Allowed
  return NextResponse.json({ error: 'Method not allowed. Use checkout flow.' }, { status: 405 })
}
