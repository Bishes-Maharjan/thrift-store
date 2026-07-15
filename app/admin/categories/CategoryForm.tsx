'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DeleteModal from '@/components/ui/DeleteModal'

type Category = {
  id: string
  name: string
  slug: string
}

export default function CategoryForm({ 
  initialData, 
}: { 
  initialData?: Category, 
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!initialData) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/categories/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete category')
      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const url = initialData ? `/api/categories/${initialData.id}` : '/api/categories'
    const method = initialData ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl bg-white p-8 border border-gray-200">
      {error && (
        <div className="text-red-600 text-xs font-bold tracking-widest uppercase text-center border border-red-600 p-3">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
            Category Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={handleNameChange}
            className="block w-full border border-gray-300 focus:border-black focus:ring-black sm:text-sm px-4 py-3 bg-gray-50 text-black"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-xs font-bold tracking-widest text-black uppercase mb-2">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            required
            value={formData.slug}
            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="block w-full border border-gray-300 focus:border-black focus:ring-black sm:text-sm px-4 py-3 bg-gray-50 text-black"
          />
        </div>


      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-black text-white px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
        <Link
          href="/admin/categories"
          className="flex-1 text-center bg-gray-100 text-black px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors"
        >
          Cancel
        </Link>
        {initialData && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 bg-red-600 text-white px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${initialData?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </form>
  )
}
