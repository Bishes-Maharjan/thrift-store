import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { deleteCloudinaryImage } from '@/app/actions/cloudinary'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

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

    // 1. Get existing images to compare for deletions
    const existingImages = await prisma.productImage.findMany({
      where: { productId: id }
    })

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

    if (data.images && Array.isArray(data.images)) {
      // Find removed images
      const incomingPublicIds = new Set(data.images.map((img: any) => img.publicId).filter(Boolean))
      const imagesToRemove = existingImages.filter(img => img.publicId && !incomingPublicIds.has(img.publicId))

      // Delete removed images from Cloudinary
      for (const img of imagesToRemove) {
        if (img.publicId) {
          try {
            await deleteCloudinaryImage(img.publicId)
          } catch (e) {
            console.error(`Failed to delete image ${img.publicId} from cloudinary`, e)
          }
        }
      }

      // Delete all existing image records for this product
      await prisma.productImage.deleteMany({
        where: { productId: id }
      })

      // Recreate image records in the new order
      for (const [index, img] of data.images.entries()) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: img.url,
            publicId: img.publicId,
            isPrimary: index === 0,
            sortOrder: index,
          }
        })
      }
    }

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

    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const orderItemCount = await prisma.orderItem.count({
      where: { productId: id },
    })

    if (orderItemCount > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete this product because it is attached to one or more orders.',
        },
        { status: 400 }
      )
    }

    const productImages = await prisma.productImage.findMany({
      where: { productId: id },
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

    revalidatePath('/admin/products')
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
