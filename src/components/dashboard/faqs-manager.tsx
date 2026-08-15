'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Plus, Trash2, Loader2, Pencil, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  useDashboardMutation,
  type BusinessT,
  type FaqT,
} from './dashboard-helpers'

export function FaqsManager({ business }: { business: BusinessT }) {
  const faqs = business.faqs || []
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<FaqT | null>(null)
  const [toDelete, setToDelete] = useState<FaqT | null>(null)

  const deleteMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Pregunta eliminada' },
  )

  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: { id: string; sortOrder?: number; isVisible?: boolean }) => {
      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo actualizar')
      }
      return res.json()
    },
  )

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <HelpCircle className="h-4 w-4" /> Preguntas frecuentes
        </h2>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setDialogOpen(true) }}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Nueva
        </Button>
      </div>

      {faqs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aún no tienes preguntas frecuentes
        </p>
      ) : (
        <div className="space-y-2">
          {faqs.map((f) => (
            <div
              key={f.id}
              className="flex items-start justify-between p-3 rounded-lg border border-border/60 bg-card gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{f.question}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{f.answer}</div>
                {!f.isVisible && (
                  <span className="text-xs text-amber-600">Oculta</span>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={updateMut.isPending} onClick={() => updateMut.mutate({ id: f.id, sortOrder: f.sortOrder - 1 })}>
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={updateMut.isPending} onClick={() => updateMut.mutate({ id: f.id, sortOrder: f.sortOrder + 1 })}>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setEditing(f); setDialogOpen(true) }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600 hover:text-red-700" onClick={() => setToDelete(f)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FaqDialog
        business={business}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta pregunta?</AlertDialogTitle>
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

function FaqDialog({
  business,
  open,
  onOpenChange,
  editing,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: FaqT | null
}) {
  const createMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/faqs', {
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
    { successMessage: 'Pregunta creada' },
  )

  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/faqs', {
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
    { successMessage: 'Pregunta actualizada' },
  )

  const [form, setForm] = useState({
    question: '',
    answer: '',
    isVisible: true,
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          question: editing.question || '',
          answer: editing.answer || '',
          isVisible: editing.isVisible,
        })
      } else {
        setForm({ question: '', answer: '', isVisible: true })
      }
    }
  }, [open, editing])

  const isPending = createMut.isPending || updateMut.isPending

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) return
    const payload: Record<string, unknown> = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      isVisible: form.isVisible,
    }
    if (editing) {
      updateMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar pregunta' : 'Nueva pregunta'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Pregunta *">
            <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Ej: ¿Hacen envíos?" />
          </Field>
          <Field label="Respuesta *">
            <Textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3} placeholder="Sí, hacemos envíos en un radio de 5km..." />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <div className="text-sm font-medium">Visible</div>
              <div className="text-xs text-muted-foreground">Mostrar en tu página pública</div>
            </div>
            <Switch checked={form.isVisible} onCheckedChange={(v) => setForm({ ...form, isVisible: v })} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !form.question.trim() || !form.answer.trim()}
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
