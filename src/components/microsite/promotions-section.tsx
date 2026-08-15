'use client'

import { motion } from 'framer-motion'
import { Promotion } from '@prisma/client'
import { format, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { SectionTitle } from './hours-section'
import { SafeImage } from '@/components/shared/safe-image'

interface Props {
  promotions: Promotion[]
  primaryColor: string
}

export function PromotionsSection({ promotions, primaryColor }: Props) {
  const now = new Date()
  const active = promotions.filter((p) =>
    isWithinInterval(now, { start: p.startDate, end: p.endDate }),
  )

  if (active.length === 0) return null

  return (
    <section id="promociones" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>🎉</span>
          Promociones
        </span>
      </SectionTitle>

      <div className="space-y-3">
        {active.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative overflow-hidden rounded-xl border-2"
            style={{ borderColor: `${primaryColor}40` }}
          >
            {promo.imageUrl ? (
              <div className="relative h-32 w-full">
                <SafeImage
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  fallbackClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-base leading-tight">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-white/90 text-xs mt-1 line-clamp-2">{promo.description}</p>
                  )}
                  <p className="text-white/70 text-[10px] mt-1">
                    Válido hasta el {format(promo.endDate, "d 'de' MMMM", { locale: es })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4" style={{ backgroundColor: `${primaryColor}0d` }}>
                <h3 className="font-bold text-base leading-tight" style={{ color: primaryColor }}>
                  {promo.title}
                </h3>
                {promo.description && (
                  <p className="text-muted-foreground text-sm mt-1">{promo.description}</p>
                )}
                <p className="text-muted-foreground text-[10px] mt-2">
                  Válido del {format(promo.startDate, "d 'de' MMMM", { locale: es })} al{' '}
                  {format(promo.endDate, "d 'de' MMMM", { locale: es })}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}
