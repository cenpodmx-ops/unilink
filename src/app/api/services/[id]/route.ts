import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const UpdateSchema = z.object({
  categoryId: z.string().nullish().optional(),
  type: z.enum(['service', 'product']).optional(),
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullish().optional(),
  imageUrl: z.string().nullish().optional(),
  price: z.number().nonnegative().nullish().optional(),
  priceType: z.enum(['fixed', 'from', 'quote']).optional(),
  durationMinutes: z.number().int().positive().nullish().optional(),
  isBookable: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

/**
 * PUT /api/services/[id]
 * Actualiza un servicio existente. Verifica que el servicio pertenezca a un negocio
 * del usuario autenticado.
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

    const existing = await db.service.findUnique({
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

    // Si se cambia categoryId, validar que pertenezca al mismo negocio
    if (patch.categoryId !== undefined && patch.categoryId !== null) {
      const cat = await db.serviceCategory.findFirst({
        where: { id: patch.categoryId, businessId: existing.businessId },
        select: { id: true },
      })
      if (!cat) {
        return NextResponse.json(
          { error: 'category not found' },
          { status: 404 },
        )
      }
    }

    const updated = await db.service.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ ok: true, service: updated })
  } catch (error) {
    console.error('[api/services/[id]] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/services/[id]
 * Elimina un servicio. Verifica ownership del negocio asociado.
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

    const existing = await db.service.findUnique({
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

    await db.service.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/services/[id]] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
