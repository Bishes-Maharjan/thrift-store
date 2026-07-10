import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-[#d2d2d7] flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-[#d2d2d7] text-[#1d1d1f]">
          Admin Panel
        </div>
        <nav className="flex-1 py-4 space-y-1">
          <Link href="/admin/products" className="block px-6 py-2 text-[#86868b] hover:text-[#0071e3] hover:bg-[#f5f5f7] transition-colors">
            Products
          </Link>
          <Link href="/admin/categories" className="block px-6 py-2 text-[#86868b] hover:text-[#0071e3] hover:bg-[#f5f5f7] transition-colors">
            Categories
          </Link>
          <Link href="/admin/orders" className="block px-6 py-2 text-[#86868b] hover:text-[#0071e3] hover:bg-[#f5f5f7] transition-colors">
            Orders
          </Link>
        </nav>
        <div className="p-4 border-t border-[#d2d2d7]">
          <Link href="/" className="text-[#86868b] hover:text-[#0071e3] transition-colors">
            &larr; Back to Store
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-[#f5f5f7] overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
