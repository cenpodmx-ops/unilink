import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

/**
 * POST /api/auth/register
 * Registra un usuario nuevo.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este correo' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email: normalizedEmail, passwordHash },
    })

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (error) {
    console.error('[api/auth/register] error', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
