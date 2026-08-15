import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/appointment-blocks/[id]
 * Elimina un bloqueo de agenda por id. Verifica ownership del negocio asociado.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.appointmentBlock.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const business = await db.business.findFirst({
      where: { id: existing.businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.appointmentBlock.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/appointment-blocks/[id]] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
