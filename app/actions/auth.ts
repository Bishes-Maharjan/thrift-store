'use server'

import { signIn } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { loginSchema, registerSchema } from '@/lib/schemas'
import bcrypt from 'bcrypt'
import { AuthError } from 'next-auth'

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Invalid fields', details: parsed.error.flatten().fieldErrors }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' }
        default:
          return { error: 'Something went wrong' }
      }
    }
    throw error // Important for Next.js redirects if redirect: true was used
  }
}

export async function register(formData: FormData) {
  const data = Object.fromEntries(formData)
  const parsed = registerSchema.safeParse(data)

  if (!parsed.success) {
    return { error: 'Invalid fields', details: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password } = parsed.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: 'Email already in use' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  })

  // Log them in automatically
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Could not log in after registration' }
    }
    throw error
  }
}
