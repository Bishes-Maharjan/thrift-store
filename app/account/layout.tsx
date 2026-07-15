import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account')
  }

  return (
    <div className="bg-[#f5f5f7] min-h-[calc(100vh-80px)]">
      <main className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tighter text-[#1d1d1f] uppercase mb-12">My Account</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <nav className="space-y-2">
              <Link href="/account/details" className="block px-4 py-3 bg-white text-[#1d1d1f] border border-[#d2d2d7] text-xs font-bold tracking-widest uppercase hover:border-[#0071e3] hover:text-[#0071e3] transition-colors rounded-lg">
                Personal Details
              </Link>
              <Link href="/account/orders" className="block px-4 py-3 bg-white text-[#1d1d1f] border border-[#d2d2d7] text-xs font-bold tracking-widest uppercase hover:border-[#0071e3] hover:text-[#0071e3] transition-colors rounded-lg">
                Order History
              </Link>
              <Link href="/cart" className="block px-4 py-3 bg-white text-[#1d1d1f] border border-[#d2d2d7] text-xs font-bold tracking-widest uppercase hover:border-[#0071e3] hover:text-[#0071e3] transition-colors rounded-lg">
                Cart
              </Link>
              <Link href="/account/settings" className="block px-4 py-3 bg-white text-[#1d1d1f] border border-[#d2d2d7] text-xs font-bold tracking-widest uppercase hover:border-[#0071e3] hover:text-[#0071e3] transition-colors rounded-lg">
                Settings
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin/products" className="block px-4 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-lg mt-4">
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </aside>

          <section className="lg:col-span-9 bg-white p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}
