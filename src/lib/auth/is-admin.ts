import { getServerSession } from 'next-auth'
import { authOptions } from './auth-options'

export type AdminUser = { id: string; email: string; name?: string | null }

/**
 * Lista de emails considerados admins de la plataforma.
 * Soporta ADMIN_EMAILS (CSV) y fallback a ADMIN_EMAIL (string).
 */
export function getAdminEmails(): string[] {
  const csv = process.env.ADMIN_EMAILS?.trim()
  if (csv) {
    return csv
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  }
  const single = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return single ? [single] : []
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const list = getAdminEmails()
  if (list.length === 0) return false
  return list.includes(email.trim().toLowerCase())
}

/**
 * Devuelve el usuario admin autenticado o null si:
 *  - no hay sesión
 *  - el email no está en la lista de admins
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) return null
  if (!isAdminEmail(session.user.email)) return null
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? null,
  }
}

/**
 * Lanza 'FORBIDDEN' si el usuario no es admin. Útil en server components.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin) {
    throw new Error('FORBIDDEN')
  }
  return admin
}

/**
 * Log ligero de acciones de admin (para auditoría básica en dev).
 */
export async function logAdminAction(action: string, meta?: Record<string, unknown>) {
  const admin = await getAdminUser()
  if (!admin) return
  console.log(`[admin:${admin.email}] ${action}`, meta ?? {})
}

