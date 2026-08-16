'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Store,
  Sparkles,
  Phone,
  Palette,
  Plus,
  X,
  PartyPopper,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'belleza', label: '💆‍♀️ Belleza', types: ['Barbería', 'Estética', 'Uñas', 'Lashes', 'Maquillaje', 'Spa'] },
  { value: 'salud', label: '🩺 Salud', types: ['Psicólogo', 'Nutriólogo', 'Dentista', 'Fisioterapeuta', 'Médico', 'Podólogo'] },
  { value: 'profesional', label: '⚖️ Profesional', types: ['Abogado', 'Contador', 'Consultor', 'Agente inmobiliario'] },
  { value: 'comida', label: '🧁 Comida', types: ['Repostería', 'Comida', 'Cafetería', 'Postres'] },
  { value: 'automotriz', label: '🔧 Automotriz', types: ['Mecánico', 'Detailing', 'Llantera'] },
  { value: 'hogar', label: '🏠 Hogar', types: ['Electricista', 'Plomero', 'Jardinería'] },
  { value: 'fitness', label: '💪 Fitness', types: ['Entrenador', 'Yoga', 'Pilates'] },
  { value: 'fotografia', label: '📸 Fotografía', types: ['Fotógrafo', 'Videógrafo'] },
  { value: 'comercio', label: '🛍️ Comercio', types: ['Boutique', 'Floristería', 'Tienda'] },
  { value: 'otro', label: '✨ Otro', types: ['Otro'] },
]

const PRESET_COLORS = [
  '#0F766E', '#9333EA', '#DC2626', '#EA580C', '#CA8A04',
  '#16A34A', '#0891B2', '#DB2777', '#4F46E5', '#1F2937',
]

