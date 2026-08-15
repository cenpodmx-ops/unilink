# Worklog - Micro Business Presence Platform

## Project Overview
Building "Micro Business Presence Platform" - a platform where small businesses create their professional microsite (one link with services, prices, location, WhatsApp, booking, etc.)

## Tech Stack
- Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite)
- Zustand + TanStack Query
- framer-motion for animations

## Architecture
- `/` - Landing pública (vende el producto)
- `/[slug]` - Micrositio público del negocio
- `/onboarding` - Crear nueva página
- `/dashboard` - Panel del negocio
- `/admin` - Panel administrativo de la plataforma

## Completed Work
- Task ID: 1 - Prisma schema completo definido y pusheado (14 modelos: User, Business, BusinessSetting, BusinessHour, SocialLink, ServiceCategory, Service, GalleryItem, Promotion, Faq, Appointment, AppointmentBlock, AnalyticsEvent, Payment)


---
Task ID: 2-5 (combined)
Agent: Main Agent
Task: Crear seed + Landing page + Micrositio público + APIs + imágenes de ejemplo

Work Log:
- Schema Prisma completo definido y pusheado (14 modelos)
- Script de seed creado con negocio de ejemplo "Studio Fernanda" (Nails & Beauty): 8 servicios, 6 imágenes de galería, 2 promociones, 5 FAQs, horarios, redes sociales, 3 citas de ejemplo, eventos analíticos
- Landing page pública (/) construida: hero con phone mockup, stats, features (8 módulos), categorías (16 giros), value prop, pricing ($399), FAQ, CTA final, footer sticky
- Micrositio público (/[slug]) con todos los módulos: cover, header con logo/estado abierto, botones rápidos (WhatsApp/Llamar/Ubicación/Instagram/Compartir/Contacto), secciones ordenables (servicios con categorías, galería con lightbox, promociones con vigencia, acerca con tags, horarios con estado automático, ubicación, reseñas Google, FAQ acordeón), redes sociales, footer marca blanca, sticky CTA móvil
- APIs backend: /api/business (GET público con tracking page_view), /api/analytics (POST eventos), /api/bookings (POST crear cita con verificación de disponibilidad y bloques)
- Helper de business: getOpenStatus (calcula abierto/cerrado con próxima apertura), formatTime12, buildWhatsAppUrl/Message (contextual por servicio), buildVcf (guardar contacto), hexToRgba
- Hook useAnalytics + useSessionId para tracking
- Componente SafeImage con fallback elegante para imágenes que fallan al cargar
- Imágenes de ejemplo generándose: logo, cover, 6 galería, 3 servicios

Stage Summary:
- Negocio de ejemplo: Studio Fernanda (slug: studio-fernanda) en /studio-fernanda
- Landing: vende el producto con propuesta clara "$399 una sola vez"
- Micrositio: completo y funcional con todos los módulos del spec (puntos 4-26 del documento)
- APIs: listas para tracking, reservas y datos públicos
- Pendiente: onboarding, dashboard, admin, sistema de reservas público (dialog ya creado)


---
Task ID: 7-9 (combined)
Agent: Main Agent
Task: Onboarding + Dashboard + Sistema de reservas

Work Log:
- API /api/onboarding creada: crea negocio en estado "draft" con horarios por defecto, settings, categoría y servicios iniciales. Genera slug único automáticamente.
- API /api/upload creada: sube imágenes a /public/uploads/{businessSlug}/ con validación de tipo y tamaño (5MB max)
- API /api/dashboard/business creada: devuelve negocio completo + métricas (7 días) + citas de hoy + próximas citas
- Componente OnboardingWizard: wizard de 6 pasos (Nombre → Giro → Logo → WhatsApp → Servicios → Color) con barra de progreso, validación, animaciones framer-motion, pantalla de éxito
- Componente Dashboard con 6 tabs: Inicio (stats + citas hoy + acciones rápidas), Mi página (info + diseño + preview iframe), Servicios (CRUD listado), Agenda (citas por día), Estadísticas (barras animadas por tipo de evento), Configuración (cuenta + agenda + zona peligro)
- BookingDialog: flujo de 3 pasos (Fecha → Hora → Datos) con step indicator, verificación de disponibilidad, slots calculados según horarios y bloques, pantalla de confirmación

Stage Summary:
- Onboarding completo en /onboarding (6 pasos funcionales)
- Dashboard completo en /dashboard (6 secciones funcionales)
- Sistema de reservas funcionando end-to-end: servicio → fecha → hora → datos → confirmación → guardado en BD
- APIs: /api/onboarding, /api/upload, /api/dashboard/business, /api/business, /api/analytics, /api/bookings
- Verificado con Agent Browser: flujo de reserva completo funciona (seleccioné fecha LUN 17 ago, hora 11:30, llené datos, confirmé → "¡Tu cita está registrada!")

