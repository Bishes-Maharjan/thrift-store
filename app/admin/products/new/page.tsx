import { prisma } from '@/lib/db'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-[#1d1d1f]">Add Product</h1>
      </div>
      <ProductForm categories={categories} />
    </div>
  )
}
