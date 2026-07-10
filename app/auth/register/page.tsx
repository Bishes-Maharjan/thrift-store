'use client'

import { useActionState, useEffect, useState } from 'react'
import { register } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { registerSchema } from '@/lib/schemas'
import { z } from 'zod'

type FormState = {
  error?: string
  details?: Record<string, string[]>
  success?: boolean
}

const initialState: FormState = {}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState, formData: FormData) => {
      return await register(formData)
    },
    initialState
  )
  const router = useRouter()

  // Client-side validation state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (state?.success) {
      router.push('/auth/login?registered=true')
    }
  }, [state, router])

  const validateField = (name: string, value: string) => {
    try {
      (registerSchema.shape as Record<string, any>)[name]?.parse(value)
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFieldErrors(prev => ({ ...prev, [name]: error.issues[0]?.message || '' }))
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    
    try {
      registerSchema.parse(formData)
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })
      formAction(formDataObj)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message
          }
        })
        setFieldErrors(errors)
      }
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#f5f5f7] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 border border-[#d2d2d7] rounded-2xl shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-black tracking-tighter text-[#1d1d1f] uppercase">
            Create Account
          </h2>
          <p className="mt-2 text-center text-xs font-bold tracking-widest text-[#86868b] uppercase">
            Join Thrift today.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {state?.error && !state?.details && (
            <div className="text-red-600 text-xs font-bold tracking-widest uppercase text-center border border-red-600 p-3 rounded-lg">
              {state.error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-lg transition-colors ${
                  touched.name && fieldErrors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3]'
                }`}
              />
              {touched.name && fieldErrors.name && (
                <p className="text-red-600 text-xs font-bold tracking-widest uppercase mt-2">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-lg transition-colors ${
                  touched.email && fieldErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3]'
                }`}
              />
              {touched.email && fieldErrors.email && (
                <p className="text-red-600 text-xs font-bold tracking-widest uppercase mt-2">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-lg transition-colors ${
                  touched.password && fieldErrors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3]'
                }`}
              />
              {touched.password && fieldErrors.password && (
                <p className="text-red-600 text-xs font-bold tracking-widest uppercase mt-2">{fieldErrors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold tracking-widest text-[#1d1d1f] uppercase mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`block w-full sm:text-sm px-4 py-3 bg-white text-[#1d1d1f] rounded-lg transition-colors ${
                  touched.confirmPassword && fieldErrors.confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-[#d2d2d7] focus:border-[#0071e3] focus:ring-[#0071e3]'
                }`}
              />
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <p className="text-red-600 text-xs font-bold tracking-widest uppercase mt-2">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full justify-center border-2 border-[#0071e3] bg-[#0071e3] py-4 px-4 text-xs font-bold tracking-widest text-white uppercase hover:bg-[#0077ed] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 transition-colors rounded-full"
            >
              {isPending ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="text-center text-xs font-bold tracking-widest uppercase mt-8 border-t border-[#d2d2d7] pt-6">
          <Link href="/auth/login" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