---
Task ID: 11
Agent: Main Agent
Task: Verificación final con Agent Browser

Work Log:
- Landing page (/): verificada en desktop y mobile (375px). Hero, mockup de celular, stats, features, categorías, value prop, pricing, FAQ, CTA final, footer todo funciona
- Micrositio (/studio-fernanda): verificado con todas las imágenes cargando. Cover, logo, estado abierto/cerrado automático, botones rápidos (6), servicios con imágenes y precios, galería con lightbox, promociones con vigencia, horarios colapsables, ubicación, redes sociales, reseñas, FAQ acordeón, avisos, sticky CTA móvil, footer marca blanca
- Onboarding (/onboarding): probado paso 1 (nombre) → paso 2 (categoría). Funciona navegación y validación
- Dashboard (/dashboard): verificado. Muestra 4 stat cards (13 visitas, 1 clic WhatsApp, 1 clic ubicación, 0 reservas), 3 citas de hoy, acciones rápidas, navegación entre 6 tabs
- Booking dialog: probado flujo completo → fecha → hora → datos → confirmación → "¡Tu cita está registrada!" ✓
- Responsive: verificado en 375px (iPhone X) y 1280px (desktop)
- Sticky footer: landing page lo tiene correctamente
- Lint: pasa sin errores (0 errors, 4 warnings de eslint-disable sin usar - limpiados)

Stage Summary:
- Todas las rutas funcionando: /, /[slug], /onboarding, /dashboard
- Todos los módulos del spec implementados (puntos 4-26 del documento)
- Sistema de reservas funcional end-to-end
- 11 imágenes generadas (logo, cover, 6 galería, 3 servicios)
- Lint limpio
- Dev server estable en puerto 3000


---
Task ID: AUTH
Agent: Main Agent
Task: Implementar autenticación completa con NextAuth

Work Log:
- Instalado bcryptjs para hashear passwords
- Creado /src/lib/auth/auth-options.ts con Credentials provider (email+password)
- Creado /src/lib/auth/get-current-user.ts con helpers getCurrentUser() y requireUser()
- Creado /src/app/api/auth/[...nextauth]/route.ts (handler de NextAuth)
- Creado /src/app/api/auth/register/route.ts (registro con bcrypt)
- Creado /src/components/auth/session-wrapper.tsx (SessionProvider)
- Creado /src/components/auth/login-form.tsx y register-form.tsx (UI completa con validación)
- Creado /src/app/auth/login/page.tsx y /src/app/auth/register/page.tsx
- Actualizado /src/components/providers.tsx para incluir SessionWrapper
- Actualizado .env con NEXTAUTH_URL y NEXTAUTH_SECRET
- Creado /src/middleware.ts que protege /dashboard, /onboarding y todas las APIs /api/business, /api/services, /api/gallery, /api/promotions, /api/faqs, /api/hours, /api/appointments, /api/onboarding, /api/dashboard
- Actualizado /src/app/api/onboarding/route.ts para usar getCurrentUser() en vez de usuario demo hardcodeado
- Creado /src/app/api/businesses/route.ts (GET lista de negocios del usuario autenticado)
- Creado /src/app/api/business/[id]/route.ts (GET y PUT con verificación de ownership)
- Actualizado /src/app/api/dashboard/business/route.ts para verificar ownership (where: { slug, ownerId: user.id })
- Actualizado /src/app/dashboard/page.tsx: redirige a /auth/login si no hay sesión, redirige a /onboarding si no tiene negocios
- Actualizado /prisma/seed.ts: usuario fernanda@studiofernanda.mx ahora tiene passwordHash real de bcrypt (password: demo1234)

Credenciales demo para probar:
- Email: fernanda@studiofernanda.mx
- Password: demo1234

Stage Summary:
- Auth completo funcionando: register → login → sesión → logout
- Middleware protege rutas privadas
- APIs verifican ownership en cada request
- Dashboard solo muestra negocios del usuario logueado
- Verificado con Agent Browser: login funciona, redirige a /dashboard, muestra Studio Fernanda

Patrón de auth para subagents:
- En API routes (server-side): `import { getCurrentUser } from '@/lib/auth/get-current-user'` → `const user = await getCurrentUser()` → verificar `if (!user) return 401` → buscar negocio con `where: { id, ownerId: user.id }`
- En páginas server: `import { getServerSession } from 'next-auth'` → `import { authOptions } from '@/lib/auth/auth-options'` → `const session = await getServerSession(authOptions)`
- En componentes client: `import { useSession } from 'next-auth/react'` o `signIn()`, `signOut()`


