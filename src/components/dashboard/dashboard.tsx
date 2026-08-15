'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid,
  FileText,
  Tag,
  Calendar,
  BarChart3,
  Settings,
  ExternalLink,
  MessageCircle,
  MapPin,
  Phone,
  Eye,
  CalendarCheck,
  Share2,
  QrCode,
  Clock,
  TrendingUp,
  Users,
  ChevronDown,
  Building2,
  Check,
  Pencil,
  Palette,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { ServicesManager } from './services-manager'
import { GalleryManager } from './gallery-manager'
import { PromotionsManager } from './promotions-manager'
import { FaqsManager } from './faqs-manager'
import { HoursManager } from './hours-manager'
import { SocialLinksManager } from './social-links-manager'
import { AboutNoticeSection } from './about-notice-section'
import { AppointmentsManager } from './appointments-manager'
import { EditBusinessInfoDialog } from './edit-business-info-dialog'
import { EditBusinessDesignDialog } from './edit-business-design-dialog'
import { QrDialog } from './qr-dialog'
import { parseTags, type BusinessT } from './dashboard-helpers'

type Tab = 'inicio' | 'pagina' | 'servicios' | 'agenda' | 'estadisticas' | 'configuracion'

const NAV: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'inicio', label: 'Inicio', icon: LayoutGrid },
  { id: 'pagina', label: 'Mi página', icon: FileText },
  { id: 'servicios', label: 'Servicios', icon: Tag },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
]

