import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * GET /api/businesses
 * Lista los negocios del usuario autenticado.
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const businesses = await db.business.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        headline: true,
        logoUrl: true,
        primaryColor: true,
        status: true,
        isBookingEnabled: true,
        category: true,
        businessType: true,
        createdAt: true,
        _count: {
          select: {
            appointments: { where: { status: { in: ['pending', 'confirmed'] } } },
            analyticsEvents: { where: { eventType: 'page_view' } },
          },
        },
      },
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('[api/businesses] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
