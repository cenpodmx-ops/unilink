# Unilink — Micro Business Presence Platform

> Tu negocio en un link. Plataforma donde pequeños negocios e independientes crean su página profesional en una sola URL.

**No es un CRM. No es un sistema administrativo.** Es presencia digital interactiva: ayuda a los negocios a presentarse, ser encontrados, explicar qué venden y ser contactados.

## 🚀 Quick start

```bash
# 1. Instalar dependencias
bun install

# 2. Crear la base de datos (SQLite) y aplicar el schema
bun run db:push

# 3. Cargar datos de ejemplo (Studio Fernanda - Nails & Beauty)
bun run prisma/seed.ts

# 4. Iniciar el servidor de desarrollo
bun run dev
```

Abre **http://localhost:3000** en tu navegador.

## 📍 Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública que vende el producto |
| `/studio-fernanda` | Micrositio público de ejemplo (Nails & Beauty) |
| `/onboarding` | Crear nueva página (wizard de 6 pasos) |
| `/dashboard` | Panel de administración del negocio |

## ✨ Funciones incluidas

- ✅ Página profesional bajo URL `unilink.mx/tu-negocio`
- ✅ Servicios y productos con precios (fijo, "desde", cotización)
- ✅ Categorías de servicios ordenables
- ✅ Galería de trabajos con lightbox
- ✅ Promociones con vigencia automática
- ✅ Horarios con estado "Abierto ahora / Cerrado" automático
- ✅ Ubicación + "Cómo llegar" (Google Maps)
- ✅ Redes sociales (Instagram, Facebook, TikTok, YouTube, X, LinkedIn, web)
- ✅ WhatsApp contextual (cada servicio genera su mensaje)
- ✅ Guardar contacto (.vcf)
- ✅ Compartir (Web Share API)
- ✅ Agenda opcional (reservas online con verificación de disponibilidad)
- ✅ Reseñas en Google
- ✅ FAQ en acordeón
- ✅ Avisos/banner activable
- ✅ QR descargable
- ✅ Personalización: color principal + estilo + tipografía
- ✅ SEO (title, description, OpenGraph, structured data)
- ✅ Estadísticas básicas (visitas, clics, reservas)
- ✅ Panel administrativo con 6 secciones

## 🚫 Lo que NO incluye (por diseño)

CRM, inventario, POS, facturación, carrito, pagos online del cliente final, WhatsApp API, automatizaciones, email marketing, multiusuario/permisos, ERP, contabilidad, campañas.

## 🛠️ Stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **DB**: Prisma ORM (SQLite)
- **State**: Zustand + TanStack Query
- **Animaciones**: Framer Motion

## 📂 Estructura

```
src/
├── app/
│   ├── [slug]/           # Micrositio público
│   ├── onboarding/       # Crear página
│   ├── dashboard/        # Panel del negocio
│   ├── api/              # APIs REST
│   ├── page.tsx          # Landing pública
│   └── layout.tsx
├── components/
│   ├── microsite/        # Secciones del micrositio público
│   ├── onboarding/       # Wizard de creación
│   ├── dashboard/        # Panel admin
│   ├── shared/           # SafeImage, etc.
│   └── ui/               # shadcn/ui components
├── hooks/
│   └── use-analytics.ts  # Tracking de eventos
└── lib/
    ├── business/helpers.ts  # Horarios, WhatsApp, VCF, etc.
    └── db.ts                # Prisma client

prisma/
├── schema.prisma         # 14 modelos
└── seed.ts               # Datos de ejemplo (Studio Fernanda)
```

## 💰 Modelo de negocio

- **Pago único** $399 MXN por página publicada
- Construye y previsualiza gratis
- Un producto, un precio. Sin planes Starter/Pro/Enterprise.

## 📝 Comandos

```bash
bun run dev          # Servidor de desarrollo (puerto 3000)
bun run lint         # ESLint
bun run db:push      # Aplicar schema a SQLite
bun run db:generate  # Regenerar Prisma Client
bun run prisma/seed.ts  # Cargar datos de ejemplo
```

## 🎯 Regla de oro

> Si una función ayuda al negocio a **presentarse, ser encontrado, explicar qué vende o ser contactado**, puede pertenecer al producto. Si ayuda a administrar lo que sucede después de obtener al cliente, probablemente no pertenece (excepto la agenda).

---

Hecho con cariño para pequeños negocios 🇲🇽
