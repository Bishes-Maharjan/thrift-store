'use client'

import { useState, useRef, useEffect } from 'react'

export type Option = {
  value: string
  label: string
}

type SearchableSelectProps = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  required = false,
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        
        // Validation check: if they typed something but didn't select, and required is true but value is empty
        // this is handled by form submission usually, but we could add local blur validation
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden input for native form validation if required */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}} // Read-only via React state
        className="absolute opacity-0 w-0 h-0 p-0 m-0 border-0"
        tabIndex={-1}
      />
      
      <div
        className={`flex items-center justify-between w-full border ${error ? 'border-red-500' : 'border-[#d2d2d7]'} focus-within:border-[#0071e3] focus-within:ring-1 focus-within:ring-[#0071e3] bg-white px-4 py-3 cursor-pointer rounded-sm`}
        onClick={() => setIsOpen(true)}
      >
        <span className={`text-sm ${selectedOption ? 'text-[#1d1d1f]' : 'text-[#86868b]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[#86868b] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#d2d2d7] rounded-sm shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white p-2 border-b border-[#d2d2d7]">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 text-sm border border-[#d2d2d7] rounded-sm focus:outline-none focus:border-[#0071e3]"
            />
          </div>
          
          <ul className="py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#86868b] text-center">No options found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-[#f5f5f7] ${value === opt.value ? 'bg-[#f5f5f7] font-bold text-[#1d1d1f]' : 'text-[#1d1d1f]'}`}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
