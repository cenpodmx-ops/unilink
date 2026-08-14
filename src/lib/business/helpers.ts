import { Business, BusinessHour } from '@prisma/client'

export type DayName = 'domingo' | 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado'

export const DAY_NAMES: DayName[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
]

export const DAY_LABELS: Record<DayName, string> = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
}

export function getCurrentDayOfWeek(): number {
  // JS getDay() returns 0=Sunday ... 6=Saturday, matches our schema
  return new Date().getDay()
}

type Hour = Pick<BusinessHour, 'dayOfWeek' | 'isOpen' | 'openTime' | 'closeTime'>

export interface OpenStatus {
  isOpen: boolean
  label: string
  detail?: string
}

/**
 * Devuelve el estado de apertura actual del negocio
 * considerando el horario del día actual y el siguiente día abierto.
 */
export function getOpenStatus(
  hours: Hour[],
  now: Date = new Date(),
): OpenStatus {
  if (!hours || hours.length === 0) {
    return { isOpen: false, label: 'Horario no disponible' }
  }

  const currentDay = now.getDay()
  const currentTimeStr = formatTimeStr(now)
  const todayHours = hours.find((h) => h.dayOfWeek === currentDay)

  // Si hoy está abierto y estamos dentro del rango
  if (todayHours?.isOpen) {
    if (currentTimeStr >= todayHours.openTime && currentTimeStr < todayHours.closeTime) {
      return {
        isOpen: true,
        label: 'Abierto ahora',
        detail: `Cierra a las ${formatTime12(todayHours.closeTime)}`,
      }
    }
    // Si todavía no abre hoy
    if (currentTimeStr < todayHours.openTime) {
      return {
        isOpen: false,
        label: 'Cerrado',
        detail: `Abre hoy a las ${formatTime12(todayHours.openTime)}`,
      }
    }
  }

  // Buscar el próximo día abierto
  const nextOpen = findNextOpenDay(hours, currentDay, now)
  if (nextOpen) {
    return {
      isOpen: false,
      label: 'Cerrado',
      detail: `Abre ${nextOpen.dayLabel} a las ${formatTime12(nextOpen.openTime)}`,
    }
  }

  return { isOpen: false, label: 'Cerrado' }
}

function findNextOpenDay(
  hours: Hour[],
  currentDay: number,
  now: Date,
): { dayLabel: string; openTime: string } | null {
  // Si hoy abre más tarde, ya se manejó arriba.
  // Buscamos los siguientes días.
  const todayTimeStr = formatTimeStr(now)
  for (let offset = 0; offset < 8; offset++) {
    const day = (currentDay + offset) % 7
    const h = hours.find((x) => x.dayOfWeek === day)
    if (h?.isOpen) {
      if (offset === 0) {
        // hoy mismo pero más tarde
        if (todayTimeStr < h.openTime) {
          return { dayLabel: 'hoy', openTime: h.openTime }
        }
        continue
      }
      const dayName = DAY_NAMES[day]
      return {
        dayLabel: offset === 1 ? 'mañana' : DAY_LABELS[dayName].toLowerCase(),
        openTime: h.openTime,
      }
    }
  }
  return null
}

function formatTimeStr(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

export function formatTime12(time24: string): string {
  if (!time24 || time24 === '00:00') return '--'
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

/**
 * Formatea un horario del día: "9:00 am – 6:00 pm" o "Cerrado"
 */
export function formatDayHours(h: Hour | undefined): string {
  if (!h || !h.isOpen) return 'Cerrado'
  return `${formatTime12(h.openTime)} – ${formatTime12(h.closeTime)}`
}

// ===================== WhatSapp & Tel =====================

export function buildWhatsAppUrl(
  whatsapp: string | null,
  message: string,
): string | null {
  if (!whatsapp) return null
  const cleanNumber = whatsapp.replace(/\D/g, '')
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppMessage(
  businessName: string,
  context?: { serviceName?: string; price?: string | null; priceType?: string },
): string {
  if (context?.serviceName) {
    const priceStr =
      context.price != null
        ? context.priceType === 'from'
          ? ` desde $${context.price}`
          : context.priceType === 'quote'
            ? ''
            : ` $${context.price}`
        : ''
    return `Hola, vi su servicio "${context.serviceName}"${priceStr} y quisiera información.`
  }
  return `Hola, vi tu página de ${businessName} y quisiera información.`
}

export function buildTelUrl(phone: string | null): string | null {
  if (!phone) return null
  return `tel:${phone.replace(/\s/g, '')}`
}

// ===================== VCF (Guardar contacto) =====================

export function buildVcf(business: {
  name: string
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  address?: string | null
  mapsUrl?: string | null
}): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${business.name}`, `ORG:${business.name}`]
  if (business.phone) lines.push(`TEL;TYPE=WORK,VOICE:${business.phone}`)
  if (business.whatsapp) lines.push(`TEL;TYPE=WA:${business.whatsapp}`)
  if (business.email) lines.push(`EMAIL:${business.email}`)
  if (business.address) lines.push(`ADR:;;${business.address};;;;`)
  if (business.mapsUrl) lines.push(`URL:${business.mapsUrl}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

// ===================== Promociones activas =====================

export function isPromotionActive(
  promo: { startDate: Date; endDate: Date; isActive: boolean },
  now: Date = new Date(),
): boolean {
  if (!promo.isActive) return false
  return now >= promo.startDate && now <= promo.endDate
}

// ===================== Tags & JSON parsing =====================

export function safeParseArray<T = string>(value: unknown): T[] {
  if (!value) return []
  if (Array.isArray(value)) return value as T[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// ===================== Color helpers =====================

/**
 * Convierte un hex a rgba con alpha
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Genera un color secundario más claro basado en el primario
 */
export function getSecondaryColor(primaryHex: string): string {
  return hexToRgba(primaryHex, 0.1)
}
