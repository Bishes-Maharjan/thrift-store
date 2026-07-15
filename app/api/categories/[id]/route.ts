import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({
      where: { id }
    })
    
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
      }
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    if (error.code === 'P2002') return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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
    
    await prisma.category.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
