'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from './hours-section'

interface Props {
  text: string | null
  tags: string[]
  primaryColor: string
}

export function AboutSection({ text, tags, primaryColor }: Props) {
  if (!text && tags.length === 0) return null

  return (
    <section id="acerca" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>ℹ️</span>
          Sobre nosotros
        </span>
      </SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border/60 bg-card p-4"
      >
        {text && (
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
            {text}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${primaryColor}14`,
                  color: primaryColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
