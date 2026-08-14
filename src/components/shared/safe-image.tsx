'use client'

import { useState } from 'react'

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
  className?: string
  fallback?: React.ReactNode
  fallbackClassName?: string
}

/**
 * Imagen con fallback elegante si falla la carga.
 * Usa <img> nativo para detectar errores de carga de forma confiable.
 * Usa key={src} para resetear el estado de error automáticamente cuando cambia src.
 */
export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes: _sizes,
  priority: _priority,
  className,
  fallback,
  fallbackClassName,
}: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${fallbackClassName || ''} ${className || ''}`}
        style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
      >
        {fallback ?? (
          <svg
            className="h-1/4 w-1/4 text-muted-foreground/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 3.75v16.5a.75.75 0 0 0 .75.75h14.5a.75.75 0 0 0 .75-.75V3.75M3.75 3.75h16.5M3.75 3.75H3m18 0h-.75M6 6.75h.008v.008H6V6.75Z"
            />
          </svg>
        )}
      </div>
    )
  }

  if (fill) {
    return (
      <img
        key={src}
        src={src}
        alt={alt}
        onError={() => setError(true)}
        className={className}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        loading="eager"
      />
    )
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={className}
      width={width}
      height={height}
      loading="lazy"
    />
  )
}
