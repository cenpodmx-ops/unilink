'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Tipos compartidos del dashboard.
 * Nota: no son exhaustivos - solo los campos que usamos para edición.
 */
export type BusinessT = {
  id: string
  name: string
  slug: string
  category: string
  businessType: string | null
  headline: string | null
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  mapsUrl: string | null
  googleReviewUrl: string | null
  primaryColor: string
  theme: string
  typography: string
  primaryButton: string
  isBookingEnabled: boolean
  bookingSlotInterval: number
  bookingMinLead: number
  bookingMaxDays: number
  bookingNote: string | null
  aboutText: string | null
  tags: string // JSON string
  noticeText: string | null
  noticeActive: boolean
  status: string
  createdAt: string
  settings: any
  hours: BusinessHourT[]
  socialLinks: SocialLinkT[]
  serviceCategories: ServiceCategoryT[]
  galleryItems: GalleryItemT[]
  promotions: PromotionT[]
  faqs: FaqT[]
  appointments: AppointmentT[]
}

export type BusinessHourT = {
  id: string
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export type SocialLinkT = {
  id: string
  platform: string
  url: string
}

export type ServiceCategoryT = {
  id: string
  name: string
  sortOrder: number
  isVisible: boolean
  services: ServiceT[]
}

export type ServiceT = {
  id: string
  businessId: string
  categoryId: string | null
  type: string
  name: string
  description: string | null
  imageUrl: string | null
  price: number | null
  priceType: string
  durationMinutes: number | null
  isBookable: boolean
  isVisible: boolean
  sortOrder: number
}

export type GalleryItemT = {
  id: string
  imageUrl: string
  caption: string | null
  sortOrder: number
}

export type PromotionT = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  startDate: string
  endDate: string
  isActive: boolean
}

export type FaqT = {
  id: string
  question: string
  answer: string
  sortOrder: number
  isVisible: boolean
}

export type AppointmentT = {
  id: string
  serviceId: string | null
  service?: { id: string; name: string } | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  date: string
  startTime: string
  endTime: string
  status: string
  notes: string | null
}

export type AppointmentBlockT = {
  id: string
  date: string
  startTime: string
  endTime: string
  allDay: boolean
  reason: string | null
}

// ===================== HOOKS =====================

/**
 * Hook genérico para mutaciones que invalidan el query del dashboard.
 */
export function useDashboardMutation<T, V>(
  slug: string,
  mutationFn: (vars: V) => Promise<T>,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: T, vars: V) => void
  },
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['dashboard', slug] })
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      options?.onSuccess?.(data, vars)
    },
    onError: (err: Error) => {
      toast.error(options?.errorMessage || err.message || 'Error al guardar')
    },
  })
}

/**
 * Hook para actualizar datos del negocio (PUT /api/business/[id]).
 */
export function useUpdateBusiness(slug: string) {
  return useDashboardMutation<{ ok: true; business: any }, { id: string; data: Record<string, unknown> }>(
    slug,
    async ({ id, data }) => {
      const res = await fetch(`/api/business/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo guardar')
      }
      return res.json()
    },
    { successMessage: 'Cambios guardados' },
  )
}

/**
 * Sube un archivo a /api/upload y devuelve la URL pública.
 */
export async function uploadImage(file: File, businessSlug: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('businessName', businessSlug)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'No se pudo subir la imagen')
  }
  const data = await res.json()
  return data.url
}

// ===================== UTILS =====================

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  try {
    const arr = JSON.parse(tags)
    return Array.isArray(arr) ? arr.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 0, label: 'Domingo', short: 'Dom' },
]

export const PRIMARY_COLOR_PRESETS = [
  '#0F766E', // teal (default)
  '#0891B2', // cyan
  '#2563EB', // blue
  '#7C3AED', // violet
  '#C026D3', // fuchsia
  '#DB2777', // pink
  '#DC2626', // red
  '#EA580C', // orange
  '#CA8A04', // yellow
  '#16A34A', // green
  '#0F172A', // slate dark
  '#525252', // neutral
]

export const THEMES = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'bold', label: 'Bold' },
  { value: 'elegante', label: 'Elegante' },
]

export const PRIMARY_BUTTONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Llamar' },
  { value: 'book', label: 'Reservar' },
  { value: 'share', label: 'Compartir' },
]

export const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'website', label: 'Sitio web' },
]

export const PRICE_TYPES = [
  { value: 'fixed', label: 'Precio fijo' },
  { value: 'from', label: 'Desde $X' },
  { value: 'quote', label: 'Cotización' },
]

export const SERVICE_TYPES = [
  { value: 'service', label: 'Servicio' },
  { value: 'product', label: 'Producto' },
]

export const APPOINTMENT_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  { value: 'confirmed', label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  { value: 'completed', label: 'Completada', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  { value: 'no_show', label: 'No asistió', color: 'bg-gray-100 text-gray-700' },
]
