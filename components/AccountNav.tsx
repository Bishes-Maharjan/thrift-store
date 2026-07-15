'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
    { id: 'details', href: '/account/details', label: 'Personal Details' },
    { id: 'orders', href: '/account/orders', label: 'Order History' },
    { id: 'cart', href: '/cart', label: 'Cart' },
]

export default function AccountNav({ isAdmin }: { isAdmin: boolean }) {
    const pathname = usePathname()

    return (
        <nav className="space-y-2">
            {navItems.map((item) => {
                const isActive = pathname.includes(item.id)

                return (
                    <Link
                        key={item.id}
                        id={item.id}
                        href={item.href}
                        className={`block px-4 py-3 bg-white text-xs font-bold tracking-widest uppercase transition-colors rounded-lg border ${isActive
                                ? 'border-[#0071e3] text-[#0071e3]'
                                : 'border-[#d2d2d7] text-[#1d1d1f] hover:border-[#0071e3] hover:text-[#0071e3]'
                            }`}
                    >
                        {item.label}
                    </Link>
                )
            })}

            {isAdmin && (
                <Link
                    href="/admin/products"
                    className="block px-4 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-gray-900 transition-colors rounded-lg mt-4"
                >
                    Admin Dashboard
                </Link>
            )}
        </nav>
    )
}