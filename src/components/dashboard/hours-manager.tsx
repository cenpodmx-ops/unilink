'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Clock, Loader2, Save } from 'lucide-react'
import { useDashboardMutation, DAYS_OF_WEEK, type BusinessT, type BusinessHourT } from './dashboard-helpers'

export function HoursManager({ business }: { business: BusinessT }) {
  const [hours, setHours] = useState<BusinessHourT[]>([])

  useEffect(() => {
    setHours(business.hours || [])
  }, [business.hours])

  // Build map dayOfWeek -> hour (or default)
  const hoursMap = new Map<number, BusinessHourT>()
  for (const h of hours) {
    hoursMap.set(h.dayOfWeek, h)
  }

  // Ensure all 7 days exist (locally)
  const allDays = DAYS_OF_WEEK.map((d) => {
    const h = hoursMap.get(d.value)
    if (h) return h
    return {
      id: `temp-${d.value}`,
      dayOfWeek: d.value,
      isOpen: false,
      openTime: '09:00',
      closeTime: '18:00',
    } as BusinessHourT
  })

  const updateDay = (dayOfWeek: number, patch: Partial<BusinessHourT>) => {
    setHours((prev) => {
      const exists = prev.find((h) => h.dayOfWeek === dayOfWeek)
      if (exists) {
        return prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h))
      } else {
        return [
          ...prev,
          {
            id: `temp-${dayOfWeek}`,
            dayOfWeek,
            isOpen: false,
            openTime: '09:00',
            closeTime: '18:00',
            ...patch,
          } as BusinessHourT,
        ]
      }
    })
  }

  const saveMut = useDashboardMutation<{ ok: true }, void>(
    business.slug,
    async () => {
      const payload = allDays.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        isOpen: d.isOpen,
        openTime: d.openTime,
        closeTime: d.closeTime,
      }))
      const res = await fetch('/api/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id, hours: payload }),
      })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error || 'No se pudieron guardar los horarios')
      }
      return res.json()
    },
    { successMessage: 'Horarios guardados' },
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" /> Horarios
        </h2>
        <Button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          size="sm"
          style={{ backgroundColor: business.primaryColor }}
          className="text-white hover:opacity-90"
        >
          {saveMut.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
          Guardar horarios
        </Button>
      </div>

      <Card className="p-4">
        <div className="divide-y divide-border/60">
          {allDays.map((h) => {
            const day = DAYS_OF_WEEK.find((d) => d.value === h.dayOfWeek)!
            return (
              <div key={h.dayOfWeek} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-24 flex-shrink-0">
                  <div className="text-sm font-medium">{day.label}</div>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={h.isOpen}
                    onCheckedChange={(v) => updateDay(h.dayOfWeek, { isOpen: v })}
                  />
                </div>
                <div className="flex-1 flex items-center justify-end gap-2">
                  {h.isOpen ? (
                    <>
                      <Input
                        type="time"
                        value={h.openTime}
                        onChange={(e) => updateDay(h.dayOfWeek, { openTime: e.target.value })}
                        className="w-28"
                      />
                      <span className="text-xs text-muted-foreground">a</span>
                      <Input
                        type="time"
                        value={h.closeTime}
                        onChange={(e) => updateDay(h.dayOfWeek, { closeTime: e.target.value })}
                        className="w-28"
                      />
                    </>
                  ) : (
                    <Label className="text-xs text-muted-foreground">Cerrado</Label>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground px-1">
        Los cambios se guardan al presionar &ldquo;Guardar horarios&rdquo;.
      </p>
    </div>
  )
}
