'use client'

import { motion } from 'framer-motion'
import { MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionTitle } from './hours-section'

interface Props {
  address: string | null
  mapsUrl: string | null
  primaryColor: string
  track: (eventType: string) => Promise<void>
}

export function LocationSection({ address, mapsUrl, primaryColor, track }: Props) {
  if (!address) return null

  const handleMaps = () => {
    track('maps_click')
    if (mapsUrl) {
      window.open(mapsUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  return (
    <section id="ubicacion" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <MapPin className="mr-2 h-5 w-5" style={{ color: primaryColor }} />
          Ubicación
        </span>
      </SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border/60 bg-card p-4"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}
          >
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed">{address}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMaps}
              className="mt-3 h-8 text-xs"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Cómo llegar
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
