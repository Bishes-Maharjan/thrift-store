import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const q = searchParams.get('q')

    const where: Prisma.ProductWhereInput = { isActive: true }
    if (category) where.category = { slug: category }
    if (q) where.name = { contains: q, mode: 'insensitive' }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      }
    })
    return NextResponse.json(products)
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    
    if (!data.name || !data.slug || !data.categoryId || data.price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        categoryId: data.categoryId,
        price: parseFloat(data.price),
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    })

    // If images were provided (assumes they are pre-uploaded to cloudinary and we just save the URL/publicId)
    if (data.images && Array.isArray(data.images)) {
      for (const [index, img] of data.images.entries()) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: index === 0,
            sortOrder: index,
          }
        })
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true }
    })

    return NextResponse.json(fullProduct, { status: 201 })
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error))
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Product slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
