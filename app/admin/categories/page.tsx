import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors"
        >
          Add Category
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-[#d2d2d7]">
        <table className="min-w-full divide-y divide-[#d2d2d7]">
          <thead className="bg-[#f5f5f7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Products
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#d2d2d7]">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1d1d1f]">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                  {category.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                  {category._count.products}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-black hover:text-gray-600 font-bold"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
