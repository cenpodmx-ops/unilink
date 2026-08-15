import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminUser } from '@/lib/auth/is-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/users
 * Lista TODOS los usuarios con conteo de negocios.
 *
 * Solo admins.
 */
export async function GET() {
  try {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const withAdminFlag = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      createdAt: u.createdAt,
      businessesCount: u._count.businesses,
      isAdmin: u.email.toLowerCase() === admin.email.toLowerCase(),
    }))

    return NextResponse.json({ users: withAdminFlag })
  } catch (error) {
    console.error('[api/admin/users] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
