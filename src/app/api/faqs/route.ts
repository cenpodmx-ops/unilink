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
})

const UpdateSchema = z.object({
  id: z.string(),
  question: z.string().min(1).max(200).optional(),
  answer: z.string().min(1).max(1000).optional(),
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
 * POST /api/faqs
 * Crea un FAQ.
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

    const faq = await db.faq.create({
      data: {
        businessId: data.businessId,
        question: data.question,
        answer: data.answer,
        sortOrder: data.sortOrder ?? 0,
        isVisible: true,
      },
    })

    return NextResponse.json({ ok: true, faq })
  } catch (error) {
    console.error('[api/faqs] POST error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * PUT /api/faqs
 * Actualiza un FAQ.
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

    const existing = await db.faq.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const updated = await db.faq.update({
      where: { id },
      data: patch,
    })

    return NextResponse.json({ ok: true, faq: updated })
  } catch (error) {
    console.error('[api/faqs] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

/**
 * DELETE /api/faqs
 * Elimina un FAQ.
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

    const existing = await db.faq.findUnique({
      where: { id },
      select: { id: true, businessId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }
    if (!(await ensureOwned(existing.businessId, user.id))) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await db.faq.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[api/faqs] DELETE error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
