import { prisma } from '@/lib/db'
import CategoryForm from '../CategoryForm'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  if (!category) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-black">Edit Category</h1>
      </div>
      <CategoryForm
        initialData={category}
        canDelete={category._count.products === 0}
      />
    </div>
  )
}
