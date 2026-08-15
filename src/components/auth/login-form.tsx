'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/dashboard'
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) return
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (res?.error) {
        toast.error('Correo o contraseña incorrectos')
      } else if (res?.ok) {
        toast.success('¡Bienvenido!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-md px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm">U</div>
            <span className="font-semibold text-lg tracking-tight">Unilink</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold tracking-tight">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">Accede a tu panel para gestionar tu página</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com"
                  className="pl-10"
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
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand-600"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Entrando...</>
              ) : (
                <>Iniciar sesión<ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-brand font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/60">
            <p className="text-xs text-muted-foreground mb-2 font-medium">💡 Para probar:</p>
            <p className="text-xs text-muted-foreground">Crea una cuenta nueva en el botón de arriba, o usa las credenciales demo si existen.</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
