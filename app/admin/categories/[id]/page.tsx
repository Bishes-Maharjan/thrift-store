import { prisma } from '@/lib/db'
import CategoryForm from '../CategoryForm'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
  ])

  if (!category) return notFound()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-black">Edit Category</h1>
      </div>
      <CategoryForm initialData={category} />
    </div>
  )
}
