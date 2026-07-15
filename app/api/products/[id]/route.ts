import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteCloudinaryImage } from '@/app/actions/cloudinary'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
      }
    })
    
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
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

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        isActive: data.isActive,
      }
    })

    return NextResponse.json(product)
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (error.code === 'P2002') return NextResponse.json({ error: 'Product slug already exists' }, { status: 400 })
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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
    
    // Cleanup images from Cloudinary before deleting from DB
    const productImages = await prisma.productImage.findMany({
      where: { productId: id }
    })
    
    for (const img of productImages) {
      if (img.publicId) {
        try {
          await deleteCloudinaryImage(img.publicId)
        } catch (e) {
          console.error(`Failed to delete image ${img.publicId} from cloudinary`, e)
        }
      }
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
