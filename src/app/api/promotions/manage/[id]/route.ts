import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullish().optional(),
  imageUrl: z.string().nullish().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
})

/**
 * PUT /api/promotions/manage/[id]
 * Actualiza una promoción existente. Verifica ownership.
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
    const patch = parsed.data

    const existing = await db.promotion.findUnique({
      where: { id },
      select: { id: true, businessId: true, startDate: true, endDate: true },
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

    // Validar consistencia de fechas (considerando las existentes si no se actualizan)
    const startDate = patch.startDate ?? existing.startDate
    const endDate = patch.endDate ?? existing.endDate
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'endDate debe ser posterior o igual a startDate' },
        { status: 400 },
      )
    }

    const updated = await db.promotion.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ ok: true, promotion: updated })
  } catch (error) {
    console.error('[api/promotions/manage/[id]] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/promotions/manage/[id]
 * Elimina una promoción. Verifica ownership.
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

    const existing = await db.promotion.findUnique({
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

    await db.promotion.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/promotions/manage/[id]] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
