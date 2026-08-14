'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Check, ChevronLeft, Loader2, PartyPopper } from 'lucide-react'
import { addDays, format, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Service, BusinessHour, AppointmentBlock, Appointment } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  businessId: string
  businessName: string
  hours: BusinessHour[]
  blocks: AppointmentBlock[]
  maxDays: number
  slotInterval: number
  sessionId: string
  primaryColor: string
  bookingNote?: string | null
}

type Step = 'date' | 'time' | 'info' | 'confirm' | 'done'

export function BookingDialog({
  open,
  onOpenChange,
  service,
  businessId,
  businessName,
  hours,
  blocks,
  maxDays,
  slotInterval,
  sessionId,
  primaryColor,
  bookingNote,
}: Props) {
  const [step, setStep] = useState<Step>('date')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const reset = () => {
    setStep('date')
    setSelectedDate(null)
    setSelectedTime(null)
    setForm({ name: '', phone: '', email: '' })
  }

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!service || !selectedDate || !selectedTime) return
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: service.id,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email || undefined,
          date: format(selectedDate, 'yyyy-MM-dd'),
          startTime: selectedTime,
          sessionId,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al crear la reserva')
      }
      return res.json()
    },
    onSuccess: () => setStep('done'),
    onError: (err: Error) => {
      alert(err.message)
    },
  })

  const handleClose = (open: boolean) => {
    if (!open) {
      setTimeout(reset, 200)
    }
    onOpenChange(open)
  }

  // Generar próximos días disponibles
  const availableDays = generateAvailableDays(hours, blocks, maxDays)

  // Generar slots horarios para la fecha seleccionada
  const availableSlots = selectedDate
    ? generateTimeSlots(
        selectedDate,
        hours,
        blocks,
        slotInterval,
        service?.durationMinutes ?? 30,
      )
    : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60">
          <DialogTitle className="text-base">Reservar cita</DialogTitle>
          {service && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {service.name}
              {service.durationMinutes ? ` · ${formatDuration(service.durationMinutes)}` : ''}
            </p>
          )}
        </DialogHeader>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="px-5 py-2 flex items-center gap-2 border-b border-border/60 bg-muted/30">
            {(['date', 'time', 'info'] as Step[]).map((s, i) => {
              const stepIndex = ['date', 'time', 'info', 'confirm'].indexOf(step)
              const myIndex = ['date', 'time', 'info'].indexOf(s)
              const isActive = myIndex === stepIndex
              const isDone = myIndex < stepIndex
              return (
                <div
                  key={s}
                  className="flex items-center gap-2 flex-1"
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isDone && 'text-white',
                      isActive && 'text-white',
                      !isActive && !isDone && 'bg-muted text-muted-foreground',
                    )}
                    style={
                      (isActive || isDone) ? { backgroundColor: primaryColor } : {}
                    }
                  >
                    {isDone ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {s === 'date' ? 'Fecha' : s === 'time' ? 'Hora' : 'Tus datos'}
                  </span>
                  {i < 2 && <div className="flex-1 h-px bg-border/60 mx-1" />}
                </div>
              )
            })}
          </div>
        )}

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* STEP: DATE */}
            {step === 'date' && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                  <h3 className="font-semibold text-sm">Elige una fecha</h3>
                </div>
                {availableDays.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No hay fechas disponibles en este momento.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {availableDays.map((day) => {
                      const isSelected =
                        selectedDate &&
                        format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                      return (
                        <button
                          key={day.toISOString()}
                          onClick={() => {
                            setSelectedDate(day)
                            setSelectedTime(null)
                            setStep('time')
                          }}
                          className={cn(
                            'p-2.5 rounded-lg border text-center transition-all',
                            isSelected
                              ? 'border-transparent text-white'
                              : 'border-border hover:border-foreground/30',
                          )}
                          style={isSelected ? { backgroundColor: primaryColor } : {}}
                        >
                          <div className="text-[10px] uppercase font-medium">
                            {format(day, 'EEE', { locale: es })}
                          </div>
                          <div className="text-lg font-bold leading-tight">
                            {format(day, 'd')}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {format(day, 'MMM', { locale: es })}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP: TIME */}
            {step === 'time' && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setStep('date')}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Cambiar fecha
                  </button>
                  <span className="text-xs font-medium">
                    {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" style={{ color: primaryColor }} />
                  <h3 className="font-semibold text-sm">Elige una hora</h3>
                </div>

                {availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No hay horarios disponibles para este día.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTime === slot
                      return (
                        <button
                          key={slot}
                          onClick={() => {
                            setSelectedTime(slot)
                            setStep('info')
                          }}
                          className={cn(
                            'py-2 rounded-lg border text-sm font-medium transition-all',
                            isSelected
                              ? 'border-transparent text-white'
                              : 'border-border hover:border-foreground/30',
                          )}
                          style={isSelected ? { backgroundColor: primaryColor } : {}}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP: INFO */}
            {step === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <button
                  onClick={() => setStep('time')}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Cambiar hora
                </button>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="bk-name">Nombre *</Label>
                    <Input
                      id="bk-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Tu nombre"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bk-phone">Teléfono *</Label>
                    <Input
                      id="bk-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+52 662 123 4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bk-email">Correo (opcional)</Label>
                    <Input
                      id="bk-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@correo.com"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Resumen */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio</span>
                    <span className="font-medium">{service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>

                <Button
                  onClick={() => createBooking.mutate()}
                  disabled={!form.name || !form.phone || createBooking.isPending}
                  className="w-full mt-4 h-11"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Reservando...
                    </>
                  ) : (
                    'Confirmar reserva'
                  )}
                </Button>
              </motion.div>
            )}

            {/* STEP: DONE */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${primaryColor}1a` }}
                >
                  <PartyPopper className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-lg font-bold mb-1">¡Tu cita está registrada!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {bookingNote || `Te esperamos en ${businessName}.`}
                </p>
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-left space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servicio</span>
                    <span className="font-medium">{service?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium">
                      {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hora</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleClose(false)}
                  className="w-full mt-4 h-11"
                  variant="outline"
                >
                  Cerrar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ===================== Helpers de slots =====================

function generateAvailableDays(
  hours: BusinessHour[],
  blocks: AppointmentBlock[],
  maxDays: number,
): Date[] {
  const days: Date[] = []
  const today = startOfDay(new Date())
  for (let i = 0; i < maxDays; i++) {
    const day = addDays(today, i)
    const dayOfWeek = day.getDay()
    const dayHours = hours.find((h) => h.dayOfWeek === dayOfWeek)
    if (!dayHours?.isOpen) continue
    // Si es hoy, verificar que todavía haya horario disponible
    if (i === 0) {
      const now = new Date()
      const [closeH, closeM] = dayHours.closeTime.split(':').map(Number)
      const close = new Date(day)
      close.setHours(closeH, closeM, 0, 0)
      if (now >= close) continue
    }
    days.push(day)
  }
  return days
}

function generateTimeSlots(
  date: Date,
  hours: BusinessHour[],
  blocks: AppointmentBlock[],
  interval: number,
  duration: number,
): string[] {
  const dayOfWeek = date.getDay()
  const dayHours = hours.find((h) => h.dayOfWeek === dayOfWeek)
  if (!dayHours?.isOpen) return []

  const slots: string[] = []
  const [openH, openM] = dayHours.openTime.split(':').map(Number)
  const [closeH, closeM] = dayHours.closeTime.split(':').map(Number)

  let currentMin = openH * 60 + openM
  const closeMin = closeH * 60 + closeM

  const today = new Date()
  const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  const minFromNow = isToday ? today.getHours() * 60 + today.getMinutes() + 30 : 0

  while (currentMin + duration <= closeMin) {
    if (currentMin >= minFromNow) {
      // Verificar que no choque con un bloque
      const slotEnd = currentMin + duration
      const blocked = blocks.some((b) => {
        if (b.allDay) return true
        const [bs, be] = [b.startTime, b.endTime].map((t) => {
          const [h, m] = t.split(':').map(Number)
          return h * 60 + m
        })
        return currentMin < be && slotEnd > bs
      })
      if (!blocked) {
        const h = Math.floor(currentMin / 60)
        const m = currentMin % 60
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      }
    }
    currentMin += interval
  }

  return slots
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
