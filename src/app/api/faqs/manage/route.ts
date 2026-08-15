import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  businessId: z.string(),
  question: z.string().min(1).max(200),
  answer: z.string().min(1).max(1000),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
})

/**
 * POST /api/faqs/manage
 * Crea un FAQ nuevo. Verifica ownership del negocio.
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

    const faq = await db.faq.create({
      data: {
        businessId: data.businessId,
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder ?? 0,
        isVisible: data.isVisible ?? true,
      },
    })

    return NextResponse.json({ ok: true, faq })
  } catch (error) {
    console.error('[api/faqs/manage] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
