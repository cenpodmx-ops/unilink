import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().optional(),
})

const UpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(80).optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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
 * POST /api/services/categories
 * Crea una categoría de servicios.
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

    const category = await db.serviceCategory.create({
      data: {
        businessId: data.businessId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        isVisible: true,
      },
    })

    return NextResponse.json({ ok: true, category })
  } catch (error) {
    console.error('[api/services/categories] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * PUT /api/services/categories
 * Actualiza una categoría de servicios.
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

    const existing = await db.serviceCategory.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const updated = await db.serviceCategory.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ ok: true, category: updated })
  } catch (error) {
    console.error('[api/services/categories] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/services/categories
 * Elimina una categoría. El schema tiene onDelete: Cascade desde Business,
 * pero desde ServiceCategory hacia Service es onDelete: SetNull.
 * Por consistencia con el spec ("cascade de services") eliminamos sus servicios primero.
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

    const existing = await db.serviceCategory.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Eliminar primero los servicios de esta categoría (cascade a nivel app)
    await db.service.deleteMany({ where: { categoryId: id } })
    await db.serviceCategory.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/services/categories] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
