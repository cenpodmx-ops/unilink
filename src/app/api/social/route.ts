import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const LinkSchema = z.object({
  platform: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, 'platform inválido'),
  url: z.string().min(1).max(500),
})

const UpdateSchema = z.object({
  businessId: z.string(),
  links: z.array(LinkSchema).max(20),
})

/**
 * PUT /api/social
 * Reemplazo en bloque de los social links del negocio.
 * Estrategia transaccional: borrar todos los existentes + crear los nuevos.
 * Esto permite al dashboard enviar el estado completo y evitar lógica de diff.
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
    const { businessId, links } = parsed.data

    const business = await db.business.findFirst({
      where: { id: businessId, ownerId: user.id },
      select: { id: true },
    })
    if (!business) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Validar que no haya plataformas duplicadas
    const platforms = links.map((l) => l.platform)
    if (new Set(platforms).size !== platforms.length) {
      return NextResponse.json(
        { error: 'Duplicated platform entries' },
        { status: 400 },
      )
    }

    // Reemplazo atómico: borrar existentes y crear nuevos
    await db.$transaction([
      db.socialLink.deleteMany({ where: { businessId } }),
      ...links.map((l) =>
        db.socialLink.create({
          data: {
            businessId,
            platform: l.platform,
            url: l.url,
          },
        }),
      ),
    ])

    const updated = await db.socialLink.findMany({
      where: { businessId },
      orderBy: { platform: 'asc' },
    })

    return NextResponse.json({ ok: true, links: updated })
  } catch (error) {
    console.error('[api/social] PUT error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
