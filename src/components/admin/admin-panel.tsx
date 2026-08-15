'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  Building2,
  Users as UsersIcon,
  BarChart3,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  LayoutDashboard,
  Eye,
  CalendarCheck,
  TrendingUp,
  Activity,
  Ban,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Search,
  UserCheck,
  Eye as EyeIcon,
  MessageCircle,
  MapPin,
  Share2,
  Phone,
  Instagram,
  Tag,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// ===================== TIPOS =====================

type AdminBusiness = {
  id: string
  name: string
  slug: string
  category: string
  businessType: string | null
  status: string
  primaryColor: string
  isBookingEnabled: boolean
  createdAt: string
  updatedAt: string
  owner: { id: string; email: string; name: string | null }
  metrics: {
    pageViews: number
    appointments: number
    confirmedAppointments: number
  }
}

type AdminUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: string
  businessesCount: number
  isAdmin: boolean
}

type AdminStats = {
  totals: {
    users: number
    businesses: number
    activeBusinesses: number
    draftBusinesses: number
    suspendedBusinesses: number
    deletedBusinesses: number
    pageViews: number
    appointments: number
    confirmedAppointments: number
    pendingAppointments: number
  }
  growth: {
    businesses7d: number
    businesses30d: number
    users7d: number
    users30d: number
    bookings7d: number
  }
  eventsByType: Record<string, number>
}

type Tab = 'negocios' | 'usuarios' | 'metricas' | 'moderacion'

const NAV: { id: Tab; label: string; icon: typeof Building2 }[] = [
  { id: 'negocios', label: 'Negocios', icon: Building2 },
  { id: 'usuarios', label: 'Usuarios', icon: UsersIcon },
  { id: 'metricas', label: 'Métricas', icon: BarChart3 },
  { id: 'moderacion', label: 'Moderación', icon: ShieldAlert },
]

const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  active: { label: 'Activo', className: 'bg-green-100 text-green-700 border-green-200' },
  draft: { label: 'Borrador', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspendido', className: 'bg-red-100 text-red-700 border-red-200' },
  pending_payment: { label: 'Pago pendiente', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  deleted: { label: 'Eliminado', className: 'bg-gray-200 text-gray-600 border-gray-300 line-through' },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }
  return (
    <Badge variant="outline" className={meta.className}>
      {meta.label}
    </Badge>
  )
}

function CategoryLabel({ category }: { category: string }) {
  const LABELS: Record<string, string> = {
    belleza: 'Belleza',
    salud: 'Salud',
    profesional: 'Profesional',
    comida: 'Comida',
    automotriz: 'Automotriz',
    hogar: 'Hogar',
    fitness: 'Fitness',
    fotografia: 'Fotografía',
    comercio: 'Comercio',
    otro: 'Otro',
  }
  return <span>{LABELS[category] ?? category}</span>
}

// ===================== MAIN =====================

export function AdminPanel({
  adminEmail,
  adminName,
}: {
  adminEmail: string
  adminName?: string
}) {
  const [tab, setTab] = useState<Tab>('negocios')

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top bar - distinguisehd from regular dashboard */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm flex-shrink-0">
              U
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold tracking-tight hidden sm:block">Unilink</span>
              <Badge className="bg-brand/10 text-brand border-brand/20 flex-shrink-0">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end text-right leading-tight mr-1">
              <span className="text-xs text-muted-foreground">Conectado como</span>
              <span className="text-xs font-medium truncate max-w-[200px]">
                {adminName ? `${adminName} · ` : ''}{adminEmail}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Volver a mi dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl w-full px-4 py-6 flex-1">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Panel administrativo</p>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Plataforma
            <Badge className="bg-brand text-brand-foreground">Admin</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestión global de negocios, usuarios y métricas de la plataforma.
          </p>
        </div>

        {/* Nav tabs - horizontal scroll on mobile (same pattern as dashboard) */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-thin">
          <div className="flex gap-1 min-w-min">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === n.id
                    ? 'bg-brand text-brand-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === 'negocios' && (
            <motion.div
              key="negocios"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <NegociosView />
            </motion.div>
          )}
          {tab === 'usuarios' && (
            <motion.div
              key="usuarios"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <UsuariosView />
            </motion.div>
          )}
          {tab === 'metricas' && (
            <motion.div
              key="metricas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MetricasView />
            </motion.div>
          )}
          {tab === 'moderacion' && (
            <motion.div
              key="moderacion"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ModeracionView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 text-center text-xs text-muted-foreground">
        © Unilink · Panel administrativo
      </footer>
    </div>
  )
}

