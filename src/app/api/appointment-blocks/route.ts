import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  // Acepta 'YYYY-MM-DD' y lo guarda como medianoche LOCAL (no UTC)
  // para evitar el bug de "bloquea un día antes" en zonas horarias negativas
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  allDay: z.boolean().optional(),
  reason: z.string().max(200).nullish(),
})

// Convierte 'YYYY-MM-DD' a Date a medianoche local (no UTC)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, 0, 0, 0, 0)
}

async function ensureOwned(businessId: string, userId: string) {
  const business = await db.business.findFirst({
    where: { id: businessId, ownerId: userId },
    select: { id: true },
  })
  return !!business
}

/**
 * GET /api/appointment-blocks?businessId=xxx
 * Lista los bloqueos de agenda de un negocio. Verifica ownership.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const businessId = searchParams.get('businessId')
    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId query param required' },
        { status: 400 },
      )
    }

    if (!(await ensureOwned(businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const blocks = await db.appointmentBlock.findMany({
      where: { businessId },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ ok: true, blocks })
  } catch (error) {
    console.error('[api/appointment-blocks] GET error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * POST /api/appointment-blocks
 * Crea un bloqueo de horario (día completo o rango).
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

    if (!(await ensureOwned(data.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Validar coherencia horaria cuando no es allDay
    if (!data.allDay && data.endTime <= data.startTime) {
      return NextResponse.json(
        { error: 'endTime debe ser posterior a startTime' },
        { status: 400 },
      )
    }

    const block = await db.appointmentBlock.create({
      data: {
        businessId: data.businessId,
        date: parseLocalDate(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        allDay: data.allDay ?? false,
        reason: data.reason ?? null,
      },
    })

    return NextResponse.json({ ok: true, block })
  } catch (error) {
    console.error('[api/appointment-blocks] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/appointment-blocks?id=xxx
 * Elimina un bloqueo por id (pasado como query param para compatibilidad).
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      // Fallback: intentar leer del body (para compatibilidad)
      let bodyId: string | null = null
      try {
        const body = await req.json()
        bodyId = body?.id || null
      } catch {
        // body vacío, ignorar
      }
      if (!bodyId) {
        return NextResponse.json({ error: 'id requerido (query param o body)' }, { status: 400 })
      }
      const existing = await db.appointmentBlock.findUnique({
        where: { id: bodyId },
        select: { id: true, businessId: true },
      })
      if (!existing) {
        return NextResponse.json({ error: 'not found' }, { status: 404 })
      }
      if (!(await ensureOwned(existing.businessId, user.id))) {
        return NextResponse.json({ error: 'not found' }, { status: 404 })
      }
      await db.appointmentBlock.delete({ where: { id: bodyId } })
      return NextResponse.json({ ok: true })
    }

    const existing = await db.appointmentBlock.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.appointmentBlock.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/appointment-blocks] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
