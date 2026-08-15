'use client'

import { useCallback, useState } from 'react'

const SESSION_KEY = 'unilink_session'

function generateSessionId(): string {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getOrCreateSession(): string {
  if (typeof window === 'undefined') return ''
  try {
    let s = sessionStorage.getItem(SESSION_KEY)
    if (!s) {
      s = generateSessionId()
      sessionStorage.setItem(SESSION_KEY, s)
    }
    return s
  } catch {
    return 'anon'
  }
}

/**
 * Devuelve un sessionId por navegador (creado al vuelo y persistido).
 * Devuelve '' en SSR y el sessionId real en el cliente.
 */
export function useSessionId(): string {
  const [sessionId, setSessionId] = useState<string>('')

  // Inicializar en el primer render del cliente
  // Usamos useCallback para estabilizar y evitar re-renders innecesarios
  const init = useCallback(() => {
    const sid = getOrCreateSession()
    setSessionId(sid)
  }, [])

  // Ejecutar init solo una vez en el cliente
  if (typeof window !== 'undefined' && !sessionId) {
    init()
  }

  return sessionId
}

export function useAnalytics(businessId: string | undefined) {
  const sessionId = useSessionId()

  const track = useCallback(
    async (eventType: string, extra?: { serviceId?: string; metadata?: Record<string, unknown> }) => {
      if (!businessId) return
      const sid = sessionId || getOrCreateSession()
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            eventType,
            sessionId: sid,
            serviceId: extra?.serviceId,
            metadata: extra?.metadata,
          }),
        })
      } catch {
        // ignore
      }
    },
    [businessId, sessionId],
  )

  return { track, sessionId }
}
