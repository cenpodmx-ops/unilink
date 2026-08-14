'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { BusinessHour } from '@prisma/client'
import {
  DAY_LABELS,
  formatDayHours,
  getOpenStatus,
  OpenStatus,
} from '@/lib/business/helpers'

interface Props {
  hours: BusinessHour[]
  primaryColor: string
}

export function HoursSection({ hours, primaryColor }: Props) {
  const [open, setOpen] = useState(false)
  const status: OpenStatus = getOpenStatus(hours)
  const today = new Date().getDay()

  return (
    <section id="horarios" className="px-4">
      <SectionTitle icon={<Clock className="h-5 w-5" style={{ color: primaryColor }} />}>
        Horarios
      </SectionTitle>

      <Card className="overflow-hidden border-border/60">
        {/* Estado */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: status.isOpen ? '#22c55e' : '#ef4444' }}
            />
            <div>
              <div className="font-semibold text-sm">{status.label}</div>
              {status.detail && (
                <div className="text-xs text-muted-foreground">{status.detail}</div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de horarios */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/60 text-sm text-muted-foreground hover:bg-muted/40 transition-colors">
              <span>Ver todos los horarios</span>
              <ChevronDown
                className="h-4 w-4 transition-transform"
                style={{ transform: open ? 'rotate(180deg)' : 'none' }}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 py-2 border-t border-border/60">
              {DAY_LABELS &&
                Object.entries(DAY_LABELS).map(([key, label]) => {
                  const dayIndex = Number(
                    Object.keys(DAY_LABELS).indexOf(key),
                  )
                  const h = hours.find((x) => x.dayOfWeek === dayIndex)
                  const isToday = dayIndex === today
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span
                        className={isToday ? 'font-semibold' : 'text-muted-foreground'}
                      >
                        {label} {isToday && <span className="text-xs ml-1" style={{ color: primaryColor }}>· hoy</span>}
                      </span>
                      <span className={isToday ? 'font-medium' : 'text-muted-foreground'}>
                        {formatDayHours(h)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </section>
  )
}

export function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-2 mb-3"
    >
      {icon}
      <h2 className="text-lg font-bold tracking-tight">{children}</h2>
    </motion.div>
  )
}
