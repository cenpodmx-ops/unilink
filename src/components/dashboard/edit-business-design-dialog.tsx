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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Loader2, Check } from 'lucide-react'
import {
  useUpdateBusiness,
  PRIMARY_COLOR_PRESETS,
  THEMES,
  PRIMARY_BUTTONS,
  type BusinessT,
} from './dashboard-helpers'

type Props = {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function EditBusinessDesignDialog({ business, open, onOpenChange }: Props) {
  const update = useUpdateBusiness(business.slug)
  const [color, setColor] = useState(business.primaryColor)
  const [theme, setTheme] = useState(business.theme)
  const [primaryButton, setPrimaryButton] = useState(business.primaryButton)

  useEffect(() => {
    if (open) {
      setColor(business.primaryColor)
      setTheme(business.theme)
      setPrimaryButton(business.primaryButton)
    }
  }, [open, business])

  const handleSave = () => {
    update.mutate(
      {
        id: business.id,
        data: { primaryColor: color, theme, primaryButton },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar diseño</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Color */}
          <div>
            <Label className="text-xs text-muted-foreground">Color principal</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {PRIMARY_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`relative aspect-square rounded-lg border-2 transition-all ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'border-foreground scale-105'
                      : 'border-transparent hover:border-border'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-12 rounded-md border border-border bg-transparent cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-mono text-sm"
                placeholder="#0F766E"
              />
            </div>
          </div>

          {/* Theme */}
          <div>
            <Label className="text-xs text-muted-foreground">Estilo / Tema</Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                    theme === t.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary button */}
          <div>
            <Label className="text-xs text-muted-foreground">Botón principal</Label>
            <Select value={primaryButton} onValueChange={setPrimaryButton}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_BUTTONS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1.5">
              Es el botón que aparecerá destacado en tu página.
            </p>
          </div>

          {/* Preview chip */}
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground mb-2">Vista previa</div>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {PRIMARY_BUTTONS.find((b) => b.value === primaryButton)?.label || 'Botón'}
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending}
            style={{ backgroundColor: color }}
            className="text-white hover:opacity-90"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Aplicar diseño
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
