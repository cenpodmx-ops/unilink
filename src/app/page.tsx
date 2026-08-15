'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Calendar,
  Star,
  QrCode,
  Share2,
  Images,
  Tag,
  Sparkles,
  Check,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

// =================================================================
// LANDING PÚBLICA — Unilink
// "Tu negocio en un link."
// =================================================================

const features = [
  {
    icon: Tag,
    title: 'Servicios y precios',
    desc: 'Muestra qué ofreces y cuánto cuesta. Sin menús complicados.',
  },
  {
    icon: Images,
    title: 'Galería de trabajos',
    desc: 'Sube fotos de tu trabajo. Ideal para negocios visuales.',
  },
  {
    icon: Clock,
    title: 'Horarios inteligentes',
    desc: 'Muestra automáticamente "Abierto ahora" o cuándo abres.',
  },
  {
    icon: MapPin,
    title: 'Ubicación con Cómo llegar',
    desc: 'Tus clientes llegan fácil con un toque a Google Maps.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp contextual',
    desc: 'Cada servicio genera su propio mensaje. Leads que ya saben qué quieren.',
  },
  {
    icon: Calendar,
    title: 'Agenda opcional',
    desc: 'Si trabajas con cita, recibe reservas directo a tu panel.',
  },
  {
    icon: QrCode,
    title: 'QR incluido',
    desc: 'Tu código QR listo para imprimir y poner en tu mostrador.',
  },
  {
    icon: Star,
    title: 'Reseñas en Google',
    desc: 'Conecta tu enlace y recibe más reseñas con un toque.',
  },
]

const categories = [
  { name: 'Barberías', emoji: '💈' },
  { name: 'Estéticas', emoji: '💆‍♀️' },
  { name: 'Uñas & Lashes', emoji: '💅' },
  { name: 'Maquillistas', emoji: '💄' },
  { name: 'Fotógrafos', emoji: '📸' },
  { name: 'Tatuadores', emoji: '🎨' },
  { name: 'Spas & Masajes', emoji: '🌸' },
  { name: 'Nutriólogos', emoji: '🥗' },
  { name: 'Psicólogos', emoji: '🧠' },
  { name: 'Entrenadores', emoji: '💪' },
  { name: 'Mecánicos', emoji: '🔧' },
  { name: 'Detailing', emoji: '✨' },
  { name: 'Abogados', emoji: '⚖️' },
  { name: 'Contadores', emoji: '📊' },
  { name: 'Dentistas', emoji: '🦷' },
  { name: 'Repostería', emoji: '🧁' },
]

const faqs = [
  {
    q: '¿Necesito dominio o hosting?',
    a: 'No. Tu página vive bajo unilink.mx/tu-negocio. Sin DNS, sin SSL, sin dolores de cabeza.',
  },
  {
    q: '¿Es una suscripción mensual?',
    a: 'No. Pagas una sola vez ($399 MXN) y tu página queda publicada. Sin renovaciones forzadas.',
  },
  {
    q: '¿Necesito saber programar o diseñar?',
    a: 'Para nada. Eliges tu color, tu tipografía y tu estilo. Nosotros nos encargamos del resto. En 5 minutos tienes página profesional.',
  },
  {
    q: '¿Es un CRM o sistema administrativo?',
    a: 'No, y nunca lo será. Unilink es presencia digital: ayuda a presentarte, ser encontrado y ser contactado. Tu herramienta principal sigue siendo WhatsApp.',
  },
  {
    q: '¿Puedo recibir reservas?',
    a: 'Sí, opcional. Activa la agenda si trabajas con cita. Tus clientes eligen servicio, fecha y hora en segundos.',
  },
  {
    q: '¿Puedo tener varios negocios?',
    a: 'Sí. Una sola cuenta puede administrar múltiples páginas, cada una independiente y con su propio pago.',
  },
]

const stats = [
  { value: '5 min', label: 'para tener tu página lista' },
  { value: '1 link', label: 'para todo tu negocio' },
  { value: '$399', label: 'pago único, sin sorpresas' },
  { value: '0', label: 'conocimientos técnicos' },
]

