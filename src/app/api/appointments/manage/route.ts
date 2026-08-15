import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  serviceId: z.string().nullish(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(5).max(30),
  customerEmail: z.string().email().nullish().or(z.literal('')),
  date: z.coerce.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z
    .enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .optional(),
  notes: z.string().max(1000).nullish(),
})

/**
 * POST /api/appointments/manage
 * Crea manualmente una cita (para el dueño del negocio).
 * A diferencia de /api/bookings (público), NO verifica disponibilidad ni slots,
 * permite al dueño registrar cualquier cita (incluyendo clientes walk-in o por teléfono).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = CreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    const business = await db.business.findFirst({
      where: { id: data.businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Validar serviceId si viene: debe pertenecer al mismo negocio
    if (data.serviceId) {
      const service = await db.service.findFirst({
        where: { id: data.serviceId, businessId: data.businessId },
        select: { id: true },
      })
      if (!service) {
        return NextResponse.json(
          { error: 'service not found' },
          { status: 404 },
        )
      }
    }

    // Calcular endTime si no viene (default 30 min)
    let endTime = data.endTime
    if (!endTime) {
      const [h, m] = data.startTime.split(':').map(Number)
      const endMin = h * 60 + m + 30
      endTime = `${Math.floor(endMin / 60)
        .toString()
        .padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`
    }

    if (endTime <= data.startTime) {
      return NextResponse.json(
        { error: 'endTime debe ser posterior a startTime' },
        { status: 400 },
      )
    }

    const appointment = await db.appointment.create({
      data: {
        businessId: data.businessId,
        serviceId: data.serviceId ?? null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        date: data.date,
        startTime: data.startTime,
        endTime,
        status: data.status ?? 'confirmed',
        notes: data.notes ?? null,
      },
    })

    return NextResponse.json({ ok: true, appointment })
  } catch (error) {
    console.error('[api/appointments/manage] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
