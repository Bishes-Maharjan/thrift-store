import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
  const [productCount, orderCount, categoryCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
  ])

  return (
    <div>
      <h1 className="text-3xl font-black uppercase text-[#1d1d1f] mb-8">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-[#d2d2d7] rounded-xl shadow-sm">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#86868b]">Total Products</h2>
          <p className="text-4xl font-black text-[#1d1d1f] mt-2">{productCount}</p>
        </div>
        <div className="bg-white p-6 border border-[#d2d2d7] rounded-xl shadow-sm">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#86868b]">Total Orders</h2>
          <p className="text-4xl font-black text-[#1d1d1f] mt-2">{orderCount}</p>
        </div>
        <div className="bg-white p-6 border border-[#d2d2d7] rounded-xl shadow-sm">
          <h2 className="text-xs font-bold tracking-widest uppercase text-[#86868b]">Categories</h2>
          <p className="text-4xl font-black text-[#1d1d1f] mt-2">{categoryCount}</p>
        </div>
      </div>
    </div>
  )
}
