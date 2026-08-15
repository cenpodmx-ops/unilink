'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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
import { Plus, Trash2, Loader2, Link as LinkIcon, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboardMutation, SOCIAL_PLATFORMS, type BusinessT } from './dashboard-helpers'

export function SocialLinksManager({ business }: { business: BusinessT }) {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState('instagram')
  const [url, setUrl] = useState('')
  const [toDelete, setToDelete] = useState<string | null>(null)

  const links = business.socialLinks || []

  const createMut = useDashboardMutation(
    business.slug,
    async (vars: { businessId: string; platform: string; url: string }) => {
      const res = await fetch('/api/socials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo agregar')
      }
      return res.json()
    },
    { successMessage: 'Red social agregada' },
  )

  const deleteMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/socials?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Red social eliminada' },
  )

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error('Pega una URL válida')
      return
    }
    createMut.mutate(
      { businessId: business.id, platform, url: url.trim() },
      {
        onSuccess: () => {
          setOpen(false)
          setUrl('')
          setPlatform('instagram')
        },
      },
    )
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Share2 className="h-4 w-4" /> Redes sociales
        </h2>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
          Aún no agregas redes sociales.
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const platformLabel =
              SOCIAL_PLATFORMS.find((p) => p.value === link.platform)?.label ||
              link.platform
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{platformLabel}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {link.url}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8"
                  onClick={() => setToDelete(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar red social</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://instagram.com/minegocio"
                className="mt-1"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMut.isPending || !url.trim()}
              style={{ backgroundColor: business.primaryColor }}
              className="text-white hover:opacity-90"
            >
              {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar red social?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (toDelete) {
                  deleteMut.mutate(toDelete)
                  setToDelete(null)
                }
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