export default function LandingPage() {
  const [mobilePreview, setMobilePreview] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ===================== NAV ===================== */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm">
              U
            </div>
            <span className="font-semibold text-lg tracking-tight">Unilink</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Funciones
            </a>
            <a href="#categorias" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Categorías
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Precio
            </a>
            <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link href="/dashboard">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild className="bg-brand text-brand-foreground hover:bg-brand-600">
              <Link href="/onboarding">
                Crear mi página
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Copy */}
              <div className="text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Badge variant="secondary" className="mb-5 gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border-brand-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    Tu negocio en un solo link
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                >
                  La página profesional de{' '}
                  <span className="text-brand">tu negocio</span>, en un enlace.
                </motion.h1>
                <motion.p
                  className="mt-5 text-lg text-muted-foreground text-balance max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                >
                  Servicios, precios, galería, horarios, ubicación, WhatsApp y citas.
                  Todo en una sola URL que compartes en Instagram, WhatsApp, Facebook o tu QR.
                  Sin diseñador, sin dominio, sin dolores de cabeza.
                </motion.p>
                <motion.div
                  className="mt-7 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                >
                  <Button size="lg" asChild className="bg-brand text-brand-foreground hover:bg-brand-600 w-full sm:w-auto h-12 text-base px-6">
                    <Link href="/onboarding">
                      Crear mi página gratis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 text-base px-6">
                    <Link href="/studio-fernanda">
                      Ver ejemplo en vivo
                    </Link>
                  </Button>
                </motion.div>
                <motion.p
                  className="mt-4 text-xs text-muted-foreground text-center lg:text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                >
                  Construye y previsualiza gratis · Publicas cuando quieras por $399 una sola vez
                </motion.p>
              </div>

              {/* Phone mockup */}
              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                <PhoneMockup />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===================== STATS ===================== */}
        <section className="border-y border-border/60 bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-brand">{s.value}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FEATURES ===================== */}
        <section id="features" className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <Badge variant="secondary" className="mb-3">Todo incluido</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Una página, todo lo que tu cliente necesita saber
              </h2>
              <p className="mt-4 text-muted-foreground text-balance">
                Cada módulo está pensado para que tu cliente encuentre rápido la información
                que busca y te contacte sin fricción.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
                >
                  <Card className="h-full p-5 hover:shadow-md transition-shadow border-border/60">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand mb-4">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CATEGORIES ===================== */}
        <section id="categorias" className="py-16 sm:py-20 bg-muted/30 border-y border-border/60">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-3">Para quién es</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Pensado para pequeños negocios e independientes
              </h2>
              <p className="mt-4 text-muted-foreground text-balance">
                El software es el mismo. Tú lo adaptas a tu giro.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: (i % 8) * 0.04 }}
                >
                  <button className="w-full group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-brand hover:shadow-sm transition-all text-left">
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="font-medium text-sm group-hover:text-brand transition-colors">{c.name}</span>
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ¿Tu giro no está aquí? <span className="text-brand font-medium">También funciona para ti.</span>
            </p>
          </div>
        </section>

        {/* ===================== VALUE PROP ===================== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl bg-brand text-brand-foreground p-8 sm:p-12 lg:p-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 grid-pattern" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance max-w-3xl">
                  No es un CRM. No es un sistema administrativo.
                </h2>
                <p className="mt-4 text-lg opacity-90 max-w-2xl text-balance">
                  Es tu presencia digital. Entra una vez al mes para cambiar un precio,
                  subir una foto o ver cuántas visitas tuviste. Tu herramienta principal
                  sigue siendo WhatsApp. Nosotros hacemos que llegue gente mejor informada.
                </p>
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  {['Sin CRM', 'Sin inventario', 'Sin POS', 'Sin facturación', 'Sin suscripciones', 'Sin automatizaciones'].map(
                    (item) => (
                      <div key={item} className="flex items-center gap-2 text-sm font-medium">
                        <Check className="h-4 w-4" />
                        {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== PRICING ===================== */}
        <section id="pricing" className="py-16 sm:py-24 bg-muted/30 border-y border-border/60">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <Badge variant="secondary" className="mb-3">Precio</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
                Un producto. Un precio. Una sola vez.
              </h2>
              <p className="mt-4 text-muted-foreground text-balance">
                Nada de planes Starter / Pro / Enterprise. Construye tu página gratis y publícala cuando quieras.
              </p>
            </div>

            <Card className="p-8 sm:p-10 border-2 border-brand/20 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-5">
                  Página Digital
                </div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl sm:text-6xl font-bold tracking-tight">$399</span>
                  <span className="text-lg text-muted-foreground mb-2 ml-1">MXN</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">pago único · sin renovaciones</p>

                <div className="mt-8 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-left max-w-lg mx-auto">
                  {[
                    'Página profesional',
                    'Servicios y precios',
                    'Catálogo de productos',
                    'Galería de trabajos',
                    'Promociones con vigencia',
                    'Horarios automáticos',
                    'Ubicación + Cómo llegar',
                    'Redes sociales',
                    'WhatsApp contextual',
                    'QR descargable',
                    'Reseñas en Google',
                    'FAQ',
                    'Agenda opcional',
                    'Estadísticas básicas',
                    'Personalización de color y estilo',
                    'SEO + OpenGraph',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-brand mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button size="lg" asChild className="mt-8 bg-brand text-brand-foreground hover:bg-brand-600 w-full sm:w-auto h-12 text-base px-8">
                  <Link href="/onboarding">
                    Crear mi página
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Construyes y previsualizas gratis. Pagas solo cuando publiques.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* ===================== FAQ ===================== */}
        <section id="faq" className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-3">Preguntas frecuentes</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Lo que quizás te estás preguntando
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/60">
                  <AccordionTrigger className="text-left text-base font-medium py-5 hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-balance">
              Tu negocio en un link.
              <br />
              <span className="text-brand">Listo en 5 minutos.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground text-balance max-w-xl mx-auto">
              Sube tus servicios, pon tu WhatsApp, elige tu color.
              Comparte un enlace. Recibe clientes mejor informados.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="bg-brand text-brand-foreground hover:bg-brand-600 h-12 text-base px-8">
                <Link href="/onboarding">
                  Crear mi página
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 text-base px-8">
                <Link href="/studio-fernanda">
                  Ver ejemplo real
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-border/60 bg-muted/30 mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground font-bold text-xs">
                U
              </div>
              <span className="font-semibold">Unilink</span>
              <span className="text-sm text-muted-foreground ml-2">Tu negocio en un link.</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Funciones</a>
              <a href="#categorias" className="hover:text-foreground transition-colors">Categorías</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Precio</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/60 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Unilink · Micro Business Presence Platform · Hecho con cariño para pequeños negocios 🇲🇽
          </div>
        </div>
      </footer>
    </div>
  )
}

