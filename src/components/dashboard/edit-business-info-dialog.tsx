'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useUpdateBusiness, type BusinessT } from './dashboard-helpers'

type Props = {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EditBusinessInfoDialog({ business, open, onOpenChange }: Props) {
  const update = useUpdateBusiness(business.slug)
  const [form, setForm] = useState({
    name: '',
    headline: '',
    description: '',
    businessType: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    mapsUrl: '',
    googleReviewUrl: '',
  })

  // Cargar datos cuando se abre el dialog
  useEffect(() => {
    if (open) {
      setForm({
        name: business.name || '',
        headline: business.headline || '',
        description: business.description || '',
        businessType: business.businessType || '',
        phone: business.phone || '',
        whatsapp: business.whatsapp || '',
        email: business.email || '',
        address: business.address || '',
        mapsUrl: business.mapsUrl || '',
        googleReviewUrl: business.googleReviewUrl || '',
      })
    }
  }, [open, business])

  const handleSave = () => {
    if (!form.name.trim()) return
    update.mutate(
      {
        id: business.id,
        data: {
          name: form.name.trim(),
          headline: form.headline || null,
          description: form.description || null,
          businessType: form.businessType || null,
          phone: form.phone || null,
          whatsapp: form.whatsapp || null,
          email: form.email || null,
          address: form.address || null,
          mapsUrl: form.mapsUrl || null,
          googleReviewUrl: form.googleReviewUrl || null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar información</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Field label="Nombre del negocio *">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Studio Fernanda"
            />
          </Field>

          <Field label="Subtítulo / Headline">
            <Input
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="Ej: Nails & Beauty"
            />
          </Field>

          <Field label="Tipo de negocio">
            <Input
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              placeholder="Ej: Estética, Barbería, Restaurante"
            />
          </Field>

          <Field label="Descripción">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Cuenta brevemente qué ofreces"
              rows={3}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp">
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="521234567890"
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="1234567890"
              />
            </Field>
          </div>

          <Field label="Correo electrónico">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="hola@minegocio.com"
            />
          </Field>

          <Field label="Dirección">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Calle #123, Colonia, Ciudad"
            />
          </Field>

          <Field label="URL de Google Maps">
            <Input
              value={form.mapsUrl}
              onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </Field>

          <Field label="URL de Reseñas de Google">
            <Input
              value={form.googleReviewUrl}
              onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
              placeholder="https://g.page/..."
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending || !form.name.trim()}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
