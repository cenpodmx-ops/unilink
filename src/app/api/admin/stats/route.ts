import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/is-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 * Métricas globales de la plataforma: total de usuarios, negocios, visitas,
 * citas, y negocios creados en los últimos 7/30 días.
 *
 * Solo accesible por admins (lista de emails via ADMIN_EMAILS / ADMIN_EMAIL).
 */
export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const [
      totalUsers,
      totalBusinesses,
      activeBusinesses,
      draftBusinesses,
      suspendedBusinesses,
      deletedBusinesses,
      totalPageViews,
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      businesses7d,
      businesses30d,
      users7d,
      users30d,
      bookings7d,
    ] = await Promise.all([
      db.user.count(),
      db.business.count(),
      db.business.count({ where: { status: 'active' } }),
      db.business.count({ where: { status: 'draft' } }),
      db.business.count({ where: { status: 'suspended' } }),
      db.business.count({ where: { status: 'deleted' } }),
      db.analyticsEvent.count({ where: { eventType: 'page_view' } }),
      db.appointment.count(),
      db.appointment.count({ where: { status: 'confirmed' } }),
      db.appointment.count({ where: { status: 'pending' } }),
      db.business.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.business.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      db.appointment.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    ])

    // Eventos totales por tipo (útil para ver engagement)
    const eventTypeAgg = await db.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: { _all: true },
    })
    const eventsByType: Record<string, number> = {}
    for (const row of eventTypeAgg) {
      eventsByType[row.eventType] = row._count._all
    }

    return NextResponse.json({
      totals: {
        users: totalUsers,
        businesses: totalBusinesses,
        activeBusinesses,
        draftBusinesses,
        suspendedBusinesses,
        deletedBusinesses,
        pageViews: totalPageViews,
        appointments: totalAppointments,
        confirmedAppointments,
        pendingAppointments,
      },
      growth: {
        businesses7d,
        businesses30d,
        users7d,
        users30d,
        bookings7d,
      },
      eventsByType,
    })
  } catch (error) {
    console.error('[api/admin/stats] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
