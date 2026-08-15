'use client'

import { motion } from 'framer-motion'
import { Star, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  googleReviewUrl: string | null
  primaryColor: string
  track: (eventType: string) => Promise<void>
}

export function ReviewsSection({ googleReviewUrl, primaryColor, track }: Props) {
  if (!googleReviewUrl) return null

  const handleClick = () => {
    track('review_click')
    window.open(googleReviewUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section id="resenas" className="px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border/60 bg-card p-4 text-center"
      >
        <div className="flex justify-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="h-5 w-5"
              fill={primaryColor}
              stroke={primaryColor}
            />
          ))}
        </div>
        <p className="font-semibold text-sm mb-1">¿Te gustó nuestro servicio?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Déjanos una reseña en Google. Nos ayuda muchísimo.
        </p>
        <Button
          onClick={handleClick}
          size="sm"
          style={{ backgroundColor: primaryColor, color: '#fff' }}
          className="h-9"
        >
          Dejar reseña
          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </section>
  )
}
