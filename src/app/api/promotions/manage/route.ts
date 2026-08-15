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

/**
 * POST /api/promotions/manage
 * Crea una promoción nueva. Verifica ownership del negocio.
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

    const business = await db.business.findFirst({
      where: { id: data.businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    if (data.endDate < data.startDate) {
      return NextResponse.json(
        { error: 'endDate debe ser posterior o igual a startDate' },
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
    console.error('[api/promotions/manage] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
