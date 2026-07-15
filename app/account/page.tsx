'use client'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function AccountIndexRedirect() {
  const router = useRouter()
  router.push('/account/orders')

}
