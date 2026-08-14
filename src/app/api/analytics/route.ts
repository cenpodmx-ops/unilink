import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const EventSchema = z.object({
  businessId: z.string(),
  eventType: z.string(),
  sessionId: z.string(),
  serviceId: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
})

/**
 * POST /api/analytics
 * Registra un evento analítico (whatsapp_click, maps_click, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = EventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 })
    }
    const { businessId, eventType, sessionId, serviceId, metadata } = parsed.data

    // Verificar que el negocio existe
    const exists = await db.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    })
    if (!exists) {
      return NextResponse.json({ error: 'business not found' }, { status: 404 })
    }

    await db.analyticsEvent.create({
      data: {
        businessId,
        eventType,
        sessionId,
        serviceId: serviceId ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/analytics] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
