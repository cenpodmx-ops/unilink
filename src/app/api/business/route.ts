import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isPromotionActive, safeParseArray } from '@/lib/business/helpers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'

export const dynamic = 'force-dynamic'

/**
 * GET /api/business?slug=studio-fernanda
 * Devuelve todos los datos públicos de un negocio por slug.
 * También dispara el evento page_view si ?track=1
 * Si el negocio está en draft, solo el dueño puede verlo.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const sessionId = searchParams.get('sessionId')
    const track = searchParams.get('track') === '1'

    if (!slug) {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
    }

    const business = await db.business.findUnique({
      where: { slug },
      include: {
        settings: true,
        hours: { orderBy: { dayOfWeek: 'asc' } },
        socialLinks: true,
        serviceCategories: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            services: {
              where: { isVisible: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        services: {
          where: { isVisible: true, category: null },
          orderBy: { sortOrder: 'asc' },
        },
        galleryItems: { orderBy: { sortOrder: 'asc' } },
        promotions: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' },
        },
        faqs: {
          where: { isVisible: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!business || business.status === 'deleted') {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    // Si el negocio está en draft o suspended, solo el dueño puede verlo
    if (business.status !== 'active') {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id || session.user.id !== business.ownerId) {
        return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
      }
    }

    // Filtrar promociones activas por fecha
    const now = new Date()
    const activePromotions = business.promotions.filter((p) =>
      isPromotionActive(p, now),
    )

    // Tracking de page_view (solo para negocios activos, no en preview)
    if (track && sessionId && business.status === 'active') {
      try {
        await db.analyticsEvent.create({
          data: {
            businessId: business.id,
            eventType: 'page_view',
            sessionId,
            createdAt: now,
          },
        })
      } catch (e) {
        // No bloquear por tracking
      }
    }

    return NextResponse.json({
      ...business,
      tags: safeParseArray(business.tags),
      sectionOrder: safeParseArray(business.sectionOrder),
      visibleButtons: safeParseArray(business.visibleButtons),
      promotions: activePromotions,
    })
  } catch (error) {
    console.error('[api/business] error', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
