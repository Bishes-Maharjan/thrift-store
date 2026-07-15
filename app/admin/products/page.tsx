/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/db'
import Link from 'next/link'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import { Prisma } from '@prisma/client'

type AdminProductListItem = Prisma.ProductGetPayload<{
  include: {
    category: true
    images: {
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
      take: 1
    }
    _count: {
      select: { orderItems: true }
    }
  }
}>

export default async function AdminProductsPage() {
  const products: AdminProductListItem[] = await prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      _count: {
        select: { orderItems: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-full"
        >
          Add Product
        </Link>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-[#d2d2d7]">
        <table className="min-w-full divide-y divide-[#d2d2d7]">
          <thead className="bg-[#f5f5f7]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#86868b] uppercase tracking-wider">
                Image
              </th>
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
            {products.map((product) => {
              const imageUrl = product.images[0]?.url
              const canDelete = product._count.orderItems === 0

              return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-[#d2d2d7] bg-[#f5f5f7]">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-[#86868b]">
                          N/A
                        </div>
                      )}
                    </div>
                  </td>
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
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-[#0071e3] hover:text-[#0077ed] font-bold"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-[#1d1d1f] hover:text-[#86868b] font-bold"
                      >
                        View
                      </Link>
                      {canDelete ? (
                        <AdminDeleteButton
                          apiUrl={`/api/products/${product.id}`}
                          title="Delete Product"
                          message={`Are you sure you want to delete "${product.name}"? This can't be undone.`}
                        />
                      ) : (
                        <span
                          className="text-[#86868b] text-xs font-bold uppercase tracking-widest cursor-not-allowed"
                          title="Cannot delete — product is attached to an order"
                        >
                          In orders
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
