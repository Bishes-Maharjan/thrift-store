'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserData = {
  id?: string
  email: string
  name: string
  phone: string
  role: 'CUSTOMER' | 'ADMIN'
  password?: string
}

export default function UserForm({ initialData }: { initialData?: UserData }) {
  const router = useRouter()
  const [formData, setFormData] = useState<UserData>({
    email: initialData?.email || '',
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'CUSTOMER',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const url = initialData ? `/api/users/${initialData.id}` : '/api/users'
    const method = initialData ? 'PATCH' : 'POST'
    
    // Only send password if it's new user or explicitly changed
    const payload = { ...formData }
    if (initialData && !payload.password) {
      delete payload.password
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save user')
      }

      router.push('/admin/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
      {error && (
        <div className="text-red-600 text-xs font-bold tracking-widest uppercase text-center border border-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Email</label>
        <input 
          type="email" 
          required 
          disabled={!!initialData}
          value={formData.email} 
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} 
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm disabled:bg-gray-100 disabled:text-gray-500" 
        />
        {initialData && <p className="mt-1 text-[10px] uppercase tracking-widest text-[#86868b]">Email cannot be changed</p>}
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Full Name</label>
        <input 
          type="text" 
          required 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} 
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Phone Number</label>
        <input 
          type="tel" 
          value={formData.phone} 
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Role</label>
        <select 
          value={formData.role} 
          onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as any }))} 
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">
          {initialData ? 'New Password (leave blank to keep current)' : 'Password'}
        </label>
        <input 
          type="password" 
          required={!initialData} 
          value={formData.password} 
          onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} 
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" 
        />
      </div>

      <div className="flex gap-4 pt-6 border-t border-[#d2d2d7]">
        <button type="submit" disabled={isLoading} className="flex-1 bg-black text-white px-4 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-colors rounded-full">
          {isLoading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
        </button>
        <Link href="/admin/users" className="flex-1 text-center bg-[#f5f5f7] text-[#1d1d1f] px-4 py-4 text-xs font-bold tracking-widest uppercase hover:bg-[#e8e8ed] transition-colors rounded-full border border-[#d2d2d7]">
          Cancel
        </Link>
      </div>
    </form>
  )
}
