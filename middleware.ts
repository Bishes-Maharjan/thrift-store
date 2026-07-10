import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = req.nextUrl.pathname.startsWith('/auth')
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isAccountRoute = req.nextUrl.pathname.startsWith('/account')

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/', req.nextUrl))
    }
    return null
  }

  if (isAdminRoute) {
    if (!isLoggedIn || req.auth?.user?.role !== 'ADMIN') {
      return Response.redirect(new URL('/auth/login', req.nextUrl))
    }
    return null
  }

  if (isAccountRoute) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', req.nextUrl))
    }
    return null
  }

  return null
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
