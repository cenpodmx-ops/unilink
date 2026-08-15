import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/business?slug=studio-fernanda
 * Devuelve los datos del negocio para el dashboard (incluye citas y métricas).
 * Verifica ownership.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
    }

    const business = await db.business.findFirst({
      where: { slug, ownerId: user.id },
      include: {
        settings: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        socialLinks: true,
        serviceCategories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            services: { orderBy: { sortOrder: 'asc' } },
          },
        },
        galleryItems: { orderBy: { sortOrder: 'asc' } },
        promotions: { orderBy: { startDate: 'asc' } },
        faqs: { orderBy: { sortOrder: 'asc' } },
        appointments: {
          orderBy: { date: 'asc' },
          take: 50,
        },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'no encontrado' }, { status: 404 })
    }

    // Métricas: últimos 7 días
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const events = await db.analyticsEvent.findMany({
      where: { businessId: business.id, createdAt: { gte: sevenDaysAgo } },
      select: { eventType: true, createdAt: true },
    })

    const metrics = {
      total: events.length,
      page_view: events.filter((e) => e.eventType === 'page_view').length,
      whatsapp_click: events.filter((e) => e.eventType === 'whatsapp_click').length,
      call_click: events.filter((e) => e.eventType === 'call_click').length,
      maps_click: events.filter((e) => e.eventType === 'maps_click').length,
      instagram_click: events.filter((e) => e.eventType === 'instagram_click').length,
      service_click: events.filter((e) => e.eventType === 'service_click').length,
      booking_started: events.filter((e) => e.eventType === 'booking_started').length,
      booking_completed: events.filter((e) => e.eventType === 'booking_completed').length,
      share_click: events.filter((e) => e.eventType === 'share_click').length,
      save_contact_click: events.filter((e) => e.eventType === 'save_contact_click').length,
    }

    // Citas de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaysAppointments = await db.appointment.findMany({
      where: {
        businessId: business.id,
        date: { gte: today, lt: tomorrow },
      },
      include: { service: true },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json({
      business,
      metrics,
      todaysAppointments,
      appointments: business.appointments.filter((a) => a.date >= today),
    })
  } catch (error) {
    console.error('[api/dashboard/business] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