---
Task ID: 2-A (APIs CRUD)
Agent: Sub Agent (Build CRUD APIs)
Task: Crear todas las APIs CRUD faltantes para que el dashboard pueda editar el negocio completo

Work Log:
- Creadas 9 APIs REST con patrón uniforme: `getCurrentUser()` → verificar ownership → zod validation → try/catch → `{ ok: true }` o `{ error: '...' }`
- Cada API exporta `const dynamic = 'force-dynamic'`
- Helpers de auth: `import { getCurrentUser } from '@/lib/auth/get-current-user'` y `import { db } from '@/lib/db'` (patrón AUTH del worklog)
- Verificación de ownership: todas las operaciones buscan primero el recurso + `business.findFirst({ where: { id: businessId, ownerId: user.id } })` para evitar accesos cross-tenant
- DELETE de `services/categories` hace cascade manual (deleteMany de services primero) — el schema tiene onDelete: SetNull en Service.categoryId, pero el spec requiere cascade. De este modo se cumple el cascade a nivel app sin tocar el schema.
- `hours` PUT usa `$transaction([deleteMany, ...creates])` para reemplazar atómicamente los 7 días
- `socials` POST usa `upsert` con la unique constraint `businessId_platform` definida en el schema
- `appointments/[id]` PUT valida `status` con enum zod: `['pending', 'confirmed', 'cancelled', 'completed', 'no_show']`
- `appointment-blocks` POST valida que `endTime > startTime` cuando no es `allDay`
- `promotions` POST/PUT valida que `endDate >= startDate`
- Errores HTTP consistentes: 401 (unauthorized), 400 (invalid payload con `details` de zod), 404 (not found / no ownership), 500 (internal)

Archivos creados:
- /src/app/api/services/route.ts (POST/PUT/DELETE para Service)
- /src/app/api/services/categories/route.ts (POST/PUT/DELETE para ServiceCategory con cascade)
- /src/app/api/gallery/route.ts (POST/DELETE para GalleryItem)
- /src/app/api/promotions/route.ts (POST/PUT/DELETE para Promotion con validación de fechas)
- /src/app/api/faqs/route.ts (POST/PUT/DELETE para Faq)
- /src/app/api/hours/route.ts (PUT transaccional con upsert para BusinessHour)
- /src/app/api/socials/route.ts (POST upsert por businessId+platform / DELETE)
- /src/app/api/appointments/[id]/route.ts (PUT para actualizar status de Appointment)
- /src/app/api/appointment-blocks/route.ts (POST/DELETE para AppointmentBlock)

Decisiones importantes:
- No se modificó el schema de Prisma (onDelete: SetNull en Service.category → se resolvió con deleteMany manual en DELETE /api/services/categories para cumplir el cascade del spec)
- No se modificó middleware.ts (las nuevas rutas /api/services/categories, /api/socials, /api/appointment-blocks NO están en el matcher, pero todas verifican auth via getCurrentUser() en código — la protección es equivalente)
- Validación de `categoryId` al crear/actualizar Service: se comprueba que pertenezca al mismo negocio para evitar referencias cruzadas
- `z.coerce.date()` en promotions y appointment-blocks para aceptar ISO strings desde el cliente

Verificación:
- TypeScript: `bunx tsc --noEmit` → 0 errores en archivos nuevos (los errores reportados son preexistentes de tasks anteriores en /examples, /skills, /src/lib/auth/auth-options.ts, /src/app/[slug]/page.tsx, /src/app/dashboard/page.tsx, /src/components/microsite/services-section.tsx, /src/app/api/analytics/route.ts — ninguno relacionado con esta task)
- Lint: `bun run lint` → exit 0, 0 errores

Stage Summary:
- Dashboard ahora puede editar end-to-end: servicios, categorías de servicios, galería, promociones, FAQs, horarios, redes sociales, status de citas y bloqueos de agenda
- 9 APIs nuevas, ~750 líneas total, todas con auth + ownership + zod validation
- Listo para conectar con la UI del dashboard (tabs Servicios / Mi página / Agenda / Configuración)


---
Task ID: 2 (Dashboard CRUD APIs)
Agent: Sub Agent (Build CRUD APIs)
Task: Create all the CRUD API endpoints needed for the dashboard to be fully functional (business info, services, gallery, promotions, FAQ, hours, social links, appointments, appointment blocks)

