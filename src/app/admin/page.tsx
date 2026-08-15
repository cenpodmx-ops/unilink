import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { isAdminEmail } from '@/lib/auth/is-admin'
import { AdminPanel } from '@/components/admin/admin-panel'

export const dynamic = 'force-dynamic'

/**
 * /admin
 * Panel administrativo de la plataforma (dueño de Unilink).
 * Gate: el email de la sesión debe estar en ADMIN_EMAILS / ADMIN_EMAIL.
 */
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin')
  }

  const email = session.user.email ?? ''
  const name = session.user.name ?? undefined

  // Si no es admin, mandarlo a su dashboard (no mostramos la página de admin)
  if (!isAdminEmail(email)) {
    redirect('/dashboard')
  }

  return <AdminPanel adminEmail={email} adminName={name} />
}

