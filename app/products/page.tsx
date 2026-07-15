/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import Link from 'next/link'

export default async function ProductsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const rawQ = resolvedParams.q || resolvedParams.search
  const q = typeof rawQ === 'string' ? rawQ : undefined
  const categorySlug = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined

  const where: Prisma.ProductWhereInput = { isActive: true }
  
  if (q) {
    where.name = { contains: q, mode: 'insensitive' }
  }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Categories are flat, so just fetch them all
  const categories = await prisma.category.findMany()

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <form className="mb-10" method="GET" action="/products">
            <label htmlFor="search" className="sr-only">Search</label>
            <input
              type="text"
              name="search"
              id="search"
              defaultValue={q}
              placeholder="Search products..."
              className="w-full border-[#d2d2d7] rounded-sm focus:ring-[#0071e3] focus:border-[#0071e3] px-4 py-3 border text-sm bg-white text-[#1d1d1f]"
            />
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
          </form>

          <h3 className="text-xs font-bold tracking-widest uppercase text-[#1d1d1f] mb-6">Categories</h3>
          <ul className="space-y-4">
            <li>
              <Link href="/products" className={`block text-sm uppercase tracking-wide font-bold transition-colors ${!categorySlug ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                All Products
              </Link>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}${q ? `&search=${q}` : ''}`} className={`block text-sm uppercase tracking-wide font-bold transition-colors ${categorySlug === c.slug ? 'text-[#1d1d1f]' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="mb-10 border-b border-[#d2d2d7] pb-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-[#1d1d1f]">
              {categorySlug ? `Category: ${categorySlug}` : 'All Products'} 
              {q && <span className="block text-xl text-gray-500 mt-2 font-light">Search results for &quot;{q}&quot;</span>}
            </h1>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 bg-white border border-dashed border-[#d2d2d7] rounded-xl">
              <p className="text-sm font-bold tracking-widest uppercase text-[#86868b]">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center relative rounded-xl">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-[#86868b] text-xs tracking-widest uppercase">No Image</span>
                    )}
                    {/* Micro-animation overlay */}
                    <div className="absolute inset-0 bg-[#1d1d1f]/0 group-hover:bg-[#1d1d1f]/5 transition-all duration-300"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wide">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#86868b] uppercase tracking-widest">{product.category.name}</p>
                    </div>
                    <p className="text-sm font-bold text-[#1d1d1f]">${product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
