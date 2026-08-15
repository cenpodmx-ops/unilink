import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullish(),
  imageUrl: z.string().nullish(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
})

const UpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullish().optional(),
  imageUrl: z.string().nullish().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
})

const DeleteSchema = z.object({ id: z.string() })

async function ensureOwned(businessId: string, userId: string) {
  const business = await db.business.findFirst({
    where: { id: businessId, ownerId: userId },
    select: { id: true },
  })
  return !!business
}

/**
 * POST /api/promotions
 * Crea una promoción.
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

    if (data.endDate < data.startDate) {
      return NextResponse.json(
        { error: 'endDate debe ser posterior a startDate' },
        { status: 400 },
      )
    }

    const promotion = await db.promotion.create({
      data: {
        businessId: data.businessId,
        title: data.title,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json({ ok: true, promotion })
  } catch (error) {
    console.error('[api/promotions] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * PUT /api/promotions
 * Actualiza una promoción.
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
    const { id, ...patch } = parsed.data

    const existing = await db.promotion.findUnique({
      where: { id },
      select: { id: true, businessId: true, startDate: true, endDate: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Validar consistencia de fechas (considerando las existentes si no se actualizan)
    const startDate = patch.startDate ?? existing.startDate
    const endDate = patch.endDate ?? existing.endDate
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'endDate debe ser posterior a startDate' },
        { status: 400 },
      )
    }

    const updated = await db.promotion.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ ok: true, promotion: updated })
  } catch (error) {
    console.error('[api/promotions] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/promotions
 * Elimina una promoción.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = DeleteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { id } = parsed.data

    const existing = await db.promotion.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.promotion.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/promotions] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
