'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { id: 'dashboard', href: '/admin', label: 'Dashboard', exact: true },
  { id: 'products', href: '/admin/products', label: 'Products' },
  { id: 'categories', href: '/admin/categories', label: 'Categories' },
  { id: 'orders', href: '/admin/orders', label: 'Orders' },
  { id: 'users', href: '/admin/users', label: 'Users' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 py-4 space-y-2 px-4">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`block px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors rounded-lg border ${
              isActive
                ? 'border-[#0071e3] text-[#0071e3] bg-white'
                : 'border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
