import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * GET /api/business/[id]
 * Devuelve un negocio con todos sus datos (para edición en el dashboard).
 * Verifica ownership.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const business = await db.business.findFirst({
      where: { id, ownerId: user.id },
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
        promotions: { orderBy: { startDate: 'desc' } },
        faqs: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    return NextResponse.json(business)
  } catch (error) {
    console.error('[api/business/[id]] GET error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

const UpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  businessType: z.string().nullish(),
  headline: z.string().max(80).nullish(),
  description: z.string().max(500).nullish(),
  logoUrl: z.string().nullish(),
  coverUrl: z.string().nullish(),
  phone: z.string().nullish(),
  whatsapp: z.string().nullish(),
  email: z.string().email().nullish().or(z.literal('')),
  address: z.string().nullish(),
  mapsUrl: z.string().nullish(),
  googleReviewUrl: z.string().nullish(),
  primaryColor: z.string().optional(),
  theme: z.string().optional(),
  typography: z.string().optional(),
  primaryButton: z.string().optional(),
  isBookingEnabled: z.boolean().optional(),
  bookingSlotInterval: z.number().optional(),
  bookingMinLead: z.number().optional(),
  bookingMaxDays: z.number().optional(),
  aboutText: z.string().nullish(),
  tags: z.array(z.string()).optional(),
  noticeText: z.string().nullish(),
  noticeActive: z.boolean().optional(),
  sectionOrder: z.array(z.string()).optional(),
  visibleButtons: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'suspended']).optional(),
})

/**
 * PUT /api/business/[id]
 * Actualiza los datos del negocio. Verifica ownership.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const business = await db.business.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data
    // Serializar arrays a JSON string (SQLite no soporta listas nativas)
    const updateData: Record<string, unknown> = { ...data }
    if (data.tags) updateData.tags = JSON.stringify(data.tags)
    if (data.sectionOrder) updateData.sectionOrder = JSON.stringify(data.sectionOrder)
    if (data.visibleButtons) updateData.visibleButtons = JSON.stringify(data.visibleButtons)
    // email vacío → null
    if (data.email === '') updateData.email = null

    const updated = await db.business.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ ok: true, business: updated })
  } catch (error) {
    console.error('[api/business/[id]] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
