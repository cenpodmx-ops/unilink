import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { db } from '@/lib/db'
import { Dashboard } from '@/components/dashboard/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const { slug: requestedSlug } = await searchParams

  // Buscar el negocio solicitado o el más reciente del usuario
  const business = requestedSlug
    ? await db.business.findFirst({
        where: { slug: requestedSlug, ownerId: session.user.id },
        select: { slug: true },
      })
    : await db.business.findFirst({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: 'desc' },
        select: { slug: true },
      })

  // Si no tiene negocios, redirigir al onboarding
  if (!business) {
    redirect('/onboarding')
  }

  return <Dashboard slug={business.slug} />
}
