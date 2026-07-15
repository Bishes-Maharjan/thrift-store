import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import UserForm from '../UserForm'
import Link from 'next/link'
import type { User, UserFormInitialData } from '@/types/db-schema'

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user: User | null = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) return notFound()

  const initialData: UserFormInitialData = {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    phone: user.phone ?? '',
    role: user.role,
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-[#1d1d1f]">Edit User</h1>
        <Link
          href="/admin/users"
          className="text-xs font-bold uppercase tracking-widest text-[#0071e3] hover:underline"
        >
          &larr; Back to Users
        </Link>
      </div>
      <UserForm initialData={initialData} />
    </div>
  )
}
