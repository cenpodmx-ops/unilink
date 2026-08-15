'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { Service, ServiceCategory } from '@prisma/client'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '@/lib/business/helpers'
import { SectionTitle } from './hours-section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/shared/safe-image'

interface Props {
  categories: (ServiceCategory & { services: Service[] })[]
  uncategorizedServices: Service[]
  whatsapp: string | null
  whatsappDefaultMessage: string
  businessName: string
  primaryColor: string
  isBookingEnabled: boolean
  onBook: (service: Service) => void
  track: (eventType: string, extra?: { serviceId?: string }) => Promise<void>
}

export function ServicesSection({
  categories,
  uncategorizedServices,
  whatsapp,
  whatsappDefaultMessage,
  businessName,
  primaryColor,
  isBookingEnabled,
  onBook,
  track,
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.id)),
  )

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderService = (s: Service) => (
    <ServiceCard
      key={s.id}
      service={s}
      whatsapp={whatsapp}
      whatsappDefaultMessage={whatsappDefaultMessage}
      businessName={businessName}
      primaryColor={primaryColor}
      isBookingEnabled={isBookingEnabled}
      onBook={onBook}
      track={track}
    />
  )

  const hasContent =
    categories.some((c) => c.services.length > 0) || uncategorizedServices.length > 0
  if (!hasContent) return null

  return (
    <section id="servicios" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>🛍️</span>
          {categories.some((c) => c.services.some((s) => s.type === 'product'))
            ? 'Servicios y productos'
            : 'Servicios'}
        </span>
      </SectionTitle>

      <div className="space-y-4">
        {categories.map((cat) => {
          if (cat.services.length === 0) return null
          const expanded = expandedCategories.has(cat.id)
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between w-full mb-2 group"
              >
                <h3 className="font-semibold text-base">{cat.name}</h3>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {cat.services.length} {cat.services.length === 1 ? 'item' : 'items'} {expanded ? '−' : '+'}
                </span>
              </button>
              {expanded && <div className="space-y-2">{cat.services.map(renderService)}</div>}
            </div>
          )
        })}

        {uncategorizedServices.length > 0 && (
          <div className="space-y-2">{uncategorizedServices.map(renderService)}</div>
        )}
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  whatsapp,
  whatsappDefaultMessage,
  businessName,
  primaryColor,
  isBookingEnabled,
  onBook,
  track,
}: {
  service: Service
  whatsapp: string | null
  whatsappDefaultMessage: string
  businessName: string
  primaryColor: string
  isBookingEnabled: boolean
  onBook: (s: Service) => void
  track: (eventType: string, extra?: { serviceId?: string }) => Promise<void>
}) {
  const isProduct = service.type === 'product'

  const priceLabel = (() => {
    if (service.priceType === 'quote' || service.price == null) return 'Cotización'
    if (service.priceType === 'from') return `Desde $${service.price}`
    return `$${service.price}`
  })()

  const handleWhatsApp = () => {
    const msg = buildWhatsAppMessage(businessName, {
      serviceName: service.name,
      price: service.price,
      priceType: service.priceType,
    })
    const url = buildWhatsAppUrl(whatsapp, msg)
    if (url) {
      track('service_click', { serviceId: service.id })
      track('whatsapp_click', { serviceId: service.id })
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleBook = () => {
    track('booking_started', { serviceId: service.id })
    onBook(service)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-border transition-colors"
    >
      {service.imageUrl && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <SafeImage
            src={service.imageUrl}
            alt={service.name}
            fill
            sizes="64px"
            className="object-cover"
            fallbackClassName="w-full h-full"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm leading-tight">{service.name}</h4>
          <span className="font-bold text-sm flex-shrink-0" style={{ color: primaryColor }}>
            {priceLabel}
          </span>
        </div>
        {service.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {service.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2">
            {service.durationMinutes && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDuration(service.durationMinutes)}
              </span>
            )}
            {isProduct && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Producto
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            {!isProduct && isBookingEnabled && service.isBookable && (
              <Button
                size="sm"
                onClick={handleBook}
                style={{ backgroundColor: primaryColor, color: '#fff' }}
                className="h-7 text-xs px-2.5"
              >
                Reservar
              </Button>
            )}
            {whatsapp && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleWhatsApp}
                className="h-7 text-xs px-2.5 border-border hover:bg-muted"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                {isProduct ? 'Pedir' : 'Info'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
