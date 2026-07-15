'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCloudinarySignature } from '@/app/actions/cloudinary'
import SearchableSelect from '@/components/ui/SearchableSelect'
import DeleteModal from '@/components/ui/DeleteModal'
import type { ProductImage, ProductWithImagesOrdered } from '@/types/db-schema'

type Category = {
  id: string
  name: string
}

type ImageInfo = {
  url: string
  publicId: string
}

type ProductData = {
  id?: string
  name: string
  slug: string
  description: string
  categoryId: string
  price: string
  isActive: boolean
  images: ImageInfo[]
}

export default function ProductForm({
  initialData,
  categories,
  canDelete = true,
}: {
  initialData?: ProductWithImagesOrdered
  categories: Category[]
  canDelete?: boolean
}) {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    price: initialData?.price?.toString() || '',
    isActive: initialData?.isActive !== false,
    images: initialData?.images?.map((img: ProductImage) => ({
      url: img.url,
      publicId: img.publicId,
    })) || [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDelete = async () => {
    if (!initialData) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/products/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete product')
      }
      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: initialData ? prev.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    }))
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)
    setError(null)

    try {
      const { timestamp, signature, cloudName, apiKey } = await getCloudinarySignature()
      
      const file = e.target.files[0]
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('api_key', apiKey)
      uploadData.append('timestamp', timestamp.toString())
      uploadData.append('signature', signature)
      uploadData.append('folder', 'ecommerce')

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: uploadData,
      })

      if (!res.ok) {
        throw new Error('Image upload failed')
      }

      const data = await res.json()
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: data.secure_url, publicId: data.public_id }]
      }))

    } catch (err: any) {
      setError(err.message || 'Image upload failed')
    } finally {
      setIsUploading(false)
      // reset file input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const url = initialData ? `/api/products/${initialData.id}` : '/api/products'
    const method = initialData ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl bg-white p-8 border border-[#d2d2d7] rounded-xl shadow-sm">
      {error && (
        <div className="text-red-600 text-xs font-bold tracking-widest uppercase text-center border border-red-600 p-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase text-[#1d1d1f] border-b border-[#d2d2d7] pb-2">Basic Info</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Product Name</label>
            <input required type="text" value={formData.name} onChange={handleNameChange} className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Slug</label>
            <input required type="text" value={formData.slug} onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))} className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Category</label>
            <SearchableSelect
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              value={formData.categoryId}
              onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
              placeholder="Select Category"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Price</label>
            <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">Description</label>
          <textarea rows={4} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="block w-full border border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3] sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-sm" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="h-4 w-4 border-[#d2d2d7] text-[#0071e3] focus:ring-[#0071e3] rounded-sm" />
          <label htmlFor="isActive" className="ml-2 block text-sm font-bold text-[#1d1d1f]">Active Status</label>
        </div>
      </div>

      {/* Images Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-black uppercase text-[#1d1d1f] border-b border-[#d2d2d7] pb-2">Images</h2>
        <div className="flex flex-wrap gap-4">
          {formData.images.map((img, i) => (
            <div key={i} className="relative w-32 h-32 border border-[#d2d2d7] rounded overflow-hidden">
              <img src={img.url} alt="Product" className="object-cover w-full h-full" />
              <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-[10px] w-6 h-6 flex items-center justify-center">X</button>
            </div>
          ))}
          <div className="w-32 h-32 border-2 border-dashed border-[#d2d2d7] rounded flex items-center justify-center relative hover:bg-gray-50 transition-colors">
            {isUploading ? (
              <span className="text-xs font-bold uppercase text-gray-400">Uploading...</span>
            ) : (
              <span className="text-xs font-bold uppercase text-gray-400 text-center px-2">+ Add Image</span>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>


      <div className="flex gap-4 pt-8 border-t border-[#d2d2d7]">
        <button type="submit" disabled={isLoading} className="flex-1 bg-black text-white px-4 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 transition-colors rounded-full">
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
        <Link href="/admin/products" className="flex-1 text-center bg-gray-100 text-[#1d1d1f] px-4 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded-full border border-[#d2d2d7]">
          Cancel
        </Link>
        {initialData && canDelete && (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 bg-red-600 text-white px-4 py-4 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors rounded-full"
          >
            Delete
          </button>
        )}
        {initialData && !canDelete && (
          <p className="flex-1 text-center text-xs font-bold uppercase tracking-widest text-[#86868b] px-4 py-4">
            Cannot delete — attached to orders
          </p>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${initialData?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </form>
  )
}
