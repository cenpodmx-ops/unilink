'use client'

import { SessionProvider } from 'next-auth/react'
import { Providers as RootProviders } from './providers'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RootProviders>{children}</RootProviders>
    </SessionProvider>
  )
}
