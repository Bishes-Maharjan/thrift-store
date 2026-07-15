import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
        address: true,
      }
    })
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    
    if (session.user.role !== 'ADMIN' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    const data = await req.json()

    // Determine authorization and limits
    if (session?.user?.role !== 'ADMIN') {
      if (data.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Users can only cancel their orders' }, { status: 401 })
      }
      
      const existingOrder = await prisma.order.findUnique({ where: { id } })
      if (!existingOrder || existingOrder.userId !== session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(existingOrder.status)) {
        return NextResponse.json({ error: 'Order cannot be cancelled at this stage' }, { status: 400 })
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: data.status,
      }
    })

    return NextResponse.json(order)
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
