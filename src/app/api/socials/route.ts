import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  platform: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, 'platform inválido'),
  url: z.string().min(1).max(500),
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
 * POST /api/socials
 * Crea o actualiza (upsert) un social link por businessId + platform.
 * Si ya existe un registro para esa combinación, se actualiza la URL.
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
    const { businessId, platform, url } = parsed.data

    if (!(await ensureOwned(businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const social = await db.socialLink.upsert({
      where: {
        businessId_platform: { businessId, platform },
      },
      update: { url },
      create: {
        businessId,
        platform,
        url,
      },
    })

    return NextResponse.json({ ok: true, social })
  } catch (error) {
    console.error('[api/socials] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/socials
 * Elimina un social link por id.
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

    const existing = await db.socialLink.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.socialLink.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/socials] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