Work Log:
- Created the management API surface organized by REST resource with `[id]` dynamic segments (instead of all-in-one route.ts files)
- All routes use the standard pattern: `getCurrentUser()` → ownership check → zod validation → try/catch → `NextResponse.json`
- All routes export `const dynamic = 'force-dynamic'`
- Ownership enforced via `db.business.findFirst({ where: { id, ownerId: user.id } })` returning 404 if missing
- For nested resources (service/gallery/promotion/faq/appointment-block), ownership verified by fetching the resource first, then its parent business
- HTTP status codes: 401 (unauthorized), 400 (invalid payload with zod `details`), 404 (not found / no ownership), 500 (internal)
- Errors logged via `console.error('[api/<route>] <method> error', error)`
- `business/manage/[slug]` DELETE does soft-delete (sets `status='deleted'`) — GET/PUT exclude deleted businesses via `status: { not: 'deleted' }`
- `business/manage/[slug]` PUT serializes `tags`, `sectionOrder`, `visibleButtons` arrays to JSON strings (SQLite has no native list type)
- `social/route.ts` PUT uses `$transaction([deleteMany, ...creates])` for atomic bulk-replace of all social links
- `appointments/manage/route.ts` POST allows owners to create manual appointments (no slot availability check, default status='confirmed'); auto-calculates endTime=startTime+30min if omitted
- `appointments/manage/[id]` PUT updates status (and optionally notes)
- `appointment-blocks/route.ts` GET added: lists blocks for a business via `?businessId=` query param
- `appointment-blocks/[id]` DELETE: deletes by path param (instead of body id)
- `promotions/manage/[id]` PUT validates `endDate >= startDate` considering both new and existing values
- `services/[id]` PUT validates `categoryId` belongs to same business when changed

Archivos creados:
- /src/app/api/business/manage/[slug]/route.ts (GET full data, PUT subset of fields with JSON.stringify for arrays, DELETE soft-delete)
- /src/app/api/services/[id]/route.ts (PUT update, DELETE)
- /src/app/api/gallery/[id]/route.ts (PUT update caption/sortOrder/imageUrl, DELETE)
- /src/app/api/promotions/manage/route.ts (POST create)
- /src/app/api/promotions/manage/[id]/route.ts (PUT update with date validation, DELETE)
- /src/app/api/faqs/manage/route.ts (POST create)
- /src/app/api/faqs/manage/[id]/route.ts (PUT update, DELETE)
- /src/app/api/social/route.ts (PUT bulk-replace all social links transactionally)
- /src/app/api/appointments/manage/route.ts (POST manual appointment creation for owners)
- /src/app/api/appointments/manage/[id]/route.ts (PUT update status/notes)
- /src/app/api/appointment-blocks/[id]/route.ts (DELETE by path id)

Archivos modificados:
- /src/app/api/appointment-blocks/route.ts (added GET handler for listing by ?businessId=, kept existing POST/DELETE for backward compat)

Decisiones importantes:
- Existing endpoints (services/route.ts POST/PUT/DELETE, gallery/route.ts POST/DELETE, promotions/route.ts POST/PUT/DELETE, faqs/route.ts POST/PUT/DELETE, socials/route.ts POST/DELETE, appointments/[id]/route.ts PUT, business/[id]/route.ts GET/PUT) were left intact for backward compatibility with any dashboard code that may already be using them. New spec-compliant endpoints coexist as separate files.
- `hours/route.ts` already matched the spec (PUT bulk update) — left unchanged.
- `business/manage/[slug]` uses slug in URL (per spec) instead of id; useful because the dashboard's "Mi página" tab knows the business by slug.
- Appointment creation in `appointments/manage` defaults to `status='confirmed'` (owner manual booking) vs `/api/bookings` public endpoint which defaults to `pending`.
- Soft-delete preserves referential integrity (appointments, services, etc. still reference the business). Future listing endpoints should filter `status != 'deleted'`.

