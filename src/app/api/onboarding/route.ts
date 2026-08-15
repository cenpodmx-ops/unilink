import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export const dynamic = 'force-dynamic'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'mi-negocio'
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}${suffix}`
    const exists = await db.business.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!exists) return candidate
    suffix++
  }
}

const OnboardingSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.string(),
  businessType: z.string().optional(),
  headline: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
  whatsapp: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  primaryColor: z.string().default('#0F766E'),
  theme: z.string().default('minimal'),
  isBookingEnabled: z.boolean().default(false),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  services: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().nullish(),
        priceType: z.string().default('fixed'),
        durationMinutes: z.number().nullish(),
      }),
    )
    .default([]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = OnboardingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid payload', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const data = parsed.data

    // Requiere usuario autenticado
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const owner = await db.user.findUnique({
      where: { id: currentUser.id },
    })
    if (!owner) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 })
    }

    const slug = await uniqueSlug(slugify(data.name))

    const business = await db.business.create({
      data: {
        ownerId: owner.id,
        name: data.name,
        slug,
        category: data.category,
        businessType: data.businessType || null,
        headline: data.headline || null,
        description: data.description || null,
        whatsapp: data.whatsapp || null,
        phone: data.phone || null,
        email: data.email || null,
        primaryColor: data.primaryColor,
        theme: data.theme,
        isBookingEnabled: data.isBookingEnabled,
        logoUrl: data.logoUrl || null,
        coverUrl: data.coverUrl || null,
        status: 'draft',
      },
    })

    await db.businessSetting.create({
      data: { businessId: business.id },
    })

    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
    ]
    for (const h of defaultHours) {
      await db.businessHour.create({
        data: { businessId: business.id, ...h },
      })
    }

    if (data.services.length > 0) {
      const cat = await db.serviceCategory.create({
        data: { businessId: business.id, name: 'Servicios', sortOrder: 0, isVisible: true },
      })
      for (let i = 0; i < data.services.length; i++) {
        const s = data.services[i]
        await db.service.create({
          data: {
            businessId: business.id,
            categoryId: cat.id,
            name: s.name,
            price: s.price ?? null,
            priceType: s.priceType,
            durationMinutes: s.durationMinutes ?? null,
            type: 'service',
            isBookable: data.isBookingEnabled,
            isVisible: true,
            sortOrder: i,
          },
        })
      }
    }

    return NextResponse.json({ ok: true, slug, businessId: business.id })
  } catch (error) {
    console.error('[api/onboarding] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
