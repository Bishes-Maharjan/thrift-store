import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import AccountDetailsClient from './AccountDetailsClient'

export default async function AccountDetailsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/account/details')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect('/auth/login')
  }

  return <AccountDetailsClient user={user} />
}
