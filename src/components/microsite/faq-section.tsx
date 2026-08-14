'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Faq } from '@prisma/client'
import { SectionTitle } from './hours-section'

interface Props {
  faqs: Faq[]
  primaryColor: string
}

export function FaqSection({ faqs, primaryColor }: Props) {
  if (!faqs.length) return null

  return (
    <section id="faq" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>❓</span>
          Preguntas frecuentes
        </span>
      </SectionTitle>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${i}`}
              className="border-b border-border/60 last:border-b-0"
            >
              <AccordionTrigger className="text-sm font-medium py-3.5 text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-3.5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </section>
  )
}
