'use client'

import { motion } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

interface Props {
  text: string
  primaryColor: string
}

export function NoticeBanner({ text, primaryColor }: Props) {
  if (!text) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="px-4"
    >
      <div
        className="flex items-start gap-2.5 p-3 rounded-xl text-sm"
        style={{
          backgroundColor: `${primaryColor}14`,
          border: `1px solid ${primaryColor}40`,
        }}
      >
        <AlertTriangle
          className="h-4 w-4 flex-shrink-0 mt-0.5"
          style={{ color: primaryColor }}
        />
        <p className="flex-1 leading-relaxed" style={{ color: primaryColor }}>
          {text}
        </p>
      </div>
    </motion.div>
  )
}
