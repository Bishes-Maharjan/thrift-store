import UserForm from '../UserForm'
import Link from 'next/link'

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase text-[#1d1d1f]">Add User</h1>
        <Link href="/admin/users" className="text-xs font-bold uppercase tracking-widest text-[#0071e3] hover:underline">
          &larr; Back to Users
        </Link>
      </div>
      <UserForm />
    </div>
  )
}
