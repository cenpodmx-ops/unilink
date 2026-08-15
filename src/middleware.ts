import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
  })

  // Si no hay token (no autenticado), redirige a /login
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/api/business/manage/:path*',
    '/api/services/:path*',
    '/api/gallery/:path*',
    '/api/promotions/manage/:path*',
    '/api/faqs/manage/:path*',
    '/api/hours/:path*',
    '/api/social/:path*',
    '/api/appointments/manage/:path*',
  ],
}