// =================================================================
// PHONE MOCKUP — Preview de un micrositio dentro de un celular
// =================================================================

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 bg-brand/20 blur-3xl rounded-full opacity-60" />

      {/* Phone frame */}
      <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[640px] rounded-[2.5rem] bg-neutral-900 p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white">
          {/* Mini micrositio preview */}
          <div className="h-full overflow-y-auto scrollbar-thin">
            {/* Cover */}
            <div className="relative h-32 bg-gradient-to-br from-teal-400 to-emerald-600">
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Logo + name */}
            <div className="px-4 -mt-8 relative">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border-2 border-white">
                <span className="text-2xl">💅</span>
              </div>
              <h3 className="mt-2 font-bold text-lg">Studio Fernanda</h3>
              <p className="text-xs text-muted-foreground">Nails & Beauty</p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Abierto ahora
              </div>
            </div>

            {/* Quick buttons */}
            <div className="px-4 mt-3 grid grid-cols-3 gap-2">
              {[
                { icon: MessageCircle, label: 'WhatsApp', color: 'bg-green-50 text-green-600' },
                { icon: Phone, label: 'Llamar', color: 'bg-blue-50 text-blue-600' },
                { icon: MapPin, label: 'Ubicación', color: 'bg-red-50 text-red-600' },
              ].map((b) => (
                <div key={b.label} className={`flex flex-col items-center gap-1 py-2 rounded-xl ${b.color}`}>
                  <b.icon className="h-4 w-4" />
                  <span className="text-[9px] font-medium">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Services */}
            <div className="px-4 mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Servicios</h4>
              <div className="space-y-2">
                {[
                  { name: 'Manicure clásica', price: '$250', time: '45 min' },
                  { name: 'Uñas acrílicas', price: 'Desde $600', time: '90 min' },
                  { name: 'Pedicure spa', price: '$450', time: '60 min' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100">
                    <div>
                      <div className="text-xs font-medium">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">{s.time}</div>
                    </div>
                    <div className="text-xs font-bold text-teal-600">{s.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-4 mt-4 pb-6">
              <div className="bg-teal-600 text-white text-center py-2.5 rounded-xl text-xs font-semibold">
                Reservar cita
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <motion.div
        className="absolute -left-4 top-1/3 bg-white shadow-lg rounded-xl p-3 border border-border/60 hidden sm:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-bold">+38 clics</div>
            <div className="text-[10px] text-muted-foreground">esta semana</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -right-4 bottom-1/4 bg-white shadow-lg rounded-xl p-3 border border-border/60 hidden sm:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <div className="text-xs font-bold">8 reservas</div>
            <div className="text-[10px] text-muted-foreground">esta semana</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
