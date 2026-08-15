import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  notes: z.string().max(1000).nullish().optional(),
})

/**
 * PUT /api/appointments/manage/[id]
 * Actualiza el status (y opcionalmente notas) de una cita existente.
 * Verifica ownership del negocio asociado a la cita.
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

    const body = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { status, notes } = parsed.data

    const appointment = await db.appointment.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const business = await db.business.findFirst({
      where: { id: appointment.businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const updateData: { status: string; notes?: string | null } = { status }
    if (notes !== undefined) updateData.notes = notes

    const updated = await db.appointment.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ ok: true, appointment: updated })
  } catch (error) {
    console.error('[api/appointments/manage/[id]] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
