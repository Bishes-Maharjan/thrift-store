import { prisma } from '@/lib/db'
import ProductForm from '../ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { orderItems: true },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-[#1d1d1f]">Edit Product</h1>
      </div>
      <ProductForm
        initialData={product}
        categories={categories}
        canDelete={product._count.orderItems === 0}
      />
    </div>
  )
}
