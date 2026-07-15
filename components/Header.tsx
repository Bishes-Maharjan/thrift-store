import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'

export default async function Header() {
  const session = await auth()

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-[#d2d2d7] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-[#1d1d1f]">
            THRIFT.
          </Link>
          
          {/* Search Bar Placeholder */}
          <div className="hidden sm:block">
            <form action="/products" method="GET" className="relative">
              <input 
                type="text" 
                name="search"
                placeholder="Search products..." 
                className="bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] text-sm rounded-full px-4 py-2 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all placeholder-[#86868b]"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-[#86868b] hover:text-[#1d1d1f]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm font-medium text-[#1d1d1f]">
          <Link href="/products" className="hover:text-[#0071e3] transition-colors">
            Shop
          </Link>
          <Link href="/cart" className="hover:text-[#0071e3] transition-colors">
            Cart
          </Link>
          
          {session?.user ? (
            <div className="flex items-center space-x-4">
              <Link href="/account" className="hover:text-[#0071e3] transition-colors">
                {session.user.name || 'Account'}
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin/products" className="hover:text-[#0071e3] transition-colors text-xs border border-[#d2d2d7] px-2 py-1 rounded hover:border-[#0071e3]">
                  Admin
                </Link>
              )}
              <form action={async () => {
                'use server'
                await signOut()
              }}>
                <button type="submit" className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="hover:text-[#0071e3] transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="bg-[#0071e3] text-white px-4 py-2 rounded-full hover:bg-[#0077ed] transition-colors">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
