'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Loader2, Pencil, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  useDashboardMutation,
  type BusinessT,
  type PromotionT,
} from './dashboard-helpers'

export function PromotionsManager({ business }: { business: BusinessT }) {
  const promotions = business.promotions || []
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PromotionT | null>(null)
  const [toDelete, setToDelete] = useState<PromotionT | null>(null)

  const deleteMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/promotions?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Promoción eliminada' },
  )

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4" /> Promociones
        </h2>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Nueva
        </Button>
      </div>

      {promotions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No tienes promociones activas
        </p>
      ) : (
        <div className="space-y-2">
          {promotions.map((p) => {
            const now = new Date()
            const start = new Date(p.startDate)
            const end = new Date(p.endDate)
            const isFuture = start > now
            const isPast = end < now
            return (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{p.title}</div>
                    {!p.isActive && <Badge variant="outline" className="text-xs">Inactiva</Badge>}
                    {isFuture && <Badge variant="secondary" className="text-xs">Próximamente</Badge>}
                    {isPast && <Badge variant="outline" className="text-xs text-muted-foreground">Finalizada</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(start, 'd MMM', { locale: es })} – {format(end, 'd MMM, yyyy', { locale: es })}
                  </div>
                  {p.description && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{p.description}</div>
                  )}
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(p); setDialogOpen(true) }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => setToDelete(p)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <PromotionDialog
        business={business}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMut.isPending}
              onClick={() => {
                if (!toDelete) return
                deleteMut.mutate(toDelete.id)
                setToDelete(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function PromotionDialog({
  business,
  open,
  onOpenChange,
  editing,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: PromotionT | null
}) {
  const createMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, ...vars }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo crear')
      }
      return res.json()
    },
    { successMessage: 'Promoción creada' },
  )

  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing?.id, ...vars }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo actualizar')
      }
      return res.json()
    },
    { successMessage: 'Promoción actualizada' },
  )

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    isActive: true,
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          title: editing.title || '',
          description: editing.description || '',
          imageUrl: editing.imageUrl || '',
          startDate: format(new Date(editing.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(editing.endDate), 'yyyy-MM-dd'),
          isActive: editing.isActive,
        })
      } else {
        setForm({
          title: '',
          description: '',
          imageUrl: '',
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          isActive: true,
        })
      }
    }
  }, [open, editing])

  const isPending = createMut.isPending || updateMut.isPending

  const handleSave = () => {
    if (!form.title.trim()) return
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      isActive: form.isActive,
    }
    if (editing) {
      updateMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar promoción' : 'Nueva promoción'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Título *">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: 2x1 en manicura" />
          </Field>
          <Field label="Descripción">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </Field>
          <Field label="URL de imagen">
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Inicio">
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </Field>
            <Field label="Fin">
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <div className="text-sm font-medium">Activa</div>
              <div className="text-xs text-muted-foreground">Visible en tu página</div>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !form.title.trim()}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {editing ? 'Guardar' : 'Crear'}
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
