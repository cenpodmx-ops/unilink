'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al registrar')
      }

      // Login automático
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (signInRes?.error) {
        toast.error('Cuenta creada. Inicia sesión.')
        router.push('/login')
        return
      }
      toast.success('¡Cuenta creada!')
      router.push('/onboarding')
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
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
            <h1 className="text-2xl font-bold tracking-tight text-center">Crea tu cuenta</h1>
            <p className="text-sm text-muted-foreground text-center mt-1 mb-6">
              Empieza a construir tu página gratis
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="pl-9 h-11"
                    required
                    autoFocus
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                    className="pl-9 h-11"
                    required
                    minLength={6}
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
                {loading ? 'Creando...' : 'Crear cuenta'}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground text-center mt-6">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-brand font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Al registrarte aceptas crear tu página en Unilink.
            <br />
            Construye gratis. Publícalas por $399 una sola vez.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
