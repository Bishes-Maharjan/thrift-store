import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-[#f5f5f7] border-r border-[#d2d2d7] flex flex-col">
        <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-[#d2d2d7] text-[#1d1d1f] bg-white">
          Admin Panel
        </div>
        <AdminNav />
        <div className="p-4 border-t border-[#d2d2d7] bg-white">
          <Link href="/" className="text-[#86868b] hover:text-[#0071e3] transition-colors text-sm">
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
