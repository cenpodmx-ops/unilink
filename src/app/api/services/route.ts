import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  categoryId: z.string().nullish(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullish(),
  imageUrl: z.string().nullish(),
  price: z.number().nonnegative().nullish(),
  priceType: z.enum(['fixed', 'from', 'quote']).default('fixed'),
  durationMinutes: z.number().int().positive().nullish(),
  isBookable: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  type: z.enum(['service', 'product']).default('service'),
  sortOrder: z.number().int().optional(),
})

const UpdateSchema = z.object({
  id: z.string(),
  categoryId: z.string().nullish().optional(),
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullish().optional(),
  imageUrl: z.string().nullish().optional(),
  price: z.number().nonnegative().nullish().optional(),
  priceType: z.enum(['fixed', 'from', 'quote']).optional(),
  durationMinutes: z.number().int().positive().nullish().optional(),
  isBookable: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  type: z.enum(['service', 'product']).optional(),
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
 * POST /api/services
 * Crea un servicio nuevo.
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

    // Si enviaron categoryId, validar que pertenezca al mismo negocio
    if (data.categoryId) {
      const cat = await db.serviceCategory.findFirst({
        where: { id: data.categoryId, businessId: data.businessId },
        select: { id: true },
      })
      if (!cat) {
        return NextResponse.json(
          { error: 'category not found' },
          { status: 404 },
        )
      }
    }

    const service = await db.service.create({
      data: {
        businessId: data.businessId,
        categoryId: data.categoryId ?? null,
        name: data.name,
        description: data.description ?? null,
        imageUrl: data.imageUrl ?? null,
        price: data.price ?? null,
        priceType: data.priceType,
        durationMinutes: data.durationMinutes ?? null,
        isBookable: data.isBookable ?? false,
        isVisible: data.isVisible ?? true,
        type: data.type,
        sortOrder: data.sortOrder ?? 0,
      },
    })

    return NextResponse.json({ ok: true, service })
  } catch (error) {
    console.error('[api/services] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * PUT /api/services
 * Actualiza un servicio existente.
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

    // Verificar ownership: buscar el servicio y comprobar que su business pertenece al user
    const existing = await db.service.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
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
    console.error('[api/services] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/services
 * Elimina un servicio.
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

    const existing = await db.service.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.service.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/services] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
