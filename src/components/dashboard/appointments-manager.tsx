'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
  Calendar,
  Plus,
  Loader2,
  Ban,
  CheckCircle2,
  XCircle,
  UserX,
  Settings,
  Trash2,
  Clock,
  MessageCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { buildWhatsAppUrl } from '@/lib/business/helpers'
import {
  useDashboardMutation,
  useUpdateBusiness,
  APPOINTMENT_STATUSES,
  type BusinessT,
  type AppointmentT,
  type AppointmentBlockT,
} from './dashboard-helpers'

export function AppointmentsManager({ business }: { business: BusinessT }) {
  const [tab, setTab] = useState<'citas' | 'bloques'>('citas')
  const [manualOpen, setManualOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Si la agenda no está activa, mostrar pantalla de activación
  if (!business.isBookingEnabled) {
    return <ActivateAgenda business={business} />
  }

  // Citas próximas (filtrar las que ya pasaron más de 30 días)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const allAppointments = (business.appointments || [])
    .filter((a) => new Date(a.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const todayAppointments = allAppointments.filter((a) => {
    const d = new Date(a.date)
    return d.toDateString() === new Date().toDateString()
  })
  const upcomingAppointments = allAppointments.filter((a) => {
    const d = new Date(a.date)
    return d.toDateString() !== new Date().toDateString()
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Agenda
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-3.5 w-3.5 mr-1" /> Configurar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBlockOpen(true)}>
            <Ban className="h-3.5 w-3.5 mr-1" /> Bloquear
          </Button>
          <Button
            size="sm"
            onClick={() => setManualOpen(true)}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Nueva cita
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setTab('citas')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'citas' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Citas ({allAppointments.length})
        </button>
        <button
          onClick={() => setTab('bloques')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'bloques' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Bloqueos
        </button>
      </div>

      {tab === 'citas' && (
        <div className="space-y-4">
          {todayAppointments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Hoy
              </h3>
              <div className="space-y-2">
                {todayAppointments.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} business={business} />
                ))}
              </div>
            </Card>
          )}

          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              Próximas ({upcomingAppointments.length})
            </h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay citas programadas
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.slice(0, 30).map((a) => (
                  <AppointmentRow key={a.id} appointment={a} business={business} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'bloques' && <BlocksTab business={business} />}

      {/* Dialogs */}
      <ManualAppointmentDialog
        business={business}
        open={manualOpen}
        onOpenChange={setManualOpen}
      />
      <BlockDialog
        business={business}
        open={blockOpen}
        onOpenChange={setBlockOpen}
      />
      <BookingSettingsDialog
        business={business}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}

function ActivateAgenda({ business }: { business: BusinessT }) {
  const update = useUpdateBusiness(business.slug)
  const [bookingNote, setBookingNote] = useState(business.bookingNote || '')

  const activate = () => {
    update.mutate({
      id: business.id,
      data: {
        isBookingEnabled: true,
        bookingNote: bookingNote || null,
      },
    })
  }

  return (
    <Card className="p-8 text-center">
      <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
      <h2 className="font-semibold mb-1">Agenda desactivada</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        Activa la agenda para recibir reservas online de tus clientes.
        Solo se podrán reservar los servicios marcados como &ldquo;Reservable online&rdquo;.
      </p>
      <div className="max-w-md mx-auto mb-4 text-left">
        <Label className="text-xs text-muted-foreground">Nota para clientes (opcional)</Label>
        <Textarea
          value={bookingNote}
          onChange={(e) => setBookingNote(e.target.value)}
          placeholder="Ej: Confirmamos por WhatsApp"
          rows={2}
          className="mt-1"
        />
      </div>
      <Button
        onClick={activate}
        disabled={update.isPending}
        style={{ backgroundColor: business.primaryColor }}
        className="text-white hover:opacity-90"
      >
        {update.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
        Activar agenda
      </Button>
    </Card>
  )
}

function AppointmentRow({ appointment, business }: { appointment: AppointmentT; business: BusinessT }) {
  const update = useDashboardMutation(
    business.slug,
    async (vars: { status: string }) => {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
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

  const statusLabel = APPOINTMENT_STATUSES.find((s) => s.value === appointment.status)
  const isPast = new Date(appointment.date) < new Date() && appointment.status === 'pending'

  return (
    <div className="border border-border/60 bg-card rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-center flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {format(new Date(appointment.date), 'EEE d MMM', { locale: es })}
            </div>
            <div className="text-sm font-bold" style={{ color: business.primaryColor }}>
              {appointment.startTime}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{appointment.customerName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {appointment.service?.name || 'Servicio'} · {appointment.customerPhone}
            </div>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusLabel?.color || ''}`}>
          {statusLabel?.label || appointment.status}
        </span>
      </div>

      {appointment.status === 'pending' && isPast && (
        <p className="text-xs text-amber-600 mb-2">Esta cita ya pasó sin confirmar</p>
      )}

      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <div className="flex gap-1 flex-wrap">
          {appointment.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={update.isPending}
              onClick={() => update.mutate({ status: 'confirmed' })}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmar
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={update.isPending}
            onClick={() => update.mutate({ status: 'completed' })}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completada
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs text-red-700 hover:bg-red-50"
            disabled={update.isPending}
            onClick={() => update.mutate({ status: 'cancelled' })}
          >
            <XCircle className="h-3 w-3 mr-1" /> Cancelar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            disabled={update.isPending}
            onClick={() => update.mutate({ status: 'no_show' })}
          >
            <UserX className="h-3 w-3 mr-1" /> No asistió
          </Button>
          {/* Botón WhatsApp al cliente con info de la cita */}
          {business.whatsapp && (() => {
            const fechaStr = format(new Date(appointment.date), "EEEE d 'de' MMMM", { locale: es })
            const servicio = appointment.service?.name || 'Servicio'
            const msg = `Hola ${appointment.customerName}, te confirmo tu cita en ${business.name}.\n\n*Detalles:*\n• Servicio: ${servicio}\n• Fecha: ${fechaStr}\n• Hora: ${appointment.startTime}\n\n¿Nos vemos ahí?`
            const url = buildWhatsAppUrl(business.whatsapp, msg)
            return url ? (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              >
                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
              </Button>
            ) : null
          })()}
        </div>
      )}

      {/* Para citas completadas/canceladas/no_show, también permitir WhatsApp */}
      {(appointment.status === 'completed' || appointment.status === 'cancelled' || appointment.status === 'no_show') &&
        business.whatsapp && (() => {
          const fechaStr = format(new Date(appointment.date), "EEEE d 'de' MMMM", { locale: es })
          const servicio = appointment.service?.name || 'Servicio'
          const statusTxt = appointment.status === 'completed'
            ? 'Gracias por tu visita'
            : appointment.status === 'cancelled'
              ? 'Lamentamos que se canceló tu cita'
              : 'Vimos que no pudiste asistir a tu cita'
          const msg = `Hola ${appointment.customerName}, ${statusTxt}.\n\n*Cita:*\n• Servicio: ${servicio}\n• Fecha: ${fechaStr}\n• Hora: ${appointment.startTime}\n\n¿Te gustaría reagendar?`
          const url = buildWhatsAppUrl(business.whatsapp, msg)
          return url ? (
            <div className="flex gap-1 flex-wrap mt-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              >
                <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
              </Button>
            </div>
          ) : null
        })()
      }
    </div>
  )
}

function ManualAppointmentDialog({
  business,
  open,
  onOpenChange,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  // Lista de servicios reservables
  const bookableServices = (business.serviceCategories || [])
    .flatMap((c) => c.services)
    .filter((s) => s.isBookable)

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    date: todayStr,
    startTime: '10:00',
  })

  const createMut = useDashboardMutation(
    business.slug,
    async () => {
      if (!form.serviceId) throw new Error('Selecciona un servicio')
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: form.serviceId,
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          date: form.date,
          startTime: form.startTime,
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo crear la cita')
      }
      return res.json()
    },
    { successMessage: 'Cita creada' },
  )

  const handleSave = () => {
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.serviceId) return
    createMut.mutate(undefined, { onSuccess: () => {
      onOpenChange(false)
      setForm({ customerName: '', customerPhone: '', serviceId: '', date: todayStr, startTime: '10:00' })
    }})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva cita manual</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Cliente *">
            <Input
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="Nombre del cliente"
            />
          </Field>
          <Field label="Teléfono *">
            <Input
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              placeholder="1234567890"
            />
          </Field>
          <Field label="Servicio *">
            <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {bookableServices.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    Sin servicios reservables
                  </SelectItem>
                ) : (
                  bookableServices.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {bookableServices.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Marca servicios como &ldquo;Reservable online&rdquo; en la sección Servicios.
              </p>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fecha *">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Hora *">
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </Field>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMut.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMut.isPending || !form.customerName.trim() || !form.customerPhone.trim() || !form.serviceId}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Crear cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BlockDialog({
  business,
  open,
  onOpenChange,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [form, setForm] = useState({
    date: todayStr,
    startTime: '14:00',
    endTime: '16:00',
    allDay: false,
    reason: '',
  })

  const createMut = useDashboardMutation(
    business.slug,
    async () => {
      const res = await fetch('/api/appointment-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          allDay: form.allDay,
          reason: form.reason || null,
        }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo bloquear el horario')
      }
      return res.json()
    },
    { successMessage: 'Horario bloqueado' },
  )

  const handleSave = () => {
    if (!form.date) return
    createMut.mutate(undefined, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bloquear horario</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Fecha *">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <div className="text-sm font-medium">Todo el día</div>
              <div className="text-xs text-muted-foreground">Bloquear el día completo</div>
            </div>
            <Switch
              checked={form.allDay}
              onCheckedChange={(v) => setForm({ ...form, allDay: v })}
            />
          </div>
          {!form.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Desde">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </Field>
              <Field label="Hasta">
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </Field>
            </div>
          )}
          <Field label="Motivo (opcional)">
            <Textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ej: Almuerzo, vacaciones, capacitación..."
              rows={2}
            />
          </Field>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMut.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMut.isPending || !form.date}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Bloquear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BookingSettingsDialog({
  business,
  open,
  onOpenChange,
}: {
  business: BusinessT
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const update = useUpdateBusiness(business.slug)
  const [form, setForm] = useState({
    bookingSlotInterval: String(business.bookingSlotInterval),
    bookingMinLead: String(business.bookingMinLead),
    bookingMaxDays: String(business.bookingMaxDays),
    bookingNote: business.bookingNote || '',
  })

  const handleSave = () => {
    update.mutate(
      {
        id: business.id,
        data: {
          bookingSlotInterval: parseInt(form.bookingSlotInterval) || 30,
          bookingMinLead: parseInt(form.bookingMinLead) || 60,
          bookingMaxDays: parseInt(form.bookingMaxDays) || 30,
          bookingNote: form.bookingNote || null,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar agenda</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Intervalo de slots (minutos)">
            <Input
              type="number"
              value={form.bookingSlotInterval}
              onChange={(e) => setForm({ ...form, bookingSlotInterval: e.target.value })}
              placeholder="30"
            />
            <p className="text-xs text-muted-foreground mt-1">Cada cuántos minutos hay slots disponibles.</p>
          </Field>
          <Field label="Anticipación mínima (minutos)">
            <Input
              type="number"
              value={form.bookingMinLead}
              onChange={(e) => setForm({ ...form, bookingMinLead: e.target.value })}
              placeholder="60"
            />
          </Field>
          <Field label="Días futuros disponibles">
            <Input
              type="number"
              value={form.bookingMaxDays}
              onChange={(e) => setForm({ ...form, bookingMaxDays: e.target.value })}
              placeholder="30"
            />
          </Field>
          <Field label="Nota para clientes">
            <Textarea
              value={form.bookingNote}
              onChange={(e) => setForm({ ...form, bookingNote: e.target.value })}
              placeholder="Ej: Confirmamos por WhatsApp"
              rows={2}
            />
          </Field>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={update.isPending}
            style={{ backgroundColor: business.primaryColor }}
            className="text-white hover:opacity-90"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BlocksTab({ business }: { business: BusinessT }) {
  const [toDelete, setToDelete] = useState<AppointmentBlockT | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['appointment-blocks', business.id],
    queryFn: async () => {
      const res = await fetch(`/api/appointment-blocks?businessId=${business.id}`)
      if (!res.ok) return []
      const data = await res.json()
      return data.blocks || data || []
    },
  })

  const deleteMut = useDashboardMutation(
    business.slug,
    async (id: string) => {
      const res = await fetch(`/api/appointment-blocks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudo eliminar')
      }
      return res.json()
    },
    { successMessage: 'Bloque eliminado' },
  )

  const blocks: AppointmentBlockT[] = data || []

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Ban className="h-4 w-4" /> Horarios bloqueados
        </h3>
      </div>
      {isLoading ? (
        <div className="text-center py-6">
          <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
        </div>
      ) : blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No tienes horarios bloqueados
        </p>
      ) : (
        <div className="space-y-2">
          {blocks
            .slice()
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">
                      {format(new Date(b.date), 'EEE d MMM, yyyy', { locale: es })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {b.allDay ? 'Todo el día' : `${b.startTime} - ${b.endTime}`}
                      {b.reason && ` · ${b.reason}`}
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-600 hover:text-red-700 flex-shrink-0"
                  onClick={() => setToDelete(b)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este bloque?</AlertDialogTitle>
            <AlertDialogDescription>
              Ese horario volverá a estar disponible para reservas.
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}