// ===================== MUTATION =====================

function useChangeBusinessStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'suspended' | 'deleted' | 'draft' | 'pending_payment'
    }) => {
      const res = await fetch(`/api/admin/businesses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo actualizar el status')
      }
      return res.json()
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'businesses'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      const label = STATUS_META[vars.status]?.label ?? vars.status
      toast.success(`Negocio marcado como "${label}"`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error al actualizar status')
    },
  })
}

// ===================== NEGOCIOS =====================

function NegociosView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading } = useQuery<{ businesses: AdminBusiness[] }>({
    queryKey: ['admin', 'businesses'],
    queryFn: async () => {
      const res = await fetch('/api/admin/businesses')
      if (!res.ok) throw new Error('No se pudieron cargar los negocios')
      return res.json()
    },
  })

  const businesses = data?.businesses ?? []
  const filtered = businesses.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.owner.email.toLowerCase().includes(q) ||
      (b.owner.name ?? '').toLowerCase().includes(q)
    )
  })

  if (isLoading) {
    return <NegociosSkeleton />
  }

  const FILTERS = ['all', 'active', 'draft', 'suspended', 'deleted']

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, slug o email…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-thin -mx-1 px-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-background border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? 'Todos' : (STATUS_META[f]?.label ?? f)}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Negocio</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  <Eye className="h-3.5 w-3.5 inline mr-1" />Visitas
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  <CalendarCheck className="h-3.5 w-3.5 inline mr-1" />Citas
                </TableHead>
                <TableHead className="hidden lg:table-cell">Creado</TableHead>
                <TableHead className="text-right pr-4">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    No se encontraron negocios.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((b) => (
                <BusinessRow key={b.id} business={b} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Mostrando {filtered.length} de {businesses.length} negocios
      </p>
    </div>
  )
}

function BusinessRow({ business }: { business: AdminBusiness }) {
  const statusMut = useChangeBusinessStatus()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const setStatus = (status: 'active' | 'suspended' | 'deleted' | 'draft') => {
    statusMut.mutate({ id: business.id, status })
  }

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="h-8 w-8 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: business.primaryColor || '#0F766E' }}
          >
            {business.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate max-w-[180px]">{business.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[180px]">/{business.slug}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-xs">
          <div className="font-medium truncate max-w-[160px]">{business.owner.name || business.owner.email}</div>
          <div className="text-muted-foreground truncate max-w-[160px]">{business.owner.email}</div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm">
        <CategoryLabel category={business.category} />
      </TableCell>
      <TableCell>
        <StatusBadge status={business.status} />
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell tabular-nums">
        {business.metrics.pageViews}
      </TableCell>
      <TableCell className="text-right hidden md:table-cell tabular-nums">
        {business.metrics.appointments}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
        {format(new Date(business.createdAt), 'd MMM yyyy', { locale: es })}
      </TableCell>
      <TableCell className="pr-4">
        <div className="flex items-center justify-end gap-1">
          <Button asChild size="sm" variant="ghost" className="h-8 px-2" title="Ver página pública">
            <Link href={`/${business.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="h-8 px-2" title="Ver dashboard del negocio">
            <Link href={`/dashboard?slug=${business.slug}`}>
              <LayoutDashboard className="h-3.5 w-3.5" />
            </Link>
          </Button>

          {business.status !== 'active' && business.status !== 'deleted' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Activar"
              disabled={statusMut.isPending}
              onClick={() => setStatus('active')}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
          {business.status === 'active' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              title="Suspender"
              disabled={statusMut.isPending}
              onClick={() => setStatus('suspended')}
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
          {business.status === 'deleted' ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Restaurar (marcar como activo)"
              disabled={statusMut.isPending}
              onClick={() => setStatus('active')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar (soft-delete)"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción marcará el negocio <strong>{business.name}</strong> ({business.slug}) como
                eliminado. La página pública dejará de estar disponible, pero los datos se conservan
                en la base de datos (soft-delete). Podrás restaurarlo más tarde.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={statusMut.isPending}
                onClick={() => {
                  setStatus('deleted')
                  setConfirmDelete(false)
                }}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}

function NegociosSkeleton() {
  return (
    <Card className="py-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ===================== USUARIOS =====================

function UsuariosView() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery<{ users: AdminUser[] }>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('No se pudieron cargar los usuarios')
      return res.json()
    },
  })

  const users = data?.users ?? []
  const filtered = users.filter((u) => {
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      (u.name ?? '').toLowerCase().includes(q)
    )
  })

  if (isLoading) {
    return (
      <Card className="py-0 overflow-hidden">
        <CardContent className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuario…"
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {users.length} usuarios en total
        </span>
      </div>

      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Rol</TableHead>
                <TableHead className="text-right">Negocios</TableHead>
                <TableHead className="hidden lg:table-cell pr-4">Registrado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(u.name || u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate max-w-[220px]">
                          {u.name || 'Sin nombre'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {u.isAdmin ? (
                      <Badge className="bg-brand/10 text-brand border-brand/20">
                        <ShieldAlert className="h-3 w-3 mr-1" />Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Usuario</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="font-medium">{u.businessesCount}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground pr-4">
                    {format(new Date(u.createdAt), 'd MMM yyyy', { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ===================== MÉTRICAS =====================

function MetricasView() {
  const { data, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('No se pudieron cargar las métricas')
      return res.json()
    },
  })

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  const { totals, growth, eventsByType } = data

  const topEvents = Object.entries(eventsByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const maxEvent = topEvents[0]?.[1] || 1

  const EVENT_LABELS: Record<string, string> = {
    page_view: 'Visitas',
    whatsapp_click: 'WhatsApp',
    call_click: 'Llamar',
    maps_click: 'Ubicación',
    instagram_click: 'Instagram',
    service_click: 'Servicio',
    booking_started: 'Reserva iniciada',
    booking_completed: 'Reserva completada',
    share_click: 'Compartir',
    save_contact_click: 'Guardar contacto',
  }

  const EVENT_ICONS: Record<string, typeof EyeIcon> = {
    page_view: EyeIcon,
    whatsapp_click: MessageCircle,
    call_click: Phone,
    maps_click: MapPin,
    instagram_click: Instagram,
    service_click: Tag,
    booking_started: CalendarCheck,
    booking_completed: CheckCircle2,
    share_click: Share2,
    save_contact_click: UserCheck,
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Usuarios"
          value={totals.users}
          subtitle={`+${growth.users7d} esta semana · +${growth.users30d} este mes`}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Negocios"
          value={totals.businesses}
          subtitle={`+${growth.businesses7d} esta semana · +${growth.businesses30d} este mes`}
          icon={Building2}
          color="bg-brand"
        />
        <StatCard
          title="Negocios activos"
          value={totals.activeBusinesses}
          subtitle={`${totals.draftBusinesses} en borrador · ${totals.suspendedBusinesses} suspendidos`}
          icon={CheckCircle2}
          color="bg-green-500"
        />
        <StatCard
          title="Visitas totales"
          value={totals.pageViews}
          subtitle="Acumulado histórico (page_view)"
          icon={EyeIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Citas totales"
          value={totals.appointments}
          subtitle={`${totals.confirmedAppointments} confirmadas · ${totals.pendingAppointments} pendientes`}
          icon={CalendarCheck}
          color="bg-amber-500"
        />
        <StatCard
          title="Reservas 7 días"
          value={growth.bookings7d}
          subtitle="Citas creadas esta semana"
          icon={TrendingUp}
          color="bg-pink-500"
        />
        <StatCard
          title="Suspendidos"
          value={totals.suspendedBusinesses}
          subtitle="Requieren moderación"
          icon={Ban}
          color="bg-red-500"
        />
        <StatCard
          title="Eliminados"
          value={totals.deletedBusinesses}
          subtitle="Soft-delete (restaurables)"
          icon={Trash2}
          color="bg-gray-500"
        />
      </div>

      {/* Event breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Eventos por tipo
          </CardTitle>
          <CardDescription>
            Distribución de todas las interacciones registradas en la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aún no hay eventos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {topEvents.map(([type, count]) => {
                const Icon = EVENT_ICONS[type] ?? Activity
                const pct = Math.max(2, Math.round((count / maxEvent) * 100))
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className="w-32 flex items-center gap-2 text-sm flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">
                        {EVENT_LABELS[type] ?? type}
                      </span>
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-brand/70"
                      />
                    </div>
                    <div className="w-16 text-right text-sm font-medium tabular-nums">
                      {count}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  subtitle?: string
  icon: typeof EyeIcon
  color: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-bold tabular-nums mt-1">{value}</p>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-tight">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${color} text-white flex-shrink-0`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===================== MODERACIÓN =====================

function ModeracionView() {
  const { data, isLoading } = useQuery<{ businesses: AdminBusiness[] }>({
    queryKey: ['admin', 'businesses'],
    queryFn: async () => {
      const res = await fetch('/api/admin/businesses?status=suspended')
      if (!res.ok) throw new Error('No se pudieron cargar los negocios suspendidos')
      return res.json()
    },
  })

  const suspended = data?.businesses ?? []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">
              {suspended.length === 0
                ? 'No hay negocios suspendidos.'
                : `${suspended.length} negocio${suspended.length === 1 ? '' : 's'} suspendido${suspended.length === 1 ? '' : 's'}.`}
            </p>
            <p className="text-xs text-red-700 mt-1">
              Desde aquí puedes activar o eliminar (soft-delete) negocios que fueron suspendidos.
            </p>
          </div>
        </CardContent>
      </Card>

      {suspended.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-3" />
            Todo en orden. No hay negocios que requieran moderación.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {suspended.map((b) => (
            <ModerationCard key={b.id} business={b} />
          ))}
        </div>
      )}
    </div>
  )
}

function ModerationCard({ business }: { business: AdminBusiness }) {
  const statusMut = useChangeBusinessStatus()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const activate = () => statusMut.mutate({ id: business.id, status: 'active' })
  const remove = () => statusMut.mutate({ id: business.id, status: 'deleted' })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-md flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: business.primaryColor || '#0F766E' }}
            >
              {business.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{business.name}</span>
                <StatusBadge status={business.status} />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                /{business.slug} · {business.owner.email} · {business.metrics.pageViews} visitas · {business.metrics.appointments} citas
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild size="sm" variant="outline">
              <Link href={`/${business.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />Ver
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard?slug=${business.slug}`}>
                <LayoutDashboard className="h-3.5 w-3.5 mr-1" />Dashboard
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={statusMut.isPending}
              onClick={activate}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Activar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={statusMut.isPending}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />Eliminar
            </Button>
          </div>
        </div>

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
              <AlertDialogDescription>
                El negocio <strong>{business.name}</strong> ({business.slug}) será marcado como
                eliminado (soft-delete). La página pública dejará de estar disponible, pero los datos
                se conservan y podrán restaurarse más tarde.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={statusMut.isPending}
                onClick={() => {
                  remove()
                  setConfirmDelete(false)
                }}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
