'use client'

import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  businessName: string
  primaryColor: string
}

export function QrDialog({ open, onOpenChange, url, businessName, primaryColor }: Props) {
  const [pngDataUrl, setPngDataUrl] = useState<string>('')
  const [svgString, setSvgString] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open || !url) return
    setLoading(true)
    Promise.all([
      QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }),
      QRCode.toString(url, {
        type: 'svg',
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      }),
    ])
      .then(([png, svg]) => {
        setPngDataUrl(png)
        setSvgString(svg)
        setLoading(false)
      })
      .catch((err) => {
        console.error('QR error', err)
        toast.error('Error al generar QR')
        setLoading(false)
      })
  }, [open, url])

  const downloadPng = () => {
    if (!pngDataUrl) return
    const a = document.createElement('a')
    a.href = pngDataUrl
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-qr.png`
    a.click()
    toast.success('QR descargado (PNG)')
  }

  const downloadSvg = () => {
    if (!svgString) return
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${businessName.toLowerCase().replace(/\s+/g, '-')}-qr.svg`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('QR descargado (SVG)')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tu código QR</DialogTitle>
          <DialogDescription>
            Compártelo en tu mostrador, tarjetas o empaque. Tus clientes lo escanean y llegan a tu página.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {loading ? (
            <div className="w-48 h-48 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pngDataUrl ? (
            <div className="relative">
              <img
                src={pngDataUrl}
                alt={`QR de ${businessName}`}
                className="w-48 h-48 rounded-xl border border-border"
              />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: primaryColor }}
              >
                {businessName}
              </div>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground mt-4 text-center break-all">{url}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={downloadPng} disabled={loading || !pngDataUrl} variant="outline">
            <Download className="h-4 w-4 mr-1.5" />
            PNG
          </Button>
          <Button onClick={downloadSvg} disabled={loading || !svgString} variant="outline">
            <Download className="h-4 w-4 mr-1.5" />
            SVG
          </Button>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            Imprime este QR y ponlo en tu mostrador, tarjeta o empaque.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
