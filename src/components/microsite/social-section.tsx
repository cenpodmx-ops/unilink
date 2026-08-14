'use client'

import { motion } from 'framer-motion'
import { Instagram, Facebook, Youtube, Linkedin, Globe, Music2, Twitter, ExternalLink } from 'lucide-react'
import { SocialLink } from '@prisma/client'
import { SectionTitle } from './hours-section'
import { useAnalytics } from '@/hooks/use-analytics'

interface Props {
  businessId: string
  links: SocialLink[]
  primaryColor: string
}

const PLATFORM_ICONS: Record<string, { icon: typeof Instagram; label: string }> = {
  instagram: { icon: Instagram, label: 'Instagram' },
  facebook: { icon: Facebook, label: 'Facebook' },
  tiktok: { icon: Music2, label: 'TikTok' },
  youtube: { icon: Youtube, label: 'YouTube' },
  x: { icon: Twitter, label: 'X' },
  linkedin: { icon: Linkedin, label: 'LinkedIn' },
  website: { icon: Globe, label: 'Sitio web' },
}

export function SocialSection({ businessId, links, primaryColor }: Props) {
  const { track } = useAnalytics(businessId)

  if (!links.length) return null

  const handleClick = (platform: string) => {
    track(`${platform}_click`)
  }

  return (
    <section id="redes" className="px-4">
      <SectionTitle>
        <span className="inline-flex items-center">
          <span className="mr-2" style={{ color: primaryColor }}>🌐</span>
          Redes sociales
        </span>
      </SectionTitle>

      <div className="grid grid-cols-2 gap-2">
        {links.map((link, i) => {
          const config = PLATFORM_ICONS[link.platform]
          if (!config) return null
          const Icon = config.icon
          return (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleClick(link.platform)}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-border/60 bg-card hover:border-border transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{config.label}</div>
                <div className="text-[10px] text-muted-foreground truncate">@{extractHandle(link.url)}</div>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.a>
          )
        })}
      </div>
    </section>
  )
}

function extractHandle(url: string): string {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[0] || u.hostname.replace('www.', '')
  } catch {
    return url
  }
}
