'use client'

import { useEffect } from 'react'

type DeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isDeleting?: boolean
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false
}: DeleteModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl border border-[#d2d2d7] transform transition-all">
        <h3 className="text-xl font-black text-[#1d1d1f] mb-4 uppercase">{title}</h3>
        <p className="text-[#86868b] text-sm mb-8 leading-relaxed">
          {message}
        </p>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-[#f5f5f7] text-[#1d1d1f] text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#e8e8ed] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
