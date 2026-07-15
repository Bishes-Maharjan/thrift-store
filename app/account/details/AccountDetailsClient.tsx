'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountDetailsClient({ user }: { user: any }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update details')
      }

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-black uppercase text-[#1d1d1f] mb-8 border-b border-[#d2d2d7] pb-4">Personal Details</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-red-600 text-xs font-bold tracking-widest uppercase text-center border border-red-600 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-xs font-bold tracking-widest uppercase text-center border border-green-600 p-3 rounded">
            Details updated successfully
          </div>
        )}

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Email Address</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="block w-full border border-[#d2d2d7] bg-gray-100 sm:text-sm px-4 py-3 text-gray-500 rounded-sm cursor-not-allowed"
          />
          <p className="mt-1 text-[10px] uppercase text-[#86868b] tracking-widest">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            minLength={3}
            maxLength={50}
            className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm"
          />
        </div>
        <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Role</label>
        <input
          type="tel"
          value={user.role}
          disabled
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm"
        />
        <div>

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-colors rounded-full"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
