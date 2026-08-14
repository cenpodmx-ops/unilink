import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * POST /api/upload
 * Sube una imagen a /public/uploads/{businessName}/{uuid}.ext
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const businessName = (formData.get('businessName') as string) || 'temp'

    if (!file) {
      return NextResponse.json({ error: 'no file' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'type not allowed' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'file too large (max 5MB)' }, { status: 400 })
    }

    const slugify = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'temp'
    const dirSlug = slugify(businessName)

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const filename = `${randomUUID()}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', dirSlug)

    await fs.mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(path.join(uploadDir, filename), buffer)

    const url = `/uploads/${dirSlug}/${filename}`
    return NextResponse.json({ ok: true, url })
  } catch (error) {
    console.error('[api/upload] error', error)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
