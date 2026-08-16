'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Phone,
  MapPin,
  Share2,
  Contact as ContactIcon,
  Star,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SafeImage } from '@/components/shared/safe-image'
import { useAnalytics, useSessionId } from '@/hooks/use-analytics'
import {
  buildWhatsAppUrl,
  buildWhatsAppMessage,
  buildTelUrl,
  buildVcf,
  getOpenStatus,
  safeParseArray,
} from '@/lib/business/helpers'
import { Service } from '@prisma/client'
import { NoticeBanner } from './notice-banner'
import { AboutSection } from './about-section'
import { ServicesSection } from './services-section'
import { GallerySection } from './gallery-section'
import { PromotionsSection } from './promotions-section'
import { HoursSection } from './hours-section'
import { LocationSection } from './location-section'
import { SocialSection } from './social-section'
import { ReviewsSection } from './reviews-section'
import { FaqSection } from './faq-section'
import { BookingDialog } from './booking-dialog'

interface Props {
  slug: string
}

export function Microsite({ slug }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingService, setBookingService] = useState<Service | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const sessionId = useSessionId()

  const { data: business, isLoading } = useQuery({
    queryKey: ['business', slug],
    queryFn: async () => {
      const url = new URL('/api/business', window.location.origin)
      url.searchParams.set('slug', slug)
      url.searchParams.set('track', '1')
      url.searchParams.set('sessionId', sessionId || 'anon')
      const res = await fetch(url.toString())
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 60_000,
  })

  const { track } = useAnalytics(business?.id)

  // Scroll to top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (isLoading) {
    return <MicrositeSkeleton />
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Esta página no existe o no está publicada.
        </p>
        <Button asChild>
          <a href="/">Volver a Unilink</a>
        </Button>
      </div>
    )
  }

  const primaryColor = business.primaryColor || '#0F766E'
  const openStatus = getOpenStatus(business.hours || [])
  const visibleButtons = safeParseArray(business.visibleButtons) as string[]
  const sectionOrder = safeParseArray(business.sectionOrder) as string[]
  const tags = safeParseArray(business.tags) as string[]
  const settings = business.settings

  const whatsappDefaultMsg = buildWhatsAppMessage(business.name)
  const whatsappUrl = buildWhatsAppUrl(business.whatsapp, whatsappDefaultMsg)
  const telUrl = buildTelUrl(business.phone)

  const handleWhatsApp = () => {
    track('whatsapp_click')
    if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }
  const handleCall = () => {
    track('call_click')
    if (telUrl) window.location.assign(telUrl)
  }
  const handleLocation = () => {
    track('maps_click')
    const url = business.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address || business.name)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  const handleShare = async () => {
    track('share_click')
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
    const shareData = {
      title: business.name,
      text: `Conoce ${business.name}: servicios, precios, ubicación y citas.`,
      url: shareUrl,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Enlace copiado al portapapeles')
      }
    } catch {
      // ignore
    }
  }
  const handleSaveContact = () => {
    track('save_contact_click')
    const vcf = buildVcf(business)
    const blob = new Blob([vcf], { type: 'text/vcard' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${business.slug}.vcf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleBook = (service: Service) => {
    setBookingService(service)
    setBookingOpen(true)
  }

  // Renderizar secciones en el orden configurado
  const renderSection = (key: string) => {
    if (key === 'services' && settings?.showServices !== false) {
      return (
        <ServicesSection
          key={key}
          categories={business.serviceCategories}
          uncategorizedServices={business.services}
          whatsapp={business.whatsapp}
          whatsappDefaultMessage={whatsappDefaultMsg}
          businessName={business.name}
          primaryColor={primaryColor}
          isBookingEnabled={business.isBookingEnabled}
          onBook={handleBook}
          track={track}
        />
      )
    }
    if (key === 'gallery' && settings?.showGallery !== false) {
      return <GallerySection key={key} items={business.galleryItems} primaryColor={primaryColor} />
    }
    if (key === 'promotions' && settings?.showPromotions !== false) {
      return <PromotionsSection key={key} promotions={business.promotions} primaryColor={primaryColor} />
    }
    if (key === 'about' && settings?.showAbout !== false) {
      return <AboutSection key={key} text={business.aboutText} tags={tags} primaryColor={primaryColor} />
    }
    if (key === 'hours' && settings?.showHours !== false) {
      return <HoursSection key={key} hours={business.hours} primaryColor={primaryColor} />
    }
    if (key === 'location' && settings?.showLocation !== false) {
      return (
        <LocationSection
          key={key}
          address={business.address}
          mapsUrl={business.mapsUrl}
          primaryColor={primaryColor}
          track={track}
        />
      )
    }
    if (key === 'reviews' && settings?.showReviews !== false) {
      return <ReviewsSection key={key} googleReviewUrl={business.googleReviewUrl} primaryColor={primaryColor} track={track} />
    }
    if (key === 'faq' && settings?.showFaq !== false) {
      return <FaqSection key={key} faqs={business.faqs} primaryColor={primaryColor} />
    }
    return null
  }

  const quickButtons = [
    { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp', onClick: handleWhatsApp, color: '#22c55e' },
    { key: 'call', icon: Phone, label: 'Llamar', onClick: handleCall, color: '#3b82f6' },
    { key: 'location', icon: MapPin, label: 'Ubicación', onClick: handleLocation, color: '#ef4444' },
    { key: 'instagram', icon: Star, label: 'Instagram', onClick: () => {
      const ig = business.socialLinks.find((s: { platform: string }) => s.platform === 'instagram')
      if (ig) {
        track('instagram_click')
        window.open(ig.url, '_blank', 'noopener,noreferrer')
      }
    }, color: '#ec4899' },
    { key: 'share', icon: Share2, label: 'Compartir', onClick: handleShare, color: '#64748b' },
    { key: 'saveContact', icon: ContactIcon, label: 'Contacto', onClick: handleSaveContact, color: '#a855f7' },
  ].filter((b) => visibleButtons.includes(b.key))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Cover */}
      <div className="relative w-full h-44 sm:h-56 bg-muted overflow-hidden flex-shrink-0">
        {business.coverUrl ? (
          <SafeImage
            src={business.coverUrl}
            alt={business.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            fallback={
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`,
                }}
              />
            }
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}99)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
      </div>

      {/* Profile header */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end justify-between">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-lg flex-shrink-0">
            {business.logoUrl ? (
              <SafeImage
                src={business.logoUrl}
                alt={business.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                {business.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            <OpenStatusBadge status={openStatus} primaryColor={primaryColor} />
          </div>
        </div>

        <div className="mt-3">
          <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
          {business.headline && (
            <p className="text-sm text-muted-foreground">{business.headline}</p>
          )}
          {business.description && (
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              {business.description}
            </p>
          )}
        </div>

        {/* Primary CTA - Reservar + WhatsApp cuando hay agenda activa */}
        <div className="mt-4 flex gap-2">
          {business.isBookingEnabled ? (
            <>
              <Button
                className="flex-1 h-11"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
                onClick={() => {
                  const firstBookableService = business.serviceCategories
                    ?.flatMap((c: { services: Service[] }) => c.services)
                    .find((s: Service) => s.isBookable)
                  if (firstBookableService) {
                    handleBook(firstBookableService)
                  }
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reservar cita
              </Button>
              {whatsappUrl && (
                <Button
                  className="flex-1 h-11"
                  style={{ backgroundColor: '#22c55e', color: '#fff' }}
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
            </>
          ) : business.primaryButton === 'call' && business.phone ? (
            <Button
              className="flex-1 h-11"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
              onClick={handleCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Llamar
            </Button>
          ) : business.primaryButton === 'share' ? (
            <Button
              className="flex-1 h-11"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
          ) : whatsappUrl ? (
            <Button
              className="flex-1 h-11"
              style={{ backgroundColor: '#22c55e', color: '#fff' }}
              onClick={handleWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
          ) : null}
        </div>
      </div>

      {/* Quick buttons */}
      {quickButtons.length > 0 && (
        <div className="px-4 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {quickButtons.map((b) => (
              <button
                key={b.key}
                onClick={b.onClick}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${b.color}1a`, color: b.color }}
                >
                  <b.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-medium">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notice */}
      {settings?.showNotice && business.noticeActive && business.noticeText && (
        <div className="mt-4">
          <NoticeBanner text={business.noticeText} primaryColor={primaryColor} />
        </div>
      )}

      {/* Sections */}
      <div className="mt-6 space-y-8 pb-32" style={{ paddingTop: 'env(safe-area-inset-bottom)' }}>
        {sectionOrder.map((key) => renderSection(key))}

        {/* Redes sociales - siempre al final antes del footer */}
        {settings?.showSocial !== false && business.socialLinks?.length > 0 && (
          <SocialSection
            businessId={business.id}
            links={business.socialLinks}
            primaryColor={primaryColor}
          />
        )}
      </div>

      {/* Footer marca blanca */}
      <footer className="mt-auto border-t border-border/60 py-6 px-4 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Hecho con
          <span className="font-semibold text-brand">Unilink</span>
          <span>→</span>
        </a>
      </footer>

      {/* Sticky CTA en móvil */}
      {business.isBookingEnabled && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/95 backdrop-blur-md border-t border-border/60"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto max-w-md flex gap-2">
            {business.primaryButton === 'book' && (
              <Button
                className="flex-1 h-11"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
                onClick={() => {
                  const firstBookableService = business.serviceCategories
                    ?.flatMap((c: { services: Service[] }) => c.services)
                    .find((s: Service) => s.isBookable)
                  if (firstBookableService) handleBook(firstBookableService)
                }}
              >
                Reservar cita
              </Button>
            )}
            {whatsappUrl && (
              <Button
                className="flex-1 h-11"
                style={{ backgroundColor: '#22c55e', color: '#fff' }}
                onClick={handleWhatsApp}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Booking dialog */}
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={bookingService}
        businessId={business.id}
        businessName={business.name}
        hours={business.hours || []}
        blocks={business.appointmentBlocks || []}
        appointments={business.appointments || []}
        maxDays={business.bookingMaxDays || 30}
        slotInterval={business.bookingSlotInterval || 30}
        sessionId={sessionId || 'unknown'}
        primaryColor={primaryColor}
        bookingNote={business.bookingNote}
        whatsapp={business.whatsapp}
      />

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-30 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center"
          style={{ color: primaryColor }}
          aria-label="Volver arriba"
        >
          <ChevronUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}

function OpenStatusBadge({
  status,
  primaryColor,
}: {
  status: { isOpen: boolean; label: string; detail?: string }
  primaryColor: string
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: status.isOpen ? '#22c55e1a' : '#ef44441a',
        color: status.isOpen ? '#22c55e' : '#ef4444',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: status.isOpen ? '#22c55e' : '#ef4444' }}
      />
      {status.label}
    </div>
  )
}

function MicrositeSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Skeleton className="w-full h-44 sm:h-56 rounded-none" />
      <div className="px-4 -mt-10 relative">
        <Skeleton className="w-20 h-20 rounded-2xl" />
        <Skeleton className="h-6 w-48 mt-3" />
        <Skeleton className="h-4 w-32 mt-2" />
        <Skeleton className="h-12 w-full mt-4" />
      </div>
      <div className="px-4 mt-6 space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}
