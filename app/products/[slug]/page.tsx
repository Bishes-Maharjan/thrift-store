/* eslint-disable @next/next/no-img-element */
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import AddToCartForm from './AddToCartForm'
import Link from 'next/link'
import ProductGallery from './ProductGallery'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!product) return notFound()

  // Fetch related products (same category)
  const relatedProducts = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 }, category: true },
    take: 4,
  })

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="pt-6 pb-16 sm:pb-24">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol role="list" className="flex items-center space-x-4">
            <li>
              <div className="flex items-center">
                <Link href="/products" className="mr-4 text-xs font-bold uppercase tracking-widest text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                  Products
                </Link>
                <svg viewBox="0 0 6 20" aria-hidden="true" className="h-5 w-auto text-[#d2d2d7]">
                  <path d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z" fill="currentColor" />
                </svg>
              </div>
            </li>
            <li className="text-xs font-bold uppercase tracking-widest text-[#1d1d1f]">
              {product.name}
            </li>
          </ol>
        </nav>
        
        <div className="mx-auto mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
            {/* Image gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product info */}
            <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
              <h1 className="text-4xl font-black tracking-tighter text-[#1d1d1f] uppercase">{product.name}</h1>
              <p className="text-sm font-bold tracking-widest uppercase text-[#86868b] mt-2">{product.category.name}</p>

              <div className="mt-6 border-t border-b border-[#d2d2d7] py-6">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl font-black text-[#1d1d1f]">${product.price.toFixed(2)}</p>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <div className="text-sm text-[#1d1d1f] space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
              </div>

              <div className="mt-10 flex gap-4">
                {product.isActive ? (
                  <AddToCartForm productId={product.id} />
                ) : (
                  <p className="text-red-600 font-bold tracking-widest uppercase text-sm">Out of stock</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-32 pt-10 border-t border-[#d2d2d7]">
              <h2 className="text-sm font-bold tracking-widest uppercase text-[#1d1d1f] mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map((relProduct) => (
                  <Link
                    key={relProduct.id}
                    href={`/products/${relProduct.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-[#f5f5f7] flex items-center justify-center relative rounded-xl">
                      {relProduct.images[0] ? (
                        <img
                          src={relProduct.images[0].url}
                          alt={relProduct.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-[#86868b] text-xs tracking-widest uppercase">No Image</span>
                      )}
                    </div>
                    <div className="mt-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wide">
                          {relProduct.name}
                        </h3>
                      </div>
                      <p className="text-sm font-bold text-[#1d1d1f]">${relProduct.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
