/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/db'
import Image from 'next/image';
import Link from 'next/link'

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  })

  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      category: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })
  console.log(featuredProducts);
  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-white py-24 text-center border-b border-[#d2d2d7]">
        <h1 className="text-5xl font-black tracking-tighter sm:text-7xl uppercase text-[#1d1d1f]">Thrift.</h1>
        <p className="mt-6 text-xl text-[#86868b] font-light tracking-wide uppercase">Minimalist Modern Commerce.</p>
        <div className="mt-10">
          <Link
            href="/products"
            className="bg-[#0071e3] text-white px-8 py-4 text-sm tracking-widest uppercase font-bold hover:bg-[#0077ed] transition-colors rounded-full"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f]">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group bg-white p-8 text-center border border-[#d2d2d7] hover:border-[#0071e3] transition-all rounded-2xl shadow-sm hover:shadow-md"
            >
              <h3 className="text-lg font-black text-[#1d1d1f] tracking-tight">{category.name}</h3>
              <p className="text-xs text-[#86868b] mt-2 uppercase tracking-widest">{category._count.products} Products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f]">Featured Collection</h2>
          <Link href="/products" className="text-xs font-bold tracking-widest uppercase text-[#0071e3] hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group block"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center relative rounded-xl">
                {product.images[0] ? (
                  <Image
                    width={600}
                    height={600}
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
      </section>

      <footer className="bg-white py-16 text-center mt-auto border-t border-[#d2d2d7]">
        <h2 className="text-2xl font-black tracking-tighter mb-4 text-[#1d1d1f]">THRIFT.</h2>
        <p className="text-xs text-[#86868b] tracking-widest uppercase">&copy; 2026 THRIFT. All rights reserved.</p>
      </footer>
    </div>
  )
}
