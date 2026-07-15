import { prisma } from '@/lib/db'
import CategoryForm from '../CategoryForm'

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-black">Add Category</h1>
      </div>
      <CategoryForm />
    </div>
  )
}
