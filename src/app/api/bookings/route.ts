import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const BookingSchema = z.object({
  businessId: z.string(),
  serviceId: z.string(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().min(5).max(30),
  customerEmail: z.string().email().nullish().or(z.literal('')),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:mm
  sessionId: z.string().optional(),
})

/**
 * POST /api/bookings
 * Crea una cita nueva. Verifica disponibilidad (sin solapamientos con otras citas o bloques).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    // Verificar negocio y servicio
    const business = await db.business.findUnique({
      where: { id: data.businessId },
      select: {
        id: true,
        isBookingEnabled: true,
        bookingMinLead: true,
        bookingMaxDays: true,
      },
    })
    if (!business || !business.isBookingEnabled) {
      return NextResponse.json({ error: 'booking disabled' }, { status: 400 })
    }

    const service = await db.service.findUnique({
      where: { id: data.serviceId },
      select: { id: true, durationMinutes: true, businessId: true, isBookable: true },
    })
    if (!service || service.businessId !== business.id || !service.isBookable) {
      return NextResponse.json({ error: 'service not bookable' }, { status: 400 })
    }

    // Construir fecha y hora (medianoche LOCAL para evitar bug de zona horaria)
    const [yr, mo, dy] = data.date.split('-').map(Number)
    const date = new Date(yr, mo - 1, dy, 0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      return NextResponse.json({ error: 'past date' }, { status: 400 })
    }
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > business.bookingMaxDays) {
      return NextResponse.json(
        { error: `Solo se permiten reservas hasta ${business.bookingMaxDays} días en el futuro` },
        { status: 400 },
      )
    }

    // Calcular end time
    const duration = service.durationMinutes ?? 30
    const [h, m] = data.startTime.split(':').map(Number)
    const startMin = h * 60 + m
    const endMin = startMin + duration
    const endTime = `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`

    // Verificar solapamiento con citas existentes (que no estén canceladas)
    const conflicting = await db.appointment.findFirst({
      where: {
        businessId: business.id,
        date,
        status: { in: ['pending', 'confirmed'] },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
    })
    if (conflicting) {
      return NextResponse.json(
        { error: 'Ese horario ya está reservado. Elige otro.' },
        { status: 409 },
      )
    }

    // Verificar bloques de horario
    const blocks = await db.appointmentBlock.findMany({
      where: { businessId: business.id, date },
    })
    for (const block of blocks) {
      if (block.allDay) {
        return NextResponse.json(
          { error: 'Ese día está bloqueado por el negocio.' },
          { status: 409 },
        )
      }
      if (data.startTime < block.endTime && endTime > block.startTime) {
        return NextResponse.json(
          { error: 'Ese horario está bloqueado.' },
          { status: 409 },
        )
      }
    }

    // Crear la cita
    const appointment = await db.appointment.create({
      data: {
        businessId: business.id,
        serviceId: service.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail || null,
        date,
        startTime: data.startTime,
        endTime,
        status: 'pending',
      },
    })

    // Evento analítico: booking_completed
    await db.analyticsEvent.create({
      data: {
        businessId: business.id,
        eventType: 'booking_completed',
        serviceId: service.id,
        sessionId: data.sessionId ?? 'unknown',
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, appointmentId: appointment.id })
  } catch (error) {
    console.error('[api/bookings] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
