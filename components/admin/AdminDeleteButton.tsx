'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DeleteModal from '@/components/ui/DeleteModal'

type AdminDeleteButtonProps = {
  apiUrl: string
  title: string
  message: string
}

export default function AdminDeleteButton({ apiUrl, title, message }: AdminDeleteButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(apiUrl, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      setIsOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setIsOpen(true)
        }}
        className="text-red-600 hover:text-red-800 font-bold"
      >
        Delete
      </button>

      {error && (
        <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          {error}
        </p>
      )}

      <DeleteModal
        isOpen={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        onConfirm={handleDelete}
        title={title}
        message={message}
        isDeleting={isDeleting}
      />
    </>
  )
}
