'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Trash2, Loader2, Image as ImageIcon, Upload, Pencil } from 'lucide-react'
import {
  useDashboardMutation,
  uploadImage,
  type BusinessT,
  type GalleryItemT,
} from './dashboard-helpers'

export function GalleryManager({ business }: { business: BusinessT }) {
  const items = business.galleryItems || []
  const [uploading, setUploading] = useState(false)
  const [editingCaption, setEditingCaption] = useState<GalleryItemT | null>(null)
  const [toDelete, setToDelete] = useState<GalleryItemT | null>(null)

  const createMut = useDashboardMutation(
    business.slug,
    async (vars: { imageUrl: string; caption?: string }) => {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, ...vars }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo agregar')
      }
      return res.json()
    },
    { successMessage: 'Imagen agregada' },
  )

  const deleteMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Imagen eliminada' },
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadImage(file, business.slug)
      createMut.mutate({ imageUrl: url })
    } catch {
      // silent
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Galería</h2>
        <label className="cursor-pointer">
          <Button
            asChild
            size="sm"
            disabled={uploading}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            <span>
              {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
              Subir foto
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Tu galería está vacía. Sube tu primera foto.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
              <img src={item.imageUrl} alt={item.caption || ''} className="w-full h-full object-cover" />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs">
                  {item.caption}
                </div>
              )}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setEditingCaption(item)}
                  className="bg-background/90 hover:bg-background rounded p-1 shadow"
                  aria-label="Editar descripción"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(item)}
                  className="bg-background/90 hover:bg-background text-red-600 rounded p-1 shadow"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Caption dialog */}
      <CaptionDialog
        business={business}
        item={editingCaption}
        open={!!editingCaption}
        onOpenChange={(v) => !v && setEditingCaption(null)}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta foto?</AlertDialogTitle>
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
    </div>
  )
}

function CaptionDialog({
  business,
  item,
  open,
  onOpenChange,
}: {
  business: BusinessT
  item: GalleryItemT | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: { caption?: string }) => {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item?.id, ...vars }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo actualizar')
      }
      return res.json()
    },
    { successMessage: 'Descripción actualizada' },
  )

  const [caption, setCaption] = useState('')

  useEffect(() => {
    if (item) setCaption(item.caption || '')
  }, [item])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar descripción</DialogTitle>
        </DialogHeader>
        {item && (
          
          <img src={item.imageUrl} alt={item.caption || ''} className="w-full h-40 object-cover rounded-lg" />
        )}
        <Field label="Descripción (opcional)">
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Ej: Manicura semipermanente rojo"
            autoFocus
          />
        </Field>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMut.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              updateMut.mutate(
                { caption: caption.trim() || undefined },
                { onSuccess: () => onOpenChange(false) },
              )
            }}
            disabled={updateMut.isPending}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {updateMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Guardar
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
