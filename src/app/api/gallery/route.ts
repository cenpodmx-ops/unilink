import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  imageUrl: z.string().min(1),
  caption: z.string().max(200).nullish(),
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
 * POST /api/gallery
 * Crea un item de galería.
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

    const item = await db.galleryItem.create({
      data: {
        businessId: data.businessId,
        imageUrl: data.imageUrl,
        caption: data.caption ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    })

    return NextResponse.json({ ok: true, item })
  } catch (error) {
    console.error('[api/gallery] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/gallery
 * Elimina un item de galería.
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

    const existing = await db.galleryItem.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.galleryItem.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/gallery] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
