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
import {
  Plus,
  Trash2,
  Loader2,
  Tag,
  Pencil,
  ChevronUp,
  ChevronDown,
  Folder,
} from 'lucide-react'
import {
  useDashboardMutation,
  uploadImage,
  PRICE_TYPES,
  SERVICE_TYPES,
  type BusinessT,
  type ServiceT,
  type ServiceCategoryT,
} from './dashboard-helpers'

export function ServicesManager({ business }: { business: BusinessT }) {
  const categories = business.serviceCategories || []

  const [serviceDialog, setServiceDialog] = useState(false)
  const [editingService, setEditingService] = useState<ServiceT | null>(null)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryT | null>(null)
  const [deleteService, setDeleteService] = useState<ServiceT | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<ServiceCategoryT | null>(null)

  // Mutaciones de eliminación
  const deleteServiceMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Servicio eliminado' },
  )

  const deleteCategoryMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/services/categories?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Categoría eliminada' },
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold">Servicios y productos</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setCategoryDialog(true) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Categoría
          </Button>
          <Button
            size="sm"
            onClick={() => { setEditingService(null); setServiceDialog(true) }}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo servicio
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <Tag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mb-3">
            Aún no tienes servicios ni categorías.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setEditingCategory(null); setCategoryDialog(true) }}
          >
            Crear primera categoría
          </Button>
        </Card>
      ) : (
        categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            business={business}
            category={cat}
            onEditService={(s) => { setEditingService(s); setServiceDialog(true) }}
            onDeleteService={setDeleteService}
            onEditCategory={(c) => { setEditingCategory(c); setCategoryDialog(true) }}
            onDeleteCategory={setDeleteCategory}
          />
        ))
      )}

      {/* Service dialog */}
      <ServiceDialog
        business={business}
        categories={categories}
        open={serviceDialog}
        onOpenChange={setServiceDialog}
        editing={editingService}
      />

      {/* Category dialog */}
      <CategoryDialog
        business={business}
        open={categoryDialog}
        onOpenChange={setCategoryDialog}
        editing={editingCategory}
      />

      {/* Delete service */}
      <AlertDialog open={!!deleteService} onOpenChange={(v) => !v && setDeleteService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar &ldquo;{deleteService?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las citas asociadas se mantendrán pero sin servicio vinculado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteServiceMut.isPending}
              onClick={() => {
                if (!deleteService) return
                deleteServiceMut.mutate(deleteService.id)
                setDeleteService(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete category */}
      <AlertDialog open={!!deleteCategory} onOpenChange={(v) => !v && setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría &ldquo;{deleteCategory?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Los servicios de esta categoría quedarán sin categoría. No se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteCategoryMut.isPending}
              onClick={() => {
                if (!deleteCategory) return
                deleteCategoryMut.mutate(deleteCategory.id)
                setDeleteCategory(null)
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

function CategoryCard({
  business,
  category,
  onEditService,
  onDeleteService,
  onEditCategory,
  onDeleteCategory,
}: {
  business: BusinessT
  category: ServiceCategoryT
  onEditService: (s: ServiceT) => void
  onDeleteService: (s: ServiceT) => void
  onEditCategory: (c: ServiceCategoryT) => void
  onDeleteCategory: (c: ServiceCategoryT) => void
}) {
  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/services/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: category.id, ...vars }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo actualizar')
      }
      return res.json()
    },
  )

  const toggleVisible = (visible: boolean) => {
    updateMut.mutate({ isVisible: visible })
  }

  const reorder = (direction: 'up' | 'down') => {
    updateMut.mutate({ sortOrder: category.sortOrder + (direction === 'up' ? -1 : 1) })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <h3 className="font-semibold text-sm truncate">{category.name}</h3>
          <Badge variant="secondary" className="text-xs">{category.services.length}</Badge>
          {!category.isVisible && (
            <Badge variant="outline" className="text-xs">Oculta</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => reorder('up')} disabled={updateMut.isPending}>
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => reorder('down')} disabled={updateMut.isPending}>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <div className="px-1">
            <Switch
              checked={category.isVisible}
              disabled={updateMut.isPending}
              onCheckedChange={toggleVisible}
            />
          </div>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEditCategory(category)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => onDeleteCategory(category)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {category.services.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            Sin servicios en esta categoría
          </p>
        ) : (
          category.services.map((s) => (
            <ServiceRow
              key={s.id}
              service={s}
              primaryColor={business.primaryColor}
              onEdit={() => onEditService(s)}
              onDelete={() => onDeleteService(s)}
            />
          ))
        )}
      </div>
    </Card>
  )
}

function ServiceRow({
  service,
  primaryColor,
  onEdit,
  onDelete,
}: {
  service: ServiceT
  primaryColor: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {service.imageUrl ? (
          
          <img src={service.imageUrl} alt={service.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{service.name}</div>
          {service.description && (
            <div className="text-xs text-muted-foreground truncate">{service.description}</div>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-sm font-bold" style={{ color: primaryColor }}>
          {service.priceType === 'quote'
            ? 'Cotización'
            : service.priceType === 'from'
            ? `Desde $${service.price}`
            : service.price != null
            ? `$${service.price}`
            : '—'}
        </div>
        {service.durationMinutes != null && (
          <div className="text-xs text-muted-foreground">{service.durationMinutes} min</div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ServiceDialog({
  business,
  categories,
  open,
  onOpenChange,
  editing,
}: {
  business: BusinessT
  categories: ServiceCategoryT[]
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: ServiceT | null
}) {
  const createMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/services', {
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
    { successMessage: 'Servicio creado' },
  )

  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: Record<string, unknown>) => {
      const res = await fetch('/api/services', {
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
    { successMessage: 'Servicio actualizado' },
  )

  const isPending = createMut.isPending || updateMut.isPending

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    priceType: 'fixed',
    durationMinutes: '',
    isBookable: false,
    isVisible: true,
    imageUrl: '',
    type: 'service',
    categoryId: '',
  })

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name || '',
          description: editing.description || '',
          price: editing.price != null ? String(editing.price) : '',
          priceType: editing.priceType || 'fixed',
          durationMinutes: editing.durationMinutes != null ? String(editing.durationMinutes) : '',
          isBookable: editing.isBookable,
          isVisible: editing.isVisible,
          imageUrl: editing.imageUrl || '',
          type: editing.type || 'service',
          categoryId: editing.categoryId || '',
        })
      } else {
        setForm({
          name: '',
          description: '',
          price: '',
          priceType: 'fixed',
          durationMinutes: '',
          isBookable: false,
          isVisible: true,
          imageUrl: '',
          type: 'service',
          categoryId: categories[0]?.id || '',
        })
      }
    }
  }, [open, editing, categories])

  const [uploading, setUploading] = useState(false)

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadImage(file, business.slug)
      setForm((f) => ({ ...f, imageUrl: url }))
    } catch {
      // silent - toast handled by upload
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description || null,
      price: form.price ? parseFloat(form.price) : null,
      priceType: form.priceType,
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
      isBookable: form.isBookable,
      isVisible: form.isVisible,
      imageUrl: form.imageUrl || null,
      type: form.type,
      categoryId: form.categoryId || null,
    }
    if (editing) {
      updateMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    } else {
      createMut.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Nombre *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Manicura semipermanente" />
          </Field>

          <Field label="Descripción">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Detalle del servicio" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo">
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Categoría">
              <Select value={form.categoryId || '__none__'} onValueChange={(v) => setForm({ ...form, categoryId: v === '__none__' ? '' : v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio">
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                disabled={form.priceType === 'quote'}
              />
            </Field>
            <Field label="Tipo de precio">
              <Select value={form.priceType} onValueChange={(v) => setForm({ ...form, priceType: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Duración (minutos)">
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
              placeholder="30, 45, 60..."
            />
          </Field>

          <Field label="Imagen">
            <div className="flex items-center gap-2">
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL o sube archivo" className="flex-1" />
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subir'}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
              </label>
            </div>
            {form.imageUrl && (
              
              <img src={form.imageUrl} alt="preview" className="mt-2 w-16 h-16 rounded-lg object-cover" />
            )}
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <div className="text-sm font-medium">Reservable online</div>
              <div className="text-xs text-muted-foreground">Los clientes pueden agendarlo</div>
            </div>
            <Switch checked={form.isBookable} onCheckedChange={(v) => setForm({ ...form, isBookable: v })} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <div className="text-sm font-medium">Visible al público</div>
              <div className="text-xs text-muted-foreground">Si no, queda oculto en tu página</div>
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
            disabled={isPending || !form.name.trim()}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {editing ? 'Guardar cambios' : 'Crear servicio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CategoryDialog({
  business,
  open,
  onOpenChange,
  editing,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: ServiceCategoryT | null
}) {
  const createMut = useDashboardMutation(
    business.slug,
    async (vars: { name: string }) => {
      const res = await fetch('/api/services/categories', {
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
    { successMessage: 'Categoría creada' },
  )

  const updateMut = useDashboardMutation(
    business.slug,
    async (vars: { name: string }) => {
      const res = await fetch('/api/services/categories', {
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
    { successMessage: 'Categoría actualizada' },
  )

  const [name, setName] = useState('')

  useEffect(() => {
    if (open) {
      setName(editing?.name || '')
    }
  }, [open, editing])

  const handleSave = () => {
    if (!name.trim()) return
    if (editing) {
      updateMut.mutate({ name: name.trim() }, { onSuccess: () => onOpenChange(false) })
    } else {
      createMut.mutate({ name: name.trim() }, { onSuccess: () => onOpenChange(false) })
    }
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
        </DialogHeader>
        <Field label="Nombre *">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Servicios, Productos, Promociones" autoFocus />
        </Field>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || !name.trim()}
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
