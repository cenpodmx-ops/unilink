import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function fileExists(p: string) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpiar datos existentes
  await prisma.analyticsEvent.deleteMany()
  await prisma.appointmentBlock.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.faq.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.galleryItem.deleteMany()
  await prisma.service.deleteMany()
  await prisma.serviceCategory.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.businessHour.deleteMany()
  await prisma.businessSetting.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // === Crear usuario dueño ===
  const passwordHash = await bcrypt.hash('demo1234', 10)
  const owner = await prisma.user.create({
    data: {
      email: 'fernanda@studiofernanda.mx',
      name: 'Fernanda López',
      passwordHash,
    },
  })

  // === Crear negocio: Studio Fernanda ===
  const logoPath = '/businesses/studio-fernanda/logo/logo.png'
  const coverPath = '/businesses/studio-fernanda/cover/cover.png'

  const business = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: 'Studio Fernanda',
      slug: 'studio-fernanda',
      category: 'belleza',
      businessType: 'Nails & Beauty',
      headline: 'Nails & Beauty',
      description:
        'Especialistas en uñas acrílicas, gel, manicure y pedicure. Ambiente relajado y resultados de calidad profesional.',
      logoUrl: logoPath,
      coverUrl: coverPath,
      phone: '+52 662 123 4567',
      whatsapp: '526621234567',
      email: 'hola@studiofernanda.mx',
      address: 'Av. Obregón 456, Col. Centro, Hermosillo, Sonora',
      mapsUrl: 'https://maps.google.com/?q=Hermosillo+Sonora',
      googleReviewUrl: 'https://g.page/r/studiofernanda/review',
      primaryColor: '#0F766E',
      theme: 'elegante',
      typography: 'elegante',
      isBookingEnabled: true,
      bookingNote: 'Confirma tu cita en segundos. Te esperamos.',
      status: 'active',
      primaryButton: 'book',
      tags: JSON.stringify([
        'Aceptamos tarjeta',
        'Estacionamiento',
        'Solo con cita',
        'Pet friendly',
        'Sanitización profunda',
      ]),
      aboutText:
        'Studio Fernanda nació en 2019 como un pequeño espacio dedicado al cuidado de uñas. Hoy somos un equipo de 3 especialistas certificadas, apasionadas por crear experiencias de belleza personalizadas. Usamos productos premium y estrictos protocolos de higiene.',
      noticeText: '¡Promoción especial de agosto! 20% de descuento en todos los servicios de uñas acrílicas.',
      noticeActive: true,
      sectionOrder: JSON.stringify([
        'services',
        'gallery',
        'promotions',
        'about',
        'hours',
        'location',
        'reviews',
        'faq',
      ]),
      bookingSlotInterval: 30,
      bookingMinLead: 60,
      bookingMaxDays: 30,
      visibleButtons: JSON.stringify([
        'whatsapp',
        'call',
        'location',
        'instagram',
        'share',
        'saveContact',
      ]),
    },
  })

  // === Settings ===
  await prisma.businessSetting.create({
    data: {
      businessId: business.id,
      showHeader: true,
      showServices: true,
      showGallery: true,
      showPromotions: true,
      showHours: true,
      showLocation: true,
      showSocial: true,
      showReviews: true,
      showFaq: true,
      showAbout: true,
      showNotice: true,
    },
  })

  // === Horarios ===
  const hours = [
    { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' }, // Domingo
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Lunes
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
    { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' }, // Sábado
  ]
  for (const h of hours) {
    await prisma.businessHour.create({
      data: { businessId: business.id, ...h },
    })
  }

  // === Redes sociales ===
  const socials = [
    { platform: 'instagram', url: 'https://instagram.com/studiofernanda' },
    { platform: 'facebook', url: 'https://facebook.com/studiofernanda' },
    { platform: 'tiktok', url: 'https://tiktok.com/@studiofernanda' },
  ]
  for (const s of socials) {
    await prisma.socialLink.create({
      data: { businessId: business.id, ...s },
    })
  }

  // === Categorías de servicios ===
  const catManicura = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: 'Manicure', sortOrder: 0, isVisible: true },
  })
  const catPedicure = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: 'Pedicure', sortOrder: 1, isVisible: true },
  })
  const catProductos = await prisma.serviceCategory.create({
    data: { businessId: business.id, name: 'Productos', sortOrder: 2, isVisible: true },
  })

  // === Servicios ===
  const services = [
    {
      name: 'Manicure clásica',
      description: 'Limpieza, corte, limado y esmaltado tradicional.',
      price: 250,
      priceType: 'fixed',
      durationMinutes: 45,
      isBookable: true,
      type: 'service',
      categoryId: catManicura.id,
      imageUrl: '/businesses/studio-fernanda/services/s1.png',
    },
    {
      name: 'Uñas acrílicas',
      description: 'Extensión y sculpting en acrílico. Diseño personalizado.',
      price: 600,
      priceType: 'from',
      durationMinutes: 90,
      isBookable: true,
      type: 'service',
      categoryId: catManicura.id,
      imageUrl: '/businesses/studio-fernanda/services/s3.png',
    },
    {
      name: 'Esmalte en gel',
      description: 'Esmaltado semipermanente de larga duración (hasta 3 semanas).',
      price: 350,
      priceType: 'fixed',
      durationMinutes: 60,
      isBookable: true,
      type: 'service',
      categoryId: catManicura.id,
      imageUrl: null,
    },
    {
      name: 'Diseño artístico',
      description: 'Diseños personalizados, decoración con cristales, foils y técnicas mixtas.',
      price: 200,
      priceType: 'from',
      durationMinutes: 60,
      isBookable: true,
      type: 'service',
      categoryId: catManicura.id,
      imageUrl: '/businesses/studio-fernanda/gallery/g5.png',
    },
    {
      name: 'Pedicure spa',
      description: 'Tratamiento completo: remojo, exfoliación, masaje y esmaltado.',
      price: 450,
      priceType: 'fixed',
      durationMinutes: 60,
      isBookable: true,
      type: 'service',
      categoryId: catPedicure.id,
      imageUrl: '/businesses/studio-fernanda/services/s2.png',
    },
    {
      name: 'Pedicure clínico',
      description: 'Cuidado especializado de pies. Ideal para problemas de cutícula y durezas.',
      price: 600,
      priceType: 'fixed',
      durationMinutes: 75,
      isBookable: true,
      type: 'service',
      categoryId: catPedicure.id,
      imageUrl: '/businesses/studio-fernanda/gallery/g4.png',
    },
    // Productos
    {
      name: 'Shampoo dermatológico',
      description: 'Para cuero cabelludo sensible. 250 ml.',
      price: 280,
      priceType: 'fixed',
      durationMinutes: null,
      isBookable: false,
      type: 'product',
      categoryId: catProductos.id,
      imageUrl: null,
    },
    {
      name: 'Aceite para cutículas',
      description: 'Tratamiento nutritivo con vitamina E. 15 ml.',
      price: 180,
      priceType: 'fixed',
      durationMinutes: null,
      isBookable: false,
      type: 'product',
      categoryId: catProductos.id,
      imageUrl: null,
    },
  ]
  const createdServices: { id: string }[] = []
  for (let i = 0; i < services.length; i++) {
    const s = await prisma.service.create({
      data: { businessId: business.id, sortOrder: i, isVisible: true, ...services[i] },
    })
    createdServices.push(s)
  }

  // === Galería ===
  const galleryImages = [
    { url: '/businesses/studio-fernanda/gallery/g1.png', caption: 'Acrílicas nude rosa' },
    { url: '/businesses/studio-fernanda/gallery/g2.png', caption: 'Rojo con glitter' },
    { url: '/businesses/studio-fernanda/gallery/g3.png', caption: 'Francesa moderna' },
    { url: '/businesses/studio-fernanda/gallery/g4.png', caption: 'Pedicure rosa' },
    { url: '/businesses/studio-fernanda/gallery/g5.png', caption: 'Pastel floral' },
    { url: '/businesses/studio-fernanda/gallery/g6.png', caption: 'Negro y oro' },
  ]
  for (let i = 0; i < galleryImages.length; i++) {
    const g = galleryImages[i]
    await prisma.galleryItem.create({
      data: {
        businessId: business.id,
        imageUrl: g.url,
        caption: g.caption,
        sortOrder: i,
      },
    })
  }

  // === Promociones ===
  const now = new Date()
  await prisma.promotion.create({
    data: {
      businessId: business.id,
      title: '20% de descuento en uñas acrílicas',
      description: 'Durante todo agosto en servicios seleccionados. Menciona este aviso al reservar.',
      imageUrl: '/businesses/studio-fernanda/gallery/g5.png',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59),
      isActive: true,
    },
  })
  await prisma.promotion.create({
    data: {
      businessId: business.id,
      title: 'Promo primer visitante',
      description: 'Tu primera manicura clásica + diseño por $299. Solo nuevos clientes.',
      imageUrl: null,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59),
      isActive: true,
    },
  })

  // === FAQ ===
  const faqs = [
    { q: '¿Necesito cita?', a: 'Sí, trabajamos exclusivamente con cita previa para brindarte atención personalizada.' },
    { q: '¿Aceptan tarjeta?', a: 'Sí, aceptamos Visa, Mastercard y transferencias.' },
    { q: '¿Dónde están ubicados?', a: 'En Av. Obregón 456, Colonia Centro, Hermosillo, Sonora.' },
    { q: '¿Tienen estacionamiento?', a: 'Sí, contamos con estacionamiento por la parte posterior.' },
    { q: '¿Cuánto dura una sesión de uñas acrílicas?', a: 'Entre 90 y 120 minutos dependiendo del diseño.' },
  ]
  for (let i = 0; i < faqs.length; i++) {
    await prisma.faq.create({
      data: { businessId: business.id, question: faqs[i].q, answer: faqs[i].a, sortOrder: i, isVisible: true },
    })
  }

  // === Citas de ejemplo (hoy) ===
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sampleAppointments = [
    { name: 'Ana García', phone: '+52 662 111 2222', time: '10:00', end: '10:45', serviceIdx: 0, status: 'confirmed' },
    { name: 'Carlos Méndez', phone: '+52 662 333 4444', time: '11:00', end: '12:30', serviceIdx: 1, status: 'confirmed' },
    { name: 'Luis Ramírez', phone: '+52 662 555 6666', time: '13:30', end: '14:15', serviceIdx: 0, status: 'pending' },
  ]
  for (const appt of sampleAppointments) {
    await prisma.appointment.create({
      data: {
        businessId: business.id,
        serviceId: createdServices[appt.serviceIdx].id,
        customerName: appt.name,
        customerPhone: appt.phone,
        customerEmail: null,
        date: today,
        startTime: appt.time,
        endTime: appt.end,
        status: appt.status,
      },
    })
  }

  // === Analytics de ejemplo ===
  const sessionId = 'seed-session'
  const eventTypes = [
    'page_view', 'page_view', 'page_view', 'page_view',
    'whatsapp_click', 'whatsapp_click', 'whatsapp_click',
    'maps_click', 'maps_click',
    'instagram_click', 'instagram_click',
    'service_click', 'service_click', 'service_click',
    'booking_started', 'booking_completed',
    'share_click',
    'save_contact_click',
  ]
  for (let i = 0; i < eventTypes.length; i++) {
    const daysAgo = Math.floor(Math.random() * 14)
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    await prisma.analyticsEvent.create({
      data: {
        businessId: business.id,
        eventType: eventTypes[i],
        serviceId: eventTypes[i] === 'service_click' ? createdServices[i % createdServices.length].id : null,
        sessionId,
        createdAt: d,
      },
    })
  }

  console.log('✅ Seed completado!')
  console.log(`   Negocio: ${business.name} (slug: ${business.slug})`)
  console.log(`   Servicios: ${createdServices.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
