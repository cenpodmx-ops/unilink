'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { GalleryItem } from '@prisma/client'
import { SectionTitle } from './hours-section'
import { SafeImage } from '@/components/shared/safe-image'

interface Props {
  items: GalleryItem[]
  primaryColor: string
}

export function GallerySection({ items, primaryColor }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!items.length) return null

  return (
    <section id="galeria" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>📸</span>
          Galería
        </span>
      </SectionTitle>

      <div className="grid grid-cols-3 gap-1.5">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: (i % 6) * 0.05 }}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
          >
            {item.imageUrl ? (
              <SafeImage
                src={item.imageUrl}
                alt={item.caption || `Foto ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover transition-transform group-hover:scale-105"
                fallbackClassName="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                Sin foto
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((i) => (i === null ? 0 : (i - 1 + items.length) % items.length))
          }
          onNext={() =>
            setLightboxIndex((i) => (i === null ? 0 : (i + 1) % items.length))
          }
        />
      )}
    </section>
  )
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const item = items[index]
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            className="absolute left-2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-2 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="relative w-full max-w-md aspect-square" onClick={(e) => e.stopPropagation()}>
        {item.imageUrl ? (
          <SafeImage
            src={item.imageUrl}
            alt={item.caption || ''}
            fill
            sizes="100vw"
            className="object-contain"
            fallbackClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50">
            Sin imagen
          </div>
        )}
        {item.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white text-sm">
            {item.caption}
          </div>
        )}
      </div>
    </div>
  )
}
