import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors"
        >
          Add Product
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
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#d2d2d7]">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#1d1d1f]">{product.name}</div>
                  <div className="text-sm text-[#86868b]">{product.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#86868b]">
                  {product.category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1d1d1f]">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-black hover:text-gray-600 font-bold mr-4"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-[#0071e3] hover:text-[#0077ed] font-bold"
                  >
                    View
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
