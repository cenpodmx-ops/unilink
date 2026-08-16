import { Metadata } from 'next'
import { db } from '@/lib/db'
import { Microsite } from '@/components/microsite/microsite'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const business = await db.business.findUnique({
    where: { slug },
    select: {
      name: true,
      headline: true,
      description: true,
      logoUrl: true,
      coverUrl: true,
      address: true,
      businessType: true,
      category: true,
    },
  })

  if (!business || business.status === 'deleted') {
    return {
      title: 'Página no encontrada',
      robots: { index: false, follow: false },
    }
  }

  const title = `${business.name} | ${business.headline || 'Unilink'}`
  const description = business.description || `${business.name}: servicios, precios, ubicación y citas en un solo enlace.`

  // Si está en draft, no indexar en buscadores
  const robots = business.status === 'active'
    ? { index: true, follow: true }
    : { index: false, follow: false }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_MX',
      images: business.coverUrl ? [{ url: business.coverUrl }] : business.logoUrl ? [{ url: business.logoUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: business.coverUrl ? [business.coverUrl] : undefined,
    },
    robots,
    other: {
      'business:contact_data:local_business': business.category,
    },
  }
}

export default async function MicrositePage({ params }: Props) {
  const { slug } = await params
  return <Microsite slug={slug} />
}
