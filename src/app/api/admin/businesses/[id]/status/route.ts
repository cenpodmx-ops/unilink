import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser, logAdminAction } from '@/lib/auth/is-admin'

export const dynamic = 'force-dynamic'

const VALID_STATUSES = ['draft', 'pending_payment', 'active', 'suspended', 'deleted']

/**
 * PATCH /api/admin/businesses/[id]/status
 * Body: { status: 'active' | 'suspended' | 'deleted' | 'draft' | 'pending_payment' }
 *
 * Cambia el status de un negocio. Usado para suspender / activar / borrar (soft-delete).
 *
 * Solo admins.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json().catch(() => null)
    const status = typeof body?.status === 'string' ? body.status.toLowerCase() : null

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'invalid status', valid: VALID_STATUSES },
        { status: 400 },
      )
    }

    const existing = await db.business.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, status: true, ownerId: true },
    })

    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    if (existing.status === status) {
      return NextResponse.json({ ok: true, business: existing, noChange: true })
    }

    const updated = await db.business.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    })

    await logAdminAction('business.status_change', {
      businessId: id,
      from: existing.status,
      to: status,
      name: existing.name,
      slug: existing.slug,
    })

    return NextResponse.json({ ok: true, business: updated })
  } catch (error) {
    console.error('[api/admin/businesses/[id]/status] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