export function Dashboard({ slug }: { slug: string }) {
  const [tab, setTab] = useState<Tab>('inicio')
  const [qrOpen, setQrOpen] = useState(false)
  const router = useRouter()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', slug],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/business?slug=${slug}`)
      if (!res.ok) return null
      return res.json()
    },
  })

  // Lista de negocios del usuario para el dropdown "Mis páginas"
  const { data: businessesData } = useQuery<{ businesses: any[] }>({
    queryKey: ['businesses'],
    queryFn: async () => {
      const res = await fetch('/api/businesses')
      if (!res.ok) return { businesses: [] }
      return res.json()
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <div className="mx-auto max-w-6xl w-full px-4 py-8">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64 mt-6" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No se encontró el negocio</p>
          <Button asChild><Link href="/">Volver</Link></Button>
        </div>
      </div>
    )
  }

  const business = data.business as BusinessT
  const metrics = data.metrics
  const primaryColor = business.primaryColor

  const businesses = businessesData?.businesses || []
  const hasMultipleBusinesses = businesses.length > 1

  const switchBusiness = (newSlug: string) => {
    if (newSlug === slug) return
    // Invalidar cache para que se vuelva a cargar el nuevo negocio
    qc.removeQueries({ queryKey: ['dashboard', slug] })
    router.push(`/dashboard?slug=${newSlug}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm">U</div>
            <span className="font-semibold tracking-tight hidden sm:block">Unilink</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Mis páginas dropdown - solo si tiene múltiples negocios */}
            {hasMultipleBusinesses && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 max-w-[180px]">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{business.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Mis páginas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {businesses.map((b) => (
                    <DropdownMenuItem
                      key={b.id}
                      onClick={() => switchBusiness(b.slug)}
                      className="gap-2 cursor-pointer"
                    >
                      <div
                        className="h-6 w-6 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: b.primaryColor || primaryColor }}
                      >
                        {b.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{b.name}</div>
                        <div className="text-xs text-muted-foreground truncate">/{b.slug}</div>
                      </div>
                      {b.slug === slug && <Check className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/onboarding" className="gap-2">
                      <span className="flex h-6 w-6 rounded-md items-center justify-center bg-muted text-xs">+</span>
                      <span className="text-sm">Crear nueva página</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="outline" size="sm" asChild>
              <Link href={`/${business.slug}`} target="_blank">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Ver mi página
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl w-full px-4 py-6 flex-1">
        {/* Greeting */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {greeting()},
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
          </div>
          {business.status === 'draft' && (
            <Card className="p-3 border-amber-300 bg-amber-50">
              <p className="text-xs text-amber-700 mb-2">Tu página está en preview. Publícala para compartir.</p>
              <Button size="sm" className="w-full bg-brand text-brand-foreground hover:bg-brand-600 h-8 text-xs">
                Publicar por $399
              </Button>
            </Card>
          )}
        </div>

        {/* Nav tabs - horizontal scroll on mobile */}
        <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-thin">
          <div className="flex gap-1 min-w-min">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === n.id ? 'bg-brand text-brand-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
          {tab === 'inicio' && (
            <motion.div key="inicio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <InicioView business={business} metrics={metrics} todaysAppointments={data.todaysAppointments} primaryColor={primaryColor} onQrOpen={() => setQrOpen(true)} />
            </motion.div>
          )}
          {tab === 'pagina' && (
            <motion.div key="pagina" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <PaginaView business={business} />
            </motion.div>
          )}
          {tab === 'servicios' && (
            <motion.div key="servicios" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ServicesManager business={business} />
            </motion.div>
          )}
          {tab === 'agenda' && (
            <motion.div key="agenda" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <AppointmentsManager business={business} />
            </motion.div>
          )}
          {tab === 'estadisticas' && (
            <motion.div key="estadisticas" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <EstadisticasView metrics={metrics} primaryColor={primaryColor} />
            </motion.div>
          )}
          {tab === 'configuracion' && (
            <motion.div key="configuracion" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <ConfiguracionView business={business} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-auto border-t border-border/60 py-4 px-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Unilink · Tu negocio en un link.
      </footer>

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        url={typeof window !== 'undefined' ? `${window.location.origin}/${business.slug}` : ''}
        businessName={business.name}
        primaryColor={primaryColor}
      />
    </div>
  )
}

// ===================== VIEWS =====================

function InicioView({ business, metrics, todaysAppointments, primaryColor, onQrOpen }: any) {
  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Eye className="h-4 w-4" />} value={metrics.page_view || 0} label="Visitas (7 días)" color="#0891B2" />
        <StatCard icon={<MessageCircle className="h-4 w-4" />} value={metrics.whatsapp_click || 0} label="Clics WhatsApp" color="#22c55e" />
        <StatCard icon={<MapPin className="h-4 w-4" />} value={metrics.maps_click || 0} label="Clics ubicación" color="#ef4444" />
        <StatCard icon={<CalendarCheck className="h-4 w-4" />} value={metrics.booking_completed || 0} label="Reservas" color={primaryColor} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Citas de hoy
            </h2>
            <Badge variant="secondary">{todaysAppointments.length}</Badge>
          </div>
          {todaysAppointments.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No hay citas para hoy
            </div>
          ) : (
            <div className="space-y-2">
              {todaysAppointments.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold w-12" style={{ color: primaryColor }}>{a.startTime}</div>
                    <div>
                      <div className="text-sm font-medium">{a.customerName}</div>
                      {a.service && <div className="text-xs text-muted-foreground">{a.service.name}</div>}
                    </div>
                  </div>
                  <Badge variant={a.status === 'confirmed' ? 'default' : a.status === 'pending' ? 'secondary' : 'outline'}>
                    {a.status === 'confirmed' ? 'Confirmada' : a.status === 'pending' ? 'Pendiente' : a.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <div className="space-y-3">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/${business.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" /> Ver mi página
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" /> Compartir
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={onQrOpen}>
                <QrCode className="h-4 w-4 mr-2" /> Descargar QR
              </Button>
            </div>
          </Card>

          {business.status === 'draft' && (
            <Card className="p-4 border-brand/30 bg-brand/5">
              <h3 className="font-semibold text-sm mb-1">Publica tu página</h3>
              <p className="text-xs text-muted-foreground mb-3">Está en preview. Publícala por $399 una sola vez.</p>
              <Button className="w-full bg-brand text-brand-foreground hover:bg-brand-600" size="sm">
                Publicar ahora
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Vista "Mi página" - compuesta por los managers de cada sección.
 * Reemplaza el antiguo inline read-only view.
 */
function PaginaView({ business }: { business: BusinessT }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [designOpen, setDesignOpen] = useState(false)
  const tags = parseTags(business.tags)

  return (
    <div className="space-y-5">
      {/* Información del negocio (read-only summary + botón para abrir diálogo de edición) */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-semibold">Información del negocio</h2>
          <Button variant="outline" size="sm" onClick={() => setInfoOpen(true)}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar información
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Nombre" value={business.name} />
          <InfoRow label="Subtítulo" value={business.headline || '—'} />
          <InfoRow label="Categoría" value={business.category} />
          <InfoRow label="Tipo" value={business.businessType || '—'} />
          <InfoRow label="WhatsApp" value={business.whatsapp || '—'} />
          <InfoRow label="Teléfono" value={business.phone || '—'} />
          <InfoRow label="Correo" value={business.email || '—'} />
          <InfoRow label="Dirección" value={business.address || '—'} />
        </div>
        {business.description && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Descripción</div>
            <p className="text-sm">{business.description}</p>
          </div>
        )}
        {tags.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-2">Etiquetas</div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t: string) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Diseño (resumen + botón para abrir diálogo de edición) */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h2 className="font-semibold">Diseño</h2>
          <Button variant="outline" size="sm" onClick={() => setDesignOpen(true)}>
            <Palette className="h-3.5 w-3.5 mr-1.5" /> Editar diseño
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Color principal</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: business.primaryColor }} />
              <code className="text-sm">{business.primaryColor}</code>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Estilo</div>
            <Badge variant="secondary" className="capitalize">{business.theme}</Badge>
          </div>
        </div>
      </Card>

      {/* Acerca de + Aviso destacado (editable inline) */}
      <AboutNoticeSection business={business} />

      {/* Horarios (editable inline) */}
      <HoursManager business={business} />

      {/* Redes sociales (CRUD inline) */}
      <SocialLinksManager business={business} />

      {/* Galería (CRUD inline) */}
      <GalleryManager business={business} />

      {/* Promociones (CRUD inline) */}
      <PromotionsManager business={business} />

      {/* FAQs (CRUD inline) */}
      <FaqsManager business={business} />

      {/* Vista previa */}
      <Card className="p-5">
        <h2 className="font-semibold mb-3">Vista previa</h2>
        <div className="aspect-[9/16] sm:aspect-[9/12] max-h-[500px] rounded-xl overflow-hidden border border-border bg-muted/30 relative">
          <iframe
            src={`/${business.slug}`}
            className="absolute inset-0 w-full h-full"
            title="Preview"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Así se ve tu página en tiempo real
        </p>
      </Card>

      {/* Diálogos de edición */}
      <EditBusinessInfoDialog business={business} open={infoOpen} onOpenChange={setInfoOpen} />
      <EditBusinessDesignDialog business={business} open={designOpen} onOpenChange={setDesignOpen} />
    </div>
  )
}

function EstadisticasView({ metrics, primaryColor }: any) {
  const eventList = [
    { key: 'page_view', label: 'Visitas a la página', icon: Eye, color: '#0891B2' },
    { key: 'whatsapp_click', label: 'Clics en WhatsApp', icon: MessageCircle, color: '#22c55e' },
    { key: 'call_click', label: 'Clics en llamar', icon: Phone, color: '#3b82f6' },
    { key: 'maps_click', label: 'Clics en ubicación', icon: MapPin, color: '#ef4444' },
    { key: 'instagram_click', label: 'Clics en Instagram', icon: Users, color: '#ec4899' },
    { key: 'service_click', label: 'Vistas de servicios', icon: Tag, color: '#a855f7' },
    { key: 'booking_completed', label: 'Reservas completadas', icon: CalendarCheck, color: primaryColor },
    { key: 'share_click', label: 'Veces compartida', icon: Share2, color: '#64748b' },
  ]

  const total = metrics.total || 1
  const maxValue = Math.max(...eventList.map((e) => metrics[e.key] || 0), 1)

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">Últimos 7 días</h2>
          <Badge variant="secondary" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {total} eventos
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Acciones de tus visitantes en tu página</p>
        <div className="space-y-3">
          {eventList.map((e) => {
            const value = metrics[e.key] || 0
            const pct = (value / maxValue) * 100
            return (
              <div key={e.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <e.icon className="h-3.5 w-3.5" style={{ color: e.color }} />
                    {e.label}
                  </div>
                  <span className="text-sm font-bold">{value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: e.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Eye className="h-4 w-4" />} value={metrics.page_view || 0} label="Visitas" color="#0891B2" />
        <StatCard icon={<MessageCircle className="h-4 w-4" />} value={metrics.whatsapp_click || 0} label="WhatsApp" color="#22c55e" />
        <StatCard icon={<MapPin className="h-4 w-4" />} value={metrics.maps_click || 0} label="Ubicación" color="#ef4444" />
        <StatCard icon={<CalendarCheck className="h-4 w-4" />} value={metrics.booking_completed || 0} label="Reservas" color={primaryColor} />
      </div>
    </div>
  )
}

/**
 * Vista de Configuración - mantiene la sección existente (cuenta, agenda, zona de peligro)
 * pero ahora incluye botones para abrir los diálogos de edición de info y diseño.
 */
function ConfiguracionView({ business }: { business: BusinessT }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const [designOpen, setDesignOpen] = useState(false)

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <h2 className="font-semibold">Cuenta</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setInfoOpen(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar información
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDesignOpen(true)}>
              <Palette className="h-3.5 w-3.5 mr-1.5" /> Editar diseño
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Plan" value="Página Digital · $399" />
          <InfoRow label="Estado" value={business.status} />
          <InfoRow label="URL pública" value={`unilink.mx/${business.slug}`} />
          <InfoRow label="Creada" value={format(new Date(business.createdAt), "d 'de' MMMM, yyyy", { locale: es })} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-4">Agenda</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Agenda activa" value={business.isBookingEnabled ? 'Sí' : 'No'} />
          {business.isBookingEnabled && (
            <>
              <InfoRow label="Intervalo" value={`${business.bookingSlotInterval} min`} />
              <InfoRow label="Días disponibles" value={`${business.bookingMaxDays} días futuros`} />
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Para gestionar citas, bloqueos y configuración avanzada, usa la pestaña <strong>Agenda</strong>.
        </p>
      </Card>

      <Card className="p-5 border-red-200">
        <h2 className="font-semibold mb-2 text-red-700">Zona de peligro</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Suspender o eliminar tu página. Esta acción no se puede deshacer.
        </p>
        <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-50">
          Suspender página
        </Button>
      </Card>

      {/* Diálogos de edición (compartidos con la vista "Mi página") */}
      <EditBusinessInfoDialog business={business} open={infoOpen} onOpenChange={setInfoOpen} />
      <EditBusinessDesignDialog business={business} open={designOpen} onOpenChange={setDesignOpen} />
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}1a`, color }}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  )
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}
