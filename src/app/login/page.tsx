'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Correo o contraseña incorrectos')
        setLoading(false)
        return
      }
      toast.success('Bienvenido de vuelta')
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm">U</div>
            <span className="font-semibold text-lg tracking-tight">Unilink</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Card className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-center">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground text-center mt-1 mb-6">
              Administra tu página profesional
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="pl-9 h-11"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand-600"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {loading ? 'Entrando...' : 'Iniciar sesión'}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-brand font-medium hover:underline">
                Crear cuenta
              </Link>
            </p>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-4">
            ¿Solo quieres ver el producto?{' '}
            <Link href="/studio-fernanda" className="text-brand hover:underline">
              Ver ejemplo en vivo →
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
