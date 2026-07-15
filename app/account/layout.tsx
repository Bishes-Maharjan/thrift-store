import AccountNav from '@/components/AccountNav'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'


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
            <AccountNav isAdmin={session.user.role === 'ADMIN'} />
          </aside>

          <section className="lg:col-span-9 bg-white p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
            {children}
          </section>
        </div>
      </main>
    </div>
  )
}