import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/is-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/businesses
 * Lista TODOS los negocios con info del owner, categoría, status, fechas,
 * y conteos de visitas (page_view) y citas.
 *
 * Query params:
 *  - status: filtra por status (draft|active|suspended|deleted). Por defecto
 *    excluye 'deleted' salvo que se pida explícitamente.
 *
 * Solo admins.
 */
export async function GET(req: Request) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const where = status ? { status } : { status: { not: 'deleted' } }

    const businesses = await db.business.findMany({
      where,
      include: {
        owner: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Conteos por negocio en paralelo (page_view + citas activas)
    const withCounts = await Promise.all(
      businesses.map(async (b) => {
        const [pageViews, appointmentsCount, confirmedAppointments] = await Promise.all([
          db.analyticsEvent.count({
            where: { businessId: b.id, eventType: 'page_view' },
          }),
          db.appointment.count({
            where: { businessId: b.id, status: { in: ['pending', 'confirmed'] } },
          }),
          db.appointment.count({
            where: { businessId: b.id, status: 'confirmed' },
          }),
        ])
        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          category: b.category,
          businessType: b.businessType,
          status: b.status,
          primaryColor: b.primaryColor,
          isBookingEnabled: b.isBookingEnabled,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          owner: b.owner,
          metrics: {
            pageViews,
            appointments: appointmentsCount,
            confirmedAppointments,
          },
        }
      }),
    )

    return NextResponse.json({ businesses: withCounts })
  } catch (error) {
    console.error('[api/admin/businesses] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