const STEPS = [
  { id: 1, title: 'Tu negocio', desc: '¿Cómo se llama?' },
  { id: 2, title: 'Giro', desc: '¿A qué te dedicas?' },
  { id: 3, title: 'Logo', desc: 'Foto o logo' },
  { id: 4, title: 'Contacto', desc: 'WhatsApp' },
  { id: 5, title: 'Servicios', desc: 'Qué ofreces' },
  { id: 6, title: 'Estilo', desc: 'Color' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    category: '',
    businessType: '',
    headline: '',
    description: '',
    whatsapp: '',
    phone: '',
    email: '',
    primaryColor: PRESET_COLORS[0],
    theme: 'minimal',
    isBookingEnabled: false,
    logoUrl: '',
  })
  const [services, setServices] = useState([
    { id: '1', name: '', price: '', duration: '' },
  ])

  const createMutation = useMutation({
    mutationFn: async () => {
      const validServices = services
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          price: s.price ? parseFloat(s.price) : null,
          priceType: s.price ? 'fixed' : 'quote',
          durationMinutes: s.duration ? parseInt(s.duration) : null,
        }))

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, services: validServices }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al crear')
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('¡Tu página está lista!')
      setStep(7)
      setTimeout(() => router.push(`/dashboard?slug=${data.slug}`), 1500)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setStep(6)
    },
  })

  const next = () => setStep((s) => Math.min(7, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const canProceed = (() => {
    if (step === 1) return form.name.length >= 2
    if (step === 2) return form.category && form.businessType
    if (step === 4) return form.whatsapp.length >= 8
    if (step === 5) return services.some((s) => s.name.trim())
    return true
  })()

  const handleFinish = () => {
    setStep(0)
    createMutation.mutate()
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold text-sm">U</div>
            <span className="font-semibold text-lg tracking-tight">Unilink</span>
          </Link>
          {step > 1 && step <= 6 && (
            <Button variant="ghost" size="sm" onClick={prev}>
              <ArrowLeft className="h-4 w-4 mr-1" />Atrás
            </Button>
          )}
        </div>
      </header>

      {step >= 1 && step <= 6 && (
        <div className="border-b border-border/60 bg-background">
          <div className="mx-auto max-w-4xl px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              {STEPS.map((s) => {
                const isDone = step > s.id
                const isActive = step === s.id
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-brand text-brand-foreground' : isActive ? 'bg-brand text-brand-foreground ring-4 ring-brand/20' : 'bg-muted text-muted-foreground'}`}>
                        {isDone ? <Check className="h-3.5 w-3.5" /> : s.id}
                      </div>
                      <div className="hidden sm:block">
                        <div className={`text-xs font-medium ${isActive || isDone ? 'text-foreground' : 'text-muted-foreground'}`}>{s.title}</div>
                      </div>
                    </div>
                    {s.id < 6 && <div className="flex-1 h-px bg-border/60" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex items-start justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepCard key="s1" icon={<Store className="h-6 w-6" />} title="¿Cómo se llama tu negocio?" desc="Este será el nombre que verán tus clientes.">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del negocio</Label>
                    <Input id="name" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Studio Fernanda" className="mt-1.5 text-lg h-12" onKeyDown={(e) => e.key === 'Enter' && canProceed && next()} />
                  </div>
                  <div>
                    <Label htmlFor="headline">Subtítulo (opcional)</Label>
                    <Input id="headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Ej: Nails & Beauty" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="desc">Descripción corta (opcional)</Label>
                    <Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej: Especialistas en uñas acrílicas, gel y pedicure." className="mt-1.5" rows={3} maxLength={500} />
                  </div>
                </div>
              </StepCard>
            )}
            {step === 2 && (
              <StepCard key="s2" icon={<Sparkles className="h-6 w-6" />} title="¿A qué te dedicas?" desc="Elige la categoría y el tipo de negocio.">
                <div className="space-y-4">
                  <div>
                    <Label>Categoría</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {CATEGORIES.map((c) => (
                        <button key={c.value} onClick={() => setForm({ ...form, category: c.value, businessType: '' })} className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${form.category === c.value ? 'border-brand bg-brand/5 text-brand' : 'border-border hover:border-foreground/30'}`}>{c.label}</button>
                      ))}
                    </div>
                  </div>
                  {form.category && (
                    <div>
                      <Label>Tipo de negocio</Label>
                      <Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.find((c) => c.value === form.category)?.types.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </StepCard>
            )}
            {step === 3 && (
              <StepCard key="s3" icon={<Store className="h-6 w-6" />} title="Logo o foto" desc="Sube una foto o sáltelo por ahora.">
                <div className="space-y-4">
                  <LogoUpload value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} businessName={form.name} primaryColor={form.primaryColor} />
                  <p className="text-xs text-muted-foreground text-center">También puedes subirlo después desde tu panel.</p>
                </div>
              </StepCard>
            )}
            {step === 4 && (
              <StepCard key="s4" icon={<Phone className="h-6 w-6" />} title="Tu WhatsApp" desc="Donde tus clientes te contactarán.">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="wa">Número de WhatsApp</Label>
                    <Input id="wa" autoFocus value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="526621234567" className="mt-1.5 text-lg h-12" />
                    <p className="text-xs text-muted-foreground mt-1.5">Con código de país, sin + ni espacios. Ej: 526621234567</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+52 662 123 4567" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo (opcional)</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hola@minegocio.mx" className="mt-1.5" />
                  </div>
                </div>
              </StepCard>
            )}
            {step === 5 && (
              <StepCard key="s5" icon={<Plus className="h-6 w-6" />} title="Tus servicios" desc="Añade al menos uno. Puedes completar después.">
                <div className="space-y-3">
                  {services.map((s, i) => (
                    <div key={s.id} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <Input value={s.name} onChange={(e) => { const n = [...services]; n[i] = { ...s, name: e.target.value }; setServices(n) }} placeholder="Ej: Corte clásico" autoFocus={i === 0} />
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input value={s.price} onChange={(e) => { const n = [...services]; n[i] = { ...s, price: e.target.value.replace(/[^0-9.]/g, '') }; setServices(n) }} placeholder="250" className="pl-7" />
                          </div>
                          <div className="relative">
                            <Input value={s.duration} onChange={(e) => { const n = [...services]; n[i] = { ...s, duration: e.target.value.replace(/[^0-9]/g, '') }; setServices(n) }} placeholder="45 min" className="pr-10" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">min</span>
                          </div>
                        </div>
                      </div>
                      {services.length > 1 && (<Button variant="ghost" size="icon" onClick={() => setServices(services.filter((x) => x.id !== s.id))} className="mt-1"><X className="h-4 w-4" /></Button>)}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setServices([...services, { id: Date.now().toString(), name: '', price: '', duration: '' }])}>
                    <Plus className="h-4 w-4 mr-1.5" />Añadir otro
                  </Button>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <div className="font-medium text-sm">¿Aceptas citas?</div>
                      <div className="text-xs text-muted-foreground">Activa la agenda si trabajas con reservas.</div>
                    </div>
                    <Switch checked={form.isBookingEnabled} onCheckedChange={(c) => setForm({ ...form, isBookingEnabled: c })} />
                  </div>
                </div>
              </StepCard>
            )}
            {step === 6 && (
              <StepCard key="s6" icon={<Palette className="h-6 w-6" />} title="Tu estilo" desc="Elige el color principal de tu página.">
                <div className="space-y-5">
                  <div>
                    <Label>Color principal</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {PRESET_COLORS.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, primaryColor: c })} className="aspect-square rounded-xl transition-all" style={{ backgroundColor: c, boxShadow: form.primaryColor === c ? `0 0 0 2px ${c}` : 'none', transform: form.primaryColor === c ? 'scale(1.05)' : 'none' }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="custom-color">O un color personalizado</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                      <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Estilo</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {[{ value: 'minimal', label: 'Minimal' }, { value: 'profesional', label: 'Profesional' }, { value: 'bold', label: 'Bold' }, { value: 'elegante', label: 'Elegante' }].map((t) => (
                        <button key={t.value} onClick={() => setForm({ ...form, theme: t.value })} className={`p-3 rounded-xl border text-sm font-medium transition-all ${form.theme === t.value ? 'border-brand bg-brand/5 text-brand' : 'border-border hover:border-foreground/30'}`}>{t.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepCard>
            )}
            {step === 7 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="h-10 w-10 text-brand" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">¡Tu página está lista!</h2>
                <p className="text-muted-foreground mb-6">Redirigiéndote a tu micrositio...</p>
                <Loader2 className="h-5 w-5 animate-spin mx-auto text-brand" />
              </motion.div>
            )}
            {step === 0 && (
              <div className="text-center py-24">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand mb-4" />
                <p className="text-muted-foreground">Creando tu página...</p>
              </div>
            )}
          </AnimatePresence>

          {step >= 1 && step <= 6 && (
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (<Button variant="ghost" onClick={prev}><ArrowLeft className="h-4 w-4 mr-1.5" />Atrás</Button>) : (<div />)}
              {step < 6 ? (
                <Button onClick={next} disabled={!canProceed} className="bg-brand text-brand-foreground hover:bg-brand-600">Continuar<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
              ) : (
                <Button onClick={handleFinish} disabled={createMutation.isPending} className="bg-brand text-brand-foreground hover:bg-brand-600">
                  {createMutation.isPending ? (<><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Creando...</>) : (<>Crear mi página<Check className="h-4 w-4 ml-1.5" /></>)}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StepCard({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function LogoUpload({ value, onChange, businessName, primaryColor }: { value: string; onChange: (url: string) => void; businessName: string; primaryColor: string }) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('businessName', businessName || 'temp')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        onChange(url)
      } else {
        toast.error('No se pudo subir la imagen')
      }
    } catch {
      toast.error('Error al subir')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <label className="cursor-pointer">
        <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-border hover:border-brand flex items-center justify-center bg-muted/30 overflow-hidden transition-all">
          {uploading ? (<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />) : value ? (
            
            <img src={value} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-muted-foreground"><Plus className="h-6 w-6 mx-auto mb-1" /><span className="text-xs">Subir</span></div>
          )}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </label>
      {!value && (
        <div className="mt-3 w-28 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: primaryColor }}>{(businessName || 'A').charAt(0).toUpperCase()}</div>
      )}
    </div>
  )
}
