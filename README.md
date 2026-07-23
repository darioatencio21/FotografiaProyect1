# Miriam Campos Photography

> Plataforma profesional de portafolio y suite administrativa para un estudio fotográfico de lujo. Construida como una Single Page Application (SPA) con React, TypeScript y Supabase.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Identidad Visual](#identidad-visual)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Empezando](#empezando)
- [Scripts](#scripts)
- [Arquitectura y Flujo](#arquitectura-y-flujo)
- [Vistas](#vistas)
- [Internacionalización](#internacionalización)
- [Workflows de GitHub](#workflows-de-github)
- [Despliegue](#despliegue)
- [Variables de Entorno](#variables-de-entorno)

---

## Descripción

Miriam Campos Photography es una aplicación web completa que funciona como **portafolio público interactivo** y como **suite de gestión empresarial** para un estudio fotográfico de alta gama con estética editorial premium.

### Portafolio público

- **Hero split-screen** con animación Ken Burns y gradiente de 3 capas
- **Galería Pixieset integrada** — 23 galerías externas enlazadas desde Pixieset con vista en grid y hover overlay
- **Feed de Instagram** en vivo con fotos y enlace directo al perfil
- **Sección Sobre mí editorial** — fotografía en columna, biografía fluida, línea de tiempo vertical con hitos profesionales (2010–2025) y 3 pilares de filosofía
- **Sección de estadísticas** con Count Up animado al entrar en viewport
- **Paquetes destacados** en la home con enlace directo a reserva
- **Testimonios** — grid de experiencias con formulario público de envío
- **FAQ** con acordeón animado
- **Formulario de contacto** con EmailJS y datos del estudio
- **Portal de cliente con links compartibles** — área protegida por código de acceso donde los clientes pueden ver, seleccionar, descargar fotos y solicitar impresiones. Auto-login vía query param `?gallery=PASSCODE`
- **Páginas legales** — Política de Privacidad y Términos del Servicio multi-idioma

### Suite administrativa (CMS)

Panel completo accesible vía Supabase Auth con las siguientes secciones:

- **Dashboard** — analytics con gráficos de ingresos y tráfico, micro-stats (ingresos estimados, tasa de conversión, sesiones, visitantes)
- **Fotografías** — CRUD completo con drag & drop upload, compresión automática a WebP, editor de metadatos EXIF, categorías, featured toggle
- **Testimonios** — CRUD con aprobación, edición y eliminación
- **Cola de Reservas** — tabla expandible con estado (pending/accepted/rejected), datos de contacto, cuestionario creativo, gestión de montos (depósito, restante, gastos de viaje), firma de contratos y marcado como pagado
- **Facturas** — listado con estado (paid/partial/unpaid/cancelled) y detalle de items
- **Paquetes Fotográficos** — CRUD con nombre bi-idioma, precio, depósito, duración, descripción, beneficios, nota de viaje, imagen por upload, orden, activo y destacado
- **Tipos de Sesión** — CRUD con nombre bi-idioma, descripción, ícono, imagen y orden
- **Bandeja de Entrada** — mensajes de contacto con reply-to via mailto, marcar como leído
- **Configuración SEO** — título, descripción, Open Graph, Twitter Card, keywords, robots.txt, héroe izquierda/derecha con upload de imágenes
- **Biografía y Perfil** — nombre, avatar con upload, título, cámara/lente preferida, biografía bi-idioma
- **Clientes y Galerías** — CRUD de cuentas con fotos de prueba (proofs), upload múltiple con compresión, envío de link compartible por email, generación de passcode
- **Configuración de Correo** — EmailJS service ID, template ID, public key, receiver email, auto-respuesta personalizable

### Notificaciones en tiempo real

- Badge con contador de pendientes (reservas `pending` y mensajes sin leer) en sidebar
- Toast dorado al recibir nueva reserva o mensaje vía Supabase Realtime
- Notificación de escritorio (API Notification) para nuevas reservas y mensajes

### Checkout y contratos

- **Checkout simulado con Stripe** — modal con formulario de tarjeta, validación, animación de procesamiento 3D Secure, comprobante de transacción con tx hash
- **Flujo completo de contratos** — paso de pago → firma de contrato digital (cliente) → contra-firma (fotógrafa en CMS) → recibo de factura
- **Contratos de boda** con campos específicos (novia, novio, ceremonia, recepción)
- **Contratos de sesión** con datos generales del cliente
- **Generación automática de facturas** al completar el pago

### Otras características

- **Notificaciones por email** — EmailJS integrado en formulario de contacto, reservas y envío de links de galería, con auto-respuesta configurable al cliente
- **Multi-idioma** — Español e Inglés con cambio en tiempo real
- **Cursor personalizado** con física Spring que cambia de estado sobre enlaces, botones e imágenes
- **Navbar con drawer móvil** — apertura mediante pastilla deslizable dorada con drag gesture
- **Persistencia offline** — datos cacheados en localStorage con prefijo `aurea_`. Supabase como fuente de verdad con sincronización en segundo plano
- **Seeding automático** desde mock data cuando las tablas están vacías
- **Migración de datos** — reparación automática de entidades HTML escapadas
- **Pixieset integrado** — redirección a galerías externas de Pixieset para entrega de fotos a clientes
- **Newsletter** — suscripción simulada en el footer

---

## Identidad Visual

| Atributo         | Valor                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Fondo principal  | Beige cálido (`#EFD2B4`)                                              |
| Fondo secundario | Beige claro (`#F7E9DA`)                                               |
| Tarjetas         | Crema (`#FAF4EE`)                                                     |
| Texto principal  | Tinta oscura (`#3A3028`)                                              |
| Texto hero       | Blanco cálido (`#F8F6F2`) — usado sobre gradientes oscuros en hero    |
| Acento           | Bronce (`#8B5E3C`, hover `#6E4630`)                                   |
| Bordes           | Beige medio (`#D8C0A8`)                                               |
| Overlay          | Tinta oscura (`#3A3028`) — usado en gradientes de superposición       |
| Tipografía       | `Playfair Display` (serif títulos), `Inter` (sans-serif), `JetBrains Mono` (mono) |

### Filosofía de diseño

- Estética editorial inspirada en Leica, Hasselblad, Aesop, Kinfolk
- Sin sombras en tarjetas, botones o modales — apuesta por bordes finos y espacio negativo
- Logo SVG con monograma "mc", anillos dorados concéntricos y rosa como acento
- Animaciones sutiles con scroll (fade-up, divisores animados, stagger)

---

## Funcionalidades

| Funcionalidad                    | Descripción                                                                 |
| -------------------------------- | --------------------------------------------------------------------------- |
| Hero split-screen                | Animación Ken Burns, 2 imágenes en desktop, 1 en mobile, gradiente 3 capas  |
| Galería Pixieset                 | 23 galerías enlazadas externamente con hover overlay y fallback placeholder |
| Feed de Instagram                | Grid de fotos desde Instagram con overlay y enlace al perfil                |
| Sobre mí editorial               | Timeline vertical (2010–2025), biografía fluida, 3 pilares de filosofía     |
| Estadísticas animadas            | Count Up con 2000+ sesiones, 15+ años, 98% satisfacción                     |
| Portafolio con filtros           | 16 categorías de fotografía, búsqueda por texto, lightbox con descarga      |
| Lightbox premium                 | Vista completa con EXIF, favoritos, descarga, compartir, modo RAW vs editado |
| Sistema de reservas 2 pasos      | Categoría de sesión → paquetes → formulario con fecha, horario, contacto    |
| Reservas de boda                 | Formulario extendido con datos de novia, novio, ceremonia y recepción       |
| Checkout Stripe simulado         | Modal de pago con animación 3D Secure y comprobante de transacción          |
| Contratos digitales              | Firma del cliente + contra-firma del fotógrafo, cláusulas por tipo          |
| Facturación automática           | Generación de invoice al completar pago, con número único y estado          |
| Portal de cliente                | Galería privada protegida por passcode, favoritos, descarga, selección de prints |
| Link compartible                 | `?gallery=PASSCODE` para acceso directo al portal del cliente               |
| CMS administrativo               | Dashboard, fotografías, testimonios, reservas, paquetes, sesiones, mensajes |
| SEO configurable                 | Título, descripción, Open Graph, Twitter Card, hero images, keywords        |
| Perfil del fotógrafo             | Nombre, avatar, biografía multi-idioma, equipo preferido                    |
| Notificaciones en tiempo real    | Supabase Realtime para nuevas reservas y mensajes con desktop notification  |
| EmailJS integrado                | Notificaciones al admin y auto-respuesta al cliente en contacto y reservas  |
| Multi-idioma                     | Español e Inglés con cambio en tiempo real en toda la interfaz              |
| Cursor personalizado             | Física Spring, cambia de estado (view/close/drag) sobre elementos           |
| Drawer móvil                     | Pastilla dorada deslizable con drag gesture para abrir menú                 |
| Persistencia offline             | localStorage con prefijo `aurea_`, fallback a mock data                     |
| Subida de imágenes con compresión| Drag & drop, compresión a WebP, upload a Supabase Storage                   |
| Galerías de pruebas (proofs)     | Upload múltiple, compresión, análisis (sharpness, composition, emotion)     |

---

## Stack Tecnológico

| Categoría           | Tecnología                          | Versión |
| ------------------- | ----------------------------------- | ------- |
| Framework           | React                               | 19      |
| Lenguaje            | TypeScript                          | ~5.8    |
| Build Tool          | Vite                                | 6       |
| Estilos             | Tailwind CSS                        | 4       |
| Animaciones         | Motion (ex Framer Motion)           | 12      |
| Iconos              | Lucide React                        | 0.546   |
| Base de datos       | Supabase (PostgreSQL)               | —       |
| Storage             | Supabase Storage                    | —       |
| Auth                | Supabase Auth                       | —       |
| Hosting             | Vercel                              | —       |
| Email               | EmailJS                             | —       |
| Galerías externas   | Pixieset                            | —       |
| CI/CD               | GitHub Actions                      | —       |

---

## Estructura del Proyecto

```
├── public/
│   └── favicon.svg                    # Favicon del estudio
├── supabase/
│   └── migrations/
│       └── 001_init.sql               # Esquema completo de tablas PostgreSQL + RLS + Storage policies
├── src/
│   ├── App.tsx                        # Componente raíz: estado global, routing, lógica de datos y UI principal
│   ├── main.tsx                       # Punto de entrada de React
│   ├── index.css                      # Tailwind v4, tema beige/dorado, fuentes, estilos globales
│   ├── types.ts                       # Interfaces TypeScript para todos los modelos de datos
│   ├── components/
│   │   ├── Header.tsx                 # Navbar con drawer móvil, selector de idioma, acceso a backoffice
│   │   ├── Footer.tsx                 # Footer con newsletter, redes sociales, enlaces legales
│   │   ├── CustomCursor.tsx           # Cursor animado con física Spring
│   │   ├── Lightbox.tsx               # Visor de fotos fullscreen con EXIF, descarga, modo comparación RAW
│   │   ├── BookingCalendar.tsx        # Formulario de reserva multi-paso con pago, contrato y factura
│   │   ├── ClientPortal.tsx           # Portal de pruebas protegido por código con galería privada
│   │   ├── AboutSection.tsx           # Sección Sobre mí editorial con timeline y filosofía
│   │   ├── PixiesetGallery.tsx        # Galería externa de Pixieset con 23 galerías enlazadas
│   │   ├── InstagramFeed.tsx          # Feed de Instagram integrado
│   │   ├── ContractView.tsx           # Vista de contrato con firma digital (boda/sesión)
│   │   ├── InvoiceReceipt.tsx         # Recibo de factura imprimible
│   │   ├── StripeCheckout.tsx         # Modal de pago simulado con Stripe
│   │   ├── AdminCMS.tsx               # Panel de administración completo con sidebar y tabs
│   │   ├── AdminPackagesTab.tsx       # CRUD de paquetes fotográficos
│   │   ├── AdminProfileTab.tsx        # Editor de perfil del fotógrafo
│   │   ├── AdminSEOTab.tsx            # Configuración SEO
│   │   ├── LegalViews.tsx             # Política de Privacidad y Términos del Servicio
│   │   └── Logo.tsx                   # Logotipo SVG del estudio
│   ├── lib/
│   │   ├── supabase.ts                # Cliente Supabase (anon key) con limpieza de sesiones stale
│   │   ├── db.ts                      # Capa CRUD: queries, storage, auth, seeding automático
│   │   └── sanitize.ts               # Funciones de sanitización de texto, email, URL, teléfono
│   └── data/
│       └── mockData.ts                # Datos iniciales, traducciones (100+ claves por idioma), fallback offline
├── scripts/
│   ├── seed.ts                        # Siembra datos de analytics vía service_role
│   ├── setup-buckets.ts               # Crea buckets de Storage en Supabase
│   └── apply-migration.ts             # Aplica migración SQL (fallback)
├── .github/
│   ├── dependabot.yml                 # Actualizaciones semanales de npm y mensuales de Actions
│   └── workflows/
│       ├── ci.yml                     # CI: type-check, audit, build
│       ├── security.yml               # Gitleaks + dependency audit semanal
│       ├── codeql.yml                 # Análisis estático CodeQL semanal
│       ├── deploy.yml                 # Deploy a Vercel (tras CI exitoso)
│       └── release.yml                # Release Please (Conventional Commits)
├── .env.example                       # Plantilla de variables de entorno
├── vercel.json                        # Configuración de deploy en Vercel
├── vite.config.ts                     # Configuración de Vite con React + Tailwind
├── tsconfig.json                      # Configuración de TypeScript
├── package.json                       # Dependencias y scripts
├── index.html                         # Entry point HTML con favicon
└── metadata.json                      # Metadatos de AI Studio
```

---

## Empezando

### Prerrequisitos

- Node.js 18 o superior
- npm
- Proyecto en [Supabase](https://supabase.com) (gratuito, sin tarjeta de crédito)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd miriam-campos-photography

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# Inicializar base de datos: pegar supabase/migrations/001_init.sql
# en el SQL Editor de Supabase y ejecutar

# Crear buckets de Storage
npm run setup:buckets

# (Opcional) sembrar analytics
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Scripts

| Comando              | Descripción                                   |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Inicia el servidor de desarrollo en puerto 3000 |
| `npm run build`      | Genera el build de producción en `dist/`      |
| `npm run preview`    | Previsualiza el build de producción           |
| `npm run lint`       | Ejecuta TypeScript type checking (`tsc --noEmit`) |
| `npm run seed`       | Siembra analytics/stats via Supabase service_role |
| `npm run setup:buckets` | Crea los buckets de Storage en Supabase    |

---

## Arquitectura y Flujo

### Routing

La aplicación utiliza **ruteo por estado** en lugar de React Router. El estado `currentView` en `App.tsx` determina qué componente/vista se renderiza. Transiciones animadas con Motion.

```
App.tsx
└── currentView (state)
    ├── "home"           → Hero split + Stats + Instagram + Paquetes destacados + Booking + Testimonios
    ├── "about"          → AboutSection (biografía, timeline, filosofía)
    ├── "portfolio"      → PixiesetGallery (23 galerías externas)
    ├── "testimonials"   → Grid completo de testimonios + formulario público
    ├── "services"       → Paso 1: Grid de categorías → Paso 2: Paquetes + BookingCalendar
    ├── "client-portal"  → ClientPortal (login por passcode o ?gallery=)
    ├── "faq"            → Acordeón de FAQ multi-idioma
    ├── "contact"        → Formulario de contacto con EmailJS + datos del estudio
    ├── "admin"          → AdminCMS (requiere login Supabase Auth)
    ├── "privacy"        → LegalViews — Política de privacidad
    └── "terms"          → LegalViews — Términos del servicio
```

### Flujo de Datos

```
Supabase (PostgreSQL + Storage + Auth)
    │
    ├── getCollectionWithFallback() / getSingleDocument()
    │   └── Si tabla vacía → seed automático desde mockData
    │   └── Si tabla no existe → marca como missing, usa fallback
    │
    ▼
App.tsx State + localStorage (caché offline, prefijo aurea_)
    │
    ├── Se renderiza la vista correspondiente
    │
    └── Cualquier mutación → saveDocument() / syncCollection() → Supabase
```

1. **Carga inicial**: `App.tsx` fetches todas las tablas de Supabase.
2. **Seeding automático**: Si una tabla está vacía, se seedea con `mockData.ts`.
3. **Fallback**: Si Supabase es inalcanzable, se usan los datos de `mockData.ts`.
4. **Caché offline**: Datos persisten en `localStorage` con prefijo `aurea_`.
5. **Migración automática**: Reparación de entidades HTML escapadas en datos existentes.
6. **Sincronización**: Cada modificación persiste en Supabase.
7. **Admin CMS**: CRUD directo contra Supabase. Notificaciones en tiempo real vía `postgres_changes`.

### Tablas de Base de Datos

| Tabla                 | Propósito                             |
| --------------------- | ------------------------------------- |
| `photographs`         | Fotografías del portafolio            |
| `services`            | Paquetes de servicio                  |
| `testimonials`        | Testimonios de clientes               |
| `blogposts`           | Artículos del blog                    |
| `faqs`                | Preguntas frecuentes                  |
| `bookings`            | Solicitudes de reserva                |
| `messages`            | Mensajes de contacto                  |
| `clientaccounts`      | Cuentas de clientes con fotos proof   |
| `photography_packages`| Paquetes fotográficos configurables   |
| `session_categories`  | Categorías de sesión                  |
| `invoices`            | Facturas generadas                    |
| `seo`                 | Metadatos SEO globales (singleton)    |
| `profile`             | Perfil del fotógrafo (singleton)      |
| `bookingconfig`       | Configuración de reservas (singleton) |
| `emailconfig`         | Configuración de EmailJS (singleton)  |
| `analytics`           | Estadísticas del dashboard (singleton)|

### Almacenamiento (Storage)

| Bucket                | Propósito                             |
| --------------------- | ------------------------------------- |
| `photographs`         | Fotografías del portafolio            |
| `proofs`              | Fotos de prueba para clientes         |
| `profile`             | Avatar del fotógrafo                  |
| `seo`                 | Imágenes del hero y OG                |
| `packages`            | Imágenes de paquetes                  |
| `session_categories`  | Thumbnails de categorías              |

Todos los buckets son públicos (lectura). La escritura está protegida por autenticación.

### Autenticación

- **Admin**: Supabase Auth con email y contraseña. No se guardan credenciales en localStorage.
- **Client Portal**: Protegido por código de acceso validado contra `clientaccounts`. Acceso directo vía `?gallery=PASSCODE`.

---

## Vistas

| Vista          | Ruta (state)   | Descripción                                                                    |
| -------------- | -------------- | ------------------------------------------------------------------------------ |
| Inicio         | `home`         | Hero split-screen, estadísticas Count Up, Instagram feed, paquetes destacados, booking simplificado, testimonios |
| Sobre mí       | `about`        | Diseño editorial, biografía fluida, timeline vertical (2010–2025), 3 pilares filosofía |
| Portafolio     | `portfolio`    | Galería Pixieset con 23 galerías externas y buscador de galería personal       |
| Testimonios    | `testimonials` | Grid completo de experiencias + formulario público de envío                    |
| Servicios      | `services`     | Paso 1: Grid de categorías de sesión → Paso 2: Paquetes por categoría + calendario de reservas con pago y contrato |
| Portal Cliente | `client-portal`| Galería privada protegida por passcode, favoritos, descarga, prints, contrato, facturas, testimonio |
| FAQ            | `faq`          | Acordeón de preguntas frecuentes multi-idioma                                  |
| Contacto       | `contact`      | Formulario con EmailJS + datos del estudio + WhatsApp                          |
| Admin          | `admin`        | CMS completo con 13 tabs: dashboard, fotos, testimonios, reservas, paquetes, facturas, sesiones, mensajes, SEO, perfil, clientes, email |
| Privacidad     | `privacy`      | Política de privacidad multi-idioma con 6 secciones                            |
| Términos       | `terms`        | Términos del servicio multi-idioma con 6 cláusulas                             |

---

## Internacionalización

Sistema multi-idioma conmutado via `lang` state (`es` | `en`).

### Traducciones de interfaz

Definidas en `TRANSLATIONS` dentro de `src/data/mockData.ts` con más de 100 claves por idioma que cubren navegación, hero, biografía, servicios, testimonios, estadísticas, FAQ, booking, contacto, SEO, contrato y facturación.

### Traducciones de contenido

| Modelo               | Campos traducidos                          |
| -------------------- | ------------------------------------------ |
| `Photograph`         | `title_es`, `description_es`              |
| `Service`            | `title_es`, `description_es`, `duration_es`, `includes_es` |
| `FAQ`                | `question_es`, `answer_es`                |
| `PhotographyPackage` | `name_es`, `description_es`, `duration_es`, `priceFromText_es`, `buttonText_es`, `travelNote_es`, `benefits_es` |
| `PhotographerProfile`| `aboutTitle_es`, `aboutText1_es`, `aboutText2_es` |
| `SessionCategory`    | `name_es`, `description_es`               |
| `Milestone`          | `title_es`, `description_es`              |

### Funciones helper

```typescript
function getPhotoTitle(photo: Photograph, lang: string): string
function getPhotoDescription(photo: Photograph, lang: string): string
```

Ambas retornan el valor traducido según el idioma activo, con fallback al valor por defecto (inglés).

---

## Workflows de GitHub

### CI (`ci.yml`)
- TypeScript type checking (`tsc --noEmit`)
- `npm audit` (high severity)
- Build de producción
- Se ejecuta en cada PR y push a `main`

### Seguridad (`security.yml`)
- **Gitleaks**: escanea el historial completo en busca de secretos filtrados
- **Dependency audit**: auditoría de dependencias de producción
- Ejecución semanal (lunes) y en cada PR/push a `main`

### CodeQL (`codeql.yml`)
- Análisis estático de código JavaScript/TypeScript
- Ejecución semanal (lunes) y en cada PR/push a `main`

### Deploy (`deploy.yml`)
- Se ejecuta automáticamente tras CI exitoso en `main`
- Build y deploy a Vercel usando `vercel deploy --prebuilt --prod`
- Requiere secretos: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Release Please (`release.yml`)
- Crea PR de versión automática basado en Conventional Commits
- Detecta `feat:`, `fix:`, `BREAKING CHANGE:` para determinar el bump semántico

### Dependabot
- `npm`: actualizaciones semanales (máx. 10 PRs abiertos)
- `github-actions`: actualizaciones mensuales (máx. 5 PRs abiertos)

---

## Despliegue

El proyecto está configurado para desplegarse en **Vercel** mediante GitHub Actions, después de que CI valide el cambio.

### Deploy automático

El workflow `deploy.yml` se ejecuta automáticamente cuando CI completa exitosamente en `main`. Vercel detecta Vite y aplica `vercel.json`:

- **Build**: `npm run build`
- **Output**: `dist/`
- **SPA rewrites**: Todas las rutas redirigen a `index.html`

Configura estos secretos en GitHub (`Settings → Secrets and variables → Actions`):

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Desactiva el deploy automático por integración Git en Vercel para no publicar dos veces el mismo commit. Protege `main` y exige los checks `CI`, `Security` y `CodeQL` antes de aceptar un pull request.

### Variables de entorno en Vercel

Agregá estas en el dashboard (Project Settings → Environment Variables):

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
APP_URL=https://tu-app.vercel.app
```

### Deploy manual

```bash
npm run build
vercel --prod
```

---

## Variables de Entorno

| Variable                     | Descripción                              | Ejemplo                                       |
| ---------------------------- | ---------------------------------------- | --------------------------------------------- |
| `VITE_SUPABASE_URL`          | URL del proyecto Supabase                | `https://pkdzxqsplfeobhflgmyu.supabase.co`    |
| `VITE_SUPABASE_ANON_KEY`     | Clave anónima (frontend)                 | `eyJhbGciOi...`                               |
| `SUPABASE_SERVICE_ROLE_KEY`  | Clave service_role (solo scripts)        | `eyJhbGciOi...`                               |
| `APP_URL`                    | URL base de la aplicación                | `http://localhost:3000`                        |

Copia `.env.example` a `.env.local` y completa los valores antes de ejecutar la aplicación.

**Importante en Vercel**: Agrega `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `APP_URL` en Project Settings → Environment Variables para los entornos Production, Preview y Development.

**Importante**: `SUPABASE_SERVICE_ROLE_KEY` tiene acceso completo a tu base de datos. Nunca la incluyas en código frontend ni la expongas al navegador. Solo se usa en scripts del lado del servidor (`scripts/seed.ts`, `scripts/setup-buckets.ts`).

---

## Licencia

Todos los derechos reservados — Miriam Campos Photography