Verificación:
- TypeScript: `bunx tsc --noEmit` → 0 errores en archivos nuevos (errores reportados son preexistentes de tasks anteriores en /examples, /skills, /src/lib/auth/auth-options.ts, /src/app/[slug]/page.tsx, /src/app/dashboard/page.tsx, /src/components/microsite/services-section.tsx, /src/app/api/analytics/route.ts — ninguno relacionado con esta task)
- Lint: `bun run lint` → 0 errores en archivos nuevos (los 6 errores y 4 warnings son preexistentes en /src/components/dashboard/* — react-hooks/set-state-in-effect en useEffect, no relacionados con APIs)

Stage Summary:
- Dashboard ahora tiene APIs REST completas y estructuradas por recurso para gestionar:
  - Info del negocio (PUT/GET/DELETE vía /api/business/manage/[slug])
  - Servicios (POST /api/services + PUT/DELETE /api/services/[id])
  - Categorías de servicios (POST/PUT/DELETE en /api/services/categories — existente)
  - Galería (POST /api/gallery + PUT/DELETE /api/gallery/[id])
  - Promociones (POST /api/promotions/manage + PUT/DELETE /api/promotions/manage/[id])
  - FAQs (POST /api/faqs/manage + PUT/DELETE /api/faqs/manage/[id])
  - Horarios (PUT /api/hours — bulk replace)
  - Redes sociales (PUT /api/social — bulk replace transactional)
  - Citas (POST /api/appointments/manage para creación manual + PUT /api/appointments/manage/[id] para status)
  - Bloqueos de agenda (POST/GET /api/appointment-blocks + DELETE /api/appointment-blocks/[id])
- 11 archivos nuevos, 1 archivo modificado, ~900 líneas total
- Listo para conectar con la UI del dashboard


---
Task ID: 3
Agent: Sub Agent (Integrate Managers into Dashboard)
Task: Refactorizar /src/components/dashboard/dashboard.tsx para usar los componentes manager ya creados en lugar de las vistas inline read-only

Work Log:
- LEÍDO cada uno de los 10 manager components antes de integrarlos para entender sus props (todos usan `business: BusinessT` de `./dashboard-helpers` y manejan internamente su fetching, mutaciones y refetch vía `useDashboardMutation`/`useUpdateBusiness`, los cuales ya invalidan automáticamente el query `['dashboard', slug]`)
- LEÍDO worklog.md para entender el contexto: las APIs CRUD (Task 2 + 2-A) y los componentes manager ya estaban listos

Cambios en /src/components/dashboard/dashboard.tsx (622 líneas, refactor completo):

1. **Imports nuevos**:
   - `useRouter` de `next/navigation` (para switch entre negocios)
   - `useQueryClient` de `@tanstack/react-query` (para invalidar cache al cambiar negocio)
   - `DropdownMenu*` components de shadcn (para "Mis páginas" dropdown)
   - Íconos nuevos: `ChevronDown`, `Building2`, `Check`, `Pencil`, `Palette`
   - Todos los managers: `ServicesManager`, `GalleryManager`, `PromotionsManager`, `FaqsManager`, `HoursManager`, `SocialLinksManager`, `AboutNoticeSection`, `AppointmentsManager`, `EditBusinessInfoDialog`, `EditBusinessDesignDialog`
   - `parseTags` y tipo `BusinessT` de `./dashboard-helpers`

2. **Dropdown "Mis páginas" en el header** (solo visible si el usuario tiene >1 negocio):
   - Fetch `useQuery(['businesses'], ...)` a `/api/businesses` (ya existía de Task AUTH)
   - Renderiza botón con nombre del negocio actual + ChevronDown
   - Items: avatar con inicial + nombre + slug + Check si es el actual
   - Click en un negocio → `router.push('/dashboard?slug=...')` para recargar con el nuevo negocio
   - Link "Crear nueva página" al final → `/onboarding`
   - Si solo tiene 1 negocio, el dropdown se oculta (no rompe el header)

3. **Tab "Mi página" → PaginaView refactorizada** (de read-only a editable):
   - Card "Información del negocio" (read-only summary con InfoRows) + botón "Editar información" que abre `EditBusinessInfoDialog`
   - Card "Diseño" (resumen color + estilo) + botón "Editar diseño" que abre `EditBusinessDesignDialog`
   - `<AboutNoticeSection business={business} />` (acerca de + aviso destacado, editable inline)
   - `<HoursManager business={business} />` (horarios, editable inline)
   - `<SocialLinksManager business={business} />` (CRUD de redes sociales)
   - `<GalleryManager business={business} />` (CRUD de galería con upload)
   - `<PromotionsManager business={business} />` (CRUD de promociones)
   - `<FaqsManager business={business} />` (CRUD de FAQs con reorder)
   - Card "Vista previa" con iframe a `/${business.slug}` (conservado)
   - Diálogos montados al final del componente, controlados por state local

4. **Tab "Servicios"** → reemplazado `<ServiciosView>` por `<ServicesManager business={business} />` (CRUD completo con categorías, orden, visibilidad, etc.)

5. **Tab "Agenda"** → reemplazado `<AgendaView>` por `<AppointmentsManager business={business} />`:
   - El manager maneja internamente el caso `!business.isBookingEnabled` con pantalla de activación
   - Incluye tabs Citas/Bloqueos, creación manual, settings de agenda
   - Eliminada la verificación inline `business.isBookingEnabled` del dashboard (ahora vive en el manager)

6. **Tab "Configuración" → ConfiguracionView mejorada**:
   - Cards existentes (Cuenta, Agenda, Zona de peligro) conservados
   - Añadidos botones "Editar información" y "Editar diseño" en el header de la card Cuenta
   - Diálogos `EditBusinessInfoDialog` + `EditBusinessDesignDialog` montados al final
   - Nota informativa que indica usar tab Agenda para gestión avanzada

7. **Tab "Inicio" y "Estadísticas"** → conservados sin cambios (ya eran adecuados)

Cosas que se conservaron intactas:
- Loading skeleton (con 4 cards placeholders + 1 hero)
- Error state ("No se encontró el negocio" + botón Volver)
- Greeting "Buenas tardes" + business.name
- "Ver mi página" button en header
- Nav tabs (6) con scroll horizontal en mobile + AnimatePresence
- Footer con © Unilink
- Query key `['dashboard', slug]` y fetch a `/api/dashboard/business?slug=...`
- Draft banner "Publicar por $399"
- `greeting()`, `StatCard`, `InfoRow`, `InicioView`, `EstadisticasView` helpers

Refs (auto-invalidation):
- Todos los managers usan `useDashboardMutation` o `useUpdateBusiness` de `./dashboard-helpers`
- Esos hooks llaman `qc.invalidateQueries({ queryKey: ['dashboard', slug] })` en `onSuccess`
- Por lo tanto, después de cualquier edit/crear/eliminar, el dashboard se refetch automaticamente
- No se necesitan callbacks `onChange` adicionales (los managers ya invalidan el query correcto)

Cambio menor en archivo de manager:
- /src/components/dashboard/hours-manager.tsx línea 59: tipado explícito `useDashboardMutation<{ ok: true }, void>` para resolver error TS2554 en `saveMut.mutate()` (0 args). Fix trivial, no cambia comportamiento runtime. Era un error TS preexistente.

Verificación:
- TypeScript: `bunx tsc --noEmit` → 0 errores en archivos del dashboard (dashboard.tsx, hours-manager.tsx, y otros managers) — los errores reportados son preexistentes en /examples, /skills, /src/app/[slug]/page.tsx, /src/app/api/analytics/route.ts, /src/components/microsite/services-section.tsx (ninguno relacionado con esta task)
- Lint: `bun run lint` → 0 errores en dashboard.tsx — los 6 errores y 4 warnings son preexistentes en otros managers (react-hooks/set-state-in-effect en useEffect, no introducidos por esta task)
- Smoke test con curl: 
  - Login con fernanda@studiofernanda.mx / demo1234 → 200 ✓
  - GET /dashboard → 200 (después de login) ✓
  - HTML renderiza el loading skeleton correctamente (el contenido se carga client-side con useQuery) ✓
  - GET /api/dashboard/business?slug=studio-fernanda → devuelve business completo con relaciones ✓
  - GET /api/businesses → devuelve lista con 1 negocio (Studio Fernanda) ✓
- Dashboard component compilado y cargado como chunk `src_components_93e5bf50._.js`, exportado como `Dashboard` ✓
- El usuario Fernanda tiene 1 solo negocio, así que el dropdown "Mis páginas" no se muestra (lo cual es correcto según el spec "if the user has multiple")

Stage Summary:
- Dashboard refactorizado end-to-end para usar los 10 managers ya creados
- Tab "Mi página" ahora permite editar TODO: info, diseño, acerca de, aviso, horarios, redes, galería, promociones, FAQs
- Tab "Servicios" usa ServicesManager con CRUD completo + categorías + reorder + visibilidad
- Tab "Agenda" usa AppointmentsManager con activación, citas manuales, bloqueos, settings
- Tab "Configuración" mantiene su contenido + añade accesos rápidos a EditBusinessInfo/Design dialogs
- Header con dropdown "Mis páginas" para multi-negocio (auto-oculto si solo tiene 1)
- Todos los edits disparan refetch automático del query `['dashboard', slug]` vía el hook useDashboardMutation
- "Ver mi página" y greeting intactos
- 1 archivo modificado principal (dashboard.tsx) + 1 fix de tipado trivial (hours-manager.tsx)



---
Task ID: 5
Agent: Sub Agent (Platform Admin Panel)
Task: Crear el panel administrativo de la plataforma en /admin (para el dueño de Unilink, no para business owners). Muestra todos los negocios, usuarios, métricas globales y herramientas de moderación.

Work Log:
- LEÍDO worklog.md y estructura del proyecto: auth pattern (getCurrentUser + getServerSession), estilo del dashboard (teal brand, shadcn/ui, TanStack Query, motion), schema Prisma (Business.status enum: draft|pending_payment|active|suspended|deleted).
- Helper de admin auth en /src/lib/auth/is-admin.ts:
  - getAdminEmails(): lee ADMIN_EMAILS (CSV) con fallback a ADMIN_EMAIL (string).
  - isAdminEmail(email): case-insensitive lookup contra la lista de admins.
  - getAdminUser(): combina getServerSession(authOptions) + isAdminEmail → devuelve {id, email, name} o null.
  - requireAdmin(): throws 'FORBIDDEN' si no es admin (útil en server components).
  - logAdminAction(): log ligero para auditoría (console.log con email del admin).
- Page gate en /src/app/admin/page.tsx (server component, force-dynamic):
  - Si no hay sesión → redirect('/login?callbackUrl=/admin')
  - Si sesión existe pero email no es admin → redirect('/dashboard') (no mostramos el panel a no-admins)
  - Si es admin → renderiza <AdminPanel adminEmail=... adminName=... />
  - Middleware (/src/middleware.ts) ya incluye '/admin/:path*' en matcher → redirects no-logueados a /login automáticamente.
- AdminPanel (/src/components/admin/admin-panel.tsx, ~700 líneas):
  - Sticky header con logo "U" + "Unilink" + Badge "Admin" (ShieldAlert icon, color teal) para distinguir del dashboard regular.
  - Botón "Volver a mi dashboard" (link a /dashboard) con icono ArrowLeft.
  - Saludo "Panel administrativo · Plataforma" + Badge "Admin".
  - Nav tabs (4) con scroll horizontal en mobile (mismo patrón que dashboard): Negocios, Usuarios, Métricas, Moderación.
  - AnimatePresence para transiciones entre tabs.
  - Footer © Unilink · Panel administrativo.
  
  Tab Negocios:
  - Toolbar con input de búsqueda (nombre/slug/email/owner) + filtros rápidos por status (Todos/Activo/Borrador/Suspendido/Eliminado).
  - Tabla (shadcn Table) con columnas: Negocio (avatar inicial + nombre + slug), Owner (nombre + email), Categoría, Status badge, Visitas (page_view count), Citas (pending+confirmed), Creado (fecha), Acciones.
  - Acciones por fila (iconos como buttons): Ver página (link /{slug} en nueva tab), Ver dashboard (link /dashboard?slug={slug}), Activar (check verde, si no active/deleted), Suspender (ban ámbar, si active), Restaurar (rotate-ccw azul, si deleted), Eliminar (trash rojo con confirmación AlertDialog → soft-delete).
  
  Tab Usuarios:
  - Input de búsqueda por nombre/email.
  - Tabla: Usuario (avatar inicial + nombre + email), Rol (Admin/Usuario badge), Negocios (count), Registrado (fecha).
  - Admins identificados con Badge "Admin" (ShieldAlert icon).
  
  Tab Métricas:
  - Grid de 8 StatCards (2/3/4 cols responsive): Usuarios, Negocios, Negocios activos, Visitas totales, Citas totales, Reservas 7 días, Suspendidos, Eliminados.
  - Cada StatCard tiene icono con color de fondo, valor grande tabular-nums, subtitle con breakdown (e.g. "+N esta semana · +M este mes").
  - Card "Eventos por tipo" con barras animadas (motion.div) mostrando top 8 tipos de evento con icono + label + barra + count.
  
  Tab Moderación:
  - Banner rojo informativo con count de negocios suspendidos.
  - Si no hay suspendidos → Card con CheckCircle2 verde "Todo en orden".
  - Si hay → lista de ModerationCards: avatar, nombre + status badge + meta (slug, owner email, visitas, citas), botones Ver/Dashboard/Activar/Eliminar (con confirmación).

APIs (todas con `export const dynamic = 'force-dynamic'`, todas verifican admin via getAdminUser() → 403 si no admin):
- /api/admin/stats (GET): Promise.all de 15 contadores Prisma (users, businesses por status, page_views, appointments por status, growth 7d/30d) + groupBy de eventType. Devuelve {totals, growth, eventsByType}.
- /api/admin/businesses (GET): lista todos los negocios (excluye deleted salvo ?status=deleted) con owner {id,email,name}. Por cada negocio, paraleliza 3 count() para page_views + appointments activas + confirmed. Devuelve array con metrics por negocio. Soporta ?status= filter.
- /api/admin/users (GET): lista todos los usuarios con _count.businesses y flag isAdmin (comparando con email del admin autenticado). Ordenados por createdAt desc.
- /api/admin/businesses/[id]/status (PATCH): body {status}. Valida status contra enum (draft|pending_payment|active|suspended|deleted) → 400 si inválido. Verifica existencia del negocio → 404 si no existe. Si status no cambió → noChange: true. Update + logAdminAction() para auditoría. Devuelve {ok, business}.

Mutaciones client-side:
- useChangeBusinessStatus hook (useMutation): PATCH /api/admin/businesses/[id]/status, invalida ['admin','businesses'] y ['admin','stats'] en onSuccess, toast.success con label del nuevo status, toast.error en failure.
- 3 useQuery hooks: ['admin','businesses'], ['admin','users'], ['admin','stats'].

Archivos creados:
- /src/lib/auth/is-admin.ts (helper, 65 líneas)
- /src/app/admin/page.tsx (server component, 31 líneas)
- /src/components/admin/admin-panel.tsx (client component, ~750 líneas)
- /src/app/api/admin/stats/route.ts (GET, 100 líneas)
- /src/app/api/admin/businesses/route.ts (GET, 80 líneas)
- /src/app/api/admin/users/route.ts (GET, 45 líneas)
- /src/app/api/admin/businesses/[id]/status/route.ts (PATCH, 75 líneas)

Archivos modificados:
- /.env: añadidas variables ADMIN_EMAILS (CSV) y ADMIN_EMAIL (string, legacy). Ambas con valor fernanda@studiofernanda.mx para dev.

Verificación:
- TypeScript: `bunx tsc --noEmit` → 0 errores en archivos admin. (Errores preexistentes en /examples, /skills, /src/app/[slug]/page.tsx, /src/app/api/analytics/route.ts, /src/components/microsite/services-section.tsx — ninguno relacionado con esta task.)
- Lint: `bun run lint` → exit 0, sin errores ni warnings nuevos.
- Smoke test (curl + cookies NextAuth):
  - Sin sesión: /api/admin/stats → 403 ✓, /api/admin/businesses → 403 ✓, /api/admin/users → 403 ✓, /admin → 307 a /api/auth/signin ✓
  - Login fernanda@studiofernanda.mx / demo1234 → 200, sesión cookie set ✓
  - GET /api/admin/stats → 200 con {totals: {users:3, businesses:2, activeBusinesses:2, pageViews:6, appointments:3, confirmedAppointments:2}, growth: {businesses7d:2, users7d:3, bookings7d:3}, eventsByType: {...10 tipos...}} ✓
  - GET /api/admin/businesses → 200 con 2 negocios, cada uno con owner + metrics {pageViews, appointments, confirmedAppointments} ✓
  - GET /api/admin/businesses?status=suspended → 200 con lista filtrada ✓
  - GET /api/admin/users → 200 con 3 usuarios, fernanda marcada como isAdmin:true ✓
  - PATCH /api/admin/businesses/{id}/status {status:'suspended'} → 200 {ok:true, business:{status:'suspended'}} ✓
  - GET /api/admin/businesses?status=suspended → ahora incluye 1 negocio ✓
  - PATCH /api/admin/businesses/{id}/status {status:'active'} → 200 reactivado ✓
  - PATCH /api/admin/businesses/{id}/status {status:'bogus'} → 400 {error:'invalid status', valid:[...]} ✓
  - GET /admin (con sesión admin) → 200, HTML contiene: "Unilink", Badge "Admin" (×2: header + h1), tabs "Negocios", "Usuarios", "Métricas", "Moderación", link "Volver a mi dashboard" ✓

Stage Summary:
- Panel administrativo completo en /admin (solo para emails en ADMIN_EMAILS/ADMIN_EMAIL, fallback a /dashboard si no es admin).
- 4 tabs funcionales con data via TanStack Query: Negocios (tabla con búsqueda + filtros + acciones activar/suspender/eliminar), Usuarios (tabla con rol admin/usuario), Métricas (8 stat cards + breakdown de eventos por tipo con barras animadas), Moderación (lista de suspendidos con acciones).
- 4 APIs admin (stats, businesses, users, businesses/[id]/status) — todas verifican admin via getAdminUser() y retornan 403 si no.
- Patrón de auth reutilizable: /src/lib/auth/is-admin.ts con getAdminUser/requireAdmin/isAdminEmail — útil para futuras features admin.
- Soft-delete preserva integridad referencial: PATCH status='deleted' no borra filas, solo marca. Restaurable desde el panel.
- Logs de auditoría básicos via logAdminAction (console.log con email del admin + acción + metadata).
- Diseño consistente con el dashboard: teal brand color, shadcn/ui (Card, Badge, Button, Table, Input, AlertDialog, Skeleton), motion para transiciones, sticky header, nav tabs con scroll horizontal mobile-friendly.
