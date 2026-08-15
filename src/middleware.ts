export { default } from 'next-auth/middleware'

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
