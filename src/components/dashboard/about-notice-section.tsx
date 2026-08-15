'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Loader2, Megaphone, Tag } from 'lucide-react'
import { useUpdateBusiness, parseTags, type BusinessT } from './dashboard-helpers'

export function AboutNoticeSection({ business }: { business: BusinessT }) {
  const update = useUpdateBusiness(business.slug)
  const tags = parseTags(business.tags)
  const [aboutText, setAboutText] = useState(business.aboutText || '')
  const [noticeText, setNoticeText] = useState(business.noticeText || '')
  const [noticeActive, setNoticeActive] = useState(business.noticeActive)
  const [newTag, setNewTag] = useState('')
  const [tagList, setTagList] = useState<string[]>(tags)

  const saveAbout = () => {
    update.mutate({
      id: business.id,
      data: { aboutText: aboutText || null, tags: tagList },
    })
  }

  const saveNotice = () => {
    update.mutate({
      id: business.id,
      data: { noticeText: noticeText || null, noticeActive },
    })
  }

  const toggleNotice = (v: boolean) => {
    setNoticeActive(v)
    update.mutate({
      id: business.id,
      data: { noticeActive: v, noticeText: noticeText || null },
    })
  }

  const addTag = () => {
    const t = newTag.trim()
    if (t && !tagList.includes(t)) {
      setTagList([...tagList, t])
      setNewTag('')
    }
  }

  const removeTag = (t: string) => {
    setTagList(tagList.filter((x) => x !== t))
  }

  return (
    <div className="space-y-5">
      {/* Acerca de */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4" /> Acerca de
          </h2>
        </div>
        <Label className="text-xs text-muted-foreground">Texto acerca del negocio</Label>
        <Textarea
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Cuenta la historia de tu negocio, qué te hace diferente, etc."
          rows={4}
          className="mt-1"
        />

        <div className="mt-4">
          <Label className="text-xs text-muted-foreground">Etiquetas</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Características destacadas (ej: &ldquo;Aceptamos tarjeta&rdquo;, &ldquo;Estacionamiento&rdquo;)
          </p>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Nueva etiqueta"
              className="flex-1"
            />
            <Button type="button" size="sm" variant="outline" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tagList.map((t) => (
                <Badge key={t} variant="secondary" className="pr-1 gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="ml-0.5 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    aria-label={`Quitar ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={saveAbout}
            disabled={update.isPending}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Guardar acerca de
          </Button>
        </div>
      </Card>

      {/* Aviso */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Aviso destacado
          </h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="noticeActive" className="text-xs text-muted-foreground">
              {noticeActive ? 'Activo' : 'Inactivo'}
            </Label>
            <Switch id="noticeActive" checked={noticeActive} onCheckedChange={toggleNotice} disabled={update.isPending} />
          </div>
        </div>
        <Label className="text-xs text-muted-foreground">Texto del aviso</Label>
        <Textarea
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="Ej: ¡Promoción de marzo! 2x1 en manicura los martes"
          rows={2}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Aparece como banner en la parte superior de tu página pública.
        </p>
        <div className="mt-3 flex justify-end">
          <Button onClick={saveNotice} disabled={update.isPending} variant="outline" size="sm">
            {update.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Guardar aviso
          </Button>
        </div>
      </Card>
    </div>
  )
}
