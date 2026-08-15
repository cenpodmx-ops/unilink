import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const HourSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
})

const UpdateSchema = z.object({
  businessId: z.string(),
  hours: z.array(HourSchema).min(0).max(7),
})

/**
 * PUT /api/hours
 * Reemplaza (upsert) todos los horarios del negocio.
 * Borra los horarios existentes y crea los nuevos (estrategia simple y segura).
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { businessId, hours } = parsed.data

    const business = await db.business.findFirst({
      where: { id: businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Validar que no haya dayOfWeek duplicados
    const days = hours.map((h) => h.dayOfWeek)
    if (new Set(days).size !== days.length) {
      return NextResponse.json(
        { error: 'Duplicated dayOfWeek entries' },
        { status: 400 },
      )
    }

    // Estrategia transaccional: borrar existentes + crear nuevos
    await db.$transaction([
      db.businessHour.deleteMany({ where: { businessId } }),
      ...hours.map((h) =>
        db.businessHour.create({
          data: {
            businessId,
            dayOfWeek: h.dayOfWeek,
            isOpen: h.isOpen,
            openTime: h.openTime,
            closeTime: h.closeTime,
          },
        }),
      ),
    ])

    const updated = await db.businessHour.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: 'asc' },
    })

    return NextResponse.json({ ok: true, hours: updated })
  } catch (error) {
    console.error('[api/hours] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
