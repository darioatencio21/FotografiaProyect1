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
- [Despliegue](#despliegue)
- [Variables de Entorno](#variables-de-entorno)

---

## Descripción

Miriam Campos Photography es una aplicación web completa que funciona como **portafolio público interactivo** y como **suite de gestión empresarial** para un estudio fotográfico de alta gama con estética editorial premium. Permite a los visitantes explorar galerías de fotos, reservar sesiones en un flujo de 2 pasos (elegir tipo de sesión → ver paquetes), contactar al estudio y acceder a un portal privado de pruebas mediante links compartibles. Del lado administrativo, incluye un CMS completo con dashboard de analytics, gestión de contenido, cola de reservas, bandeja de mensajes con notificaciones en tiempo real, categorías de sesión, paquetes fotográficos configurables y administración de cuentas de clientes.

El proyecto está diseñado para desplegarse en **Vercel** con Supabase (PostgreSQL + Storage + Auth) como backend.

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

- **Estética editorial** inspirada en Leica, Hasselblad, Aesop, Kinfolk, Madi Bence, Folk Studio y portfolios galardonados en Awwwards.
- **Imágenes en blanco y negro por defecto**, revelan color al hacer hover — efecto slow-burn de 800ms con escala `1.04×`.
- **Tarjetas de galería limpias**: sin texto permanente sobre las fotos, solo overlay hover con fade+slide para título y categoría.
- **Gradiente sutíl desde abajo** (`from-overlay/8`) que aparece solo en hover para legibilidad.
- **Hero dual** (split screen en desktop, single en mobile) con gradiente de 3 capas y animación Ken Burns via Motion.
- **Sección de estadísticas** con Count Up al entrar en viewport, editoriale triptych layout (3 columnas en desktop, 1 en mobile).
- **Shadows eliminados** de todas las tarjetas, botones y modales — apuesta por bordes finos y espacio negativo.
- **Sección Sobre mí con diseño editorial**: fotografía en columna al inicio, biografía fluida, línea de tiempo vertical con hitos profesionales reales y sección de filosofía con 3 pilares. Animaciones sutiles con scroll (fade-up, divisores animados, stagger en timeline). Sin tarjetas, sin bordes redondeados, sin badges.

---

## Funcionalidades

- **Portafolio interactivo** — Galería masonry con filtros por categoría (16 categorías), búsqueda multilingual y lightbox a pantalla completa con descarga.
- **Sistema de reservas en 2 pasos** — Selección de tipo de sesión → paquetes por categoría, con nota de gastos de viaje por paquete. Formulario simplificado con fecha, horario y datos de contacto.
- **Portal de cliente con links compartibles** — Área protegida por código de acceso donde los clientes pueden ver, seleccionar y descargar sus fotos, y solicitar impresiones. Cada cliente tiene un link directo tipo `?gallery=PASSCODE` que puede compartirse por WhatsApp/email.
- **Sección Sobre mí editorial** — Diseño tipo revista con fotografía en columna, biografía fluida, línea de tiempo vertical con hitos profesionales reales (2010–2025) y filosofía con 3 pilares.
- **CMS administrativo** — Dashboard con analytics, CRUD completo de fotografías (con drag & drop y compresión), servicios, testimonios, blog, FAQ, mensajería, SEO, perfil del fotógrafo, categorías de sesión, paquetes fotográficos (agrupados por categoría con upload de imágenes), cuentas de clientes con fotos de prueba, editor de sesiones y notificaciones en tiempo real. Con sidebar responsive y botón flotante para navegación móvil.
- **Notificaciones en tiempo real** — Badge con contador de pendientes por estado (reservas `pending` y mensajes sin leer) en sidebar desktop y drawer mobile, toast dorado y notificación de escritorio (API Notification) para nuevas reservas y mensajes vía Supabase Realtime. Marcado automático como leído al hacer clic.
- **Checkout simulado** — Modal de pago con Stripe simulado, con animación de procesamiento y comprobante de transacción.
- **Notificaciones por email** — Integración con EmailJS para notificaciones al administrador y auto-respuestas al cliente desde el formulario de contacto, reservas y envío de links de galería.
- **Multi-idioma** — Soporte completo para Español, English y Português con cambio en tiempo real en toda la interfaz.
- **Cursor personalizado** — Cursor animado con física Spring que cambia de estado sobre elementos interactivos.
- **Navbar scrolleable** — Barra de navegación solid, menú mobile tipo drawer con apertura mediante pastilla deslizable dorada.
- **Persistencia offline** — Datos cacheados en localStorage con prefijo `aurea_`. Supabase como fuente de verdad con sincronización en segundo plano.

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
| CI/CD               | Vercel (automático desde GitHub)    | —       |

---

## Estructura del Proyecto

```
├── public/
├── supabase/
│   └── migrations/
│       └── 001_init.sql              # Esquema de tablas PostgreSQL + RLS
├── src/
│   ├── App.tsx                       # Componente raíz: estado global, routing y lógica de datos
│   ├── main.tsx                      # Punto de entrada de React
│   ├── index.css                     # Configuración de Tailwind, tema (beige), fuentes y estilos globales
│   ├── types.ts                      # Interfaces TypeScript para todos los modelos de datos
│   ├── components/
│   │   ├── Header.tsx                # Barra de navegación con menú drawer, pastilla deslizable y selector de idioma
│   │   ├── Footer.tsx                # Pie de página con newsletter, redes sociales y enlaces legales
│   │   ├── CustomCursor.tsx          # Cursor animado personalizado con física Spring
│   │   ├── Lightbox.tsx              # Visor de fotos a pantalla completa con EXIF y acciones
│   │   ├── BookingCalendar.tsx       # Formulario de reserva en 3 pasos
│   │   ├── ClientPortal.tsx          # Portal de pruebas protegido por código
│   │   ├── AboutSection.tsx          # Sección Sobre mí con diseño editorial, timeline vertical y filosofía
│   │   ├── AdminCMS.tsx              # Panel de administración completo
│   │   ├── StripeCheckout.tsx        # Modal de pago simulado con Stripe
│   │   ├── LegalViews.tsx            # Páginas de Política de Privacidad y Términos
│   │   └── Logo.tsx                  # Logotipo SVG del estudio
│   ├── lib/
│   │   ├── supabase.ts               # Cliente Supabase (anon key)
│   │   ├── db.ts                     # Capa CRUD: queries, storage, auth (reemplaza firebase.ts)
│   │   └── sanitize.ts               # Funciones de sanitización de texto
│   └── data/
│       └── mockData.ts               # Datos de inicialización, fallback y diccionario multi-idioma
├── scripts/
│   ├── seed.ts                       # Siembra datos iniciales (analytics) vía service_role
│   ├── setup-buckets.ts              # Crea buckets de Storage en Supabase
│   └── apply-migration.ts            # Aplica migración SQL (fallback)
├── .env.example                      # Plantilla de variables de entorno
├── vercel.json                       # Configuración de deploy en Vercel
├── vite.config.ts                    # Configuración de Vite
├── tsconfig.json                     # Configuración de TypeScript
├── package.json                      # Dependencias y scripts
├── index.html                        # Entry point HTML
└── metadata.json                     # Metadatos de AI Studio
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

La aplicación utiliza **ruteo por estado** en lugar de React Router. El estado `currentView` en `App.tsx` determina qué componente/vista se renderiza. Las transiciones entre vistas se realizan mediante animaciones de Motion.

```
App.tsx
└── currentView (state)
    ├── "home"          → Hero + Stats + Portfolio Teaser
    ├── "about"         → Biografía + Premios
    ├── "portfolio"     → Galería completa (masonry)
    ├── "services"      → Servicios + Booking
    ├── "client-portal" → Portal de pruebas
    ├── "faq"           → Preguntas frecuentes
    ├── "contact"       → Formulario de contacto
    ├── "admin"         → CMS (requiere login)
    ├── "privacy"       → Política de privacidad
    └── "terms"         → Términos del servicio
```

### Flujo de Datos

```
Supabase (PostgreSQL + Storage + Auth)
    │
    ├── getCollectionWithFallback() / getSingleDocument()
    │   └── Si colección vacía → seed automático desde mockData
    │
    ▼
App.tsx State + localStorage (caché offline, prefijo aurea_)
    │
    ├── Se renderiza la vista correspondiente
    │
    └── Cualquier mutación → saveDocument() / syncCollection() → Supabase
```

1. **Carga inicial**: `App.tsx` fetches todas las tablas de Supabase mediante `getCollectionWithFallback()`.
2. **Seeding automático**: Si una tabla está vacía, se seedea con los datos de `mockData.ts` y luego se lee de vuelta.
3. **Fallback**: Solo si Supabase es inalcanzable (error de red) se usan los datos de `mockData.ts` como respaldo.
4. **Caché offline**: Los datos se persisten en `localStorage` con claves con prefijo `aurea_`.
5. **Sincronización**: Cada modificación (crear, editar, eliminar) llama a `saveDocument()` o `syncCollection()` para persistir en Supabase.
6. **Admin CMS**: El panel administrativo realiza operaciones CRUD directas contra Supabase. Las notificaciones en tiempo real usan Supabase Realtime (`postgres_changes`).

### Tablas de Base de Datos

| Tabla                 | Propósito                       |
| --------------------- | ------------------------------- |
| `photographs`         | Fotografías del portafolio       |
| `services`            | Paquetes de servicio            |
| `testimonials`        | Testimonios de clientes         |
| `blogposts`           | Artículos del blog              |
| `faqs`                | Preguntas frecuentes            |
| `bookings`            | Solicitudes de reserva          |
| `messages`            | Mensajes de contacto            |
| `clientaccounts`      | Cuentas de clientes             |
| `photography_packages` | Paquetes fotográficos          |
| `session_categories`  | Categorías de sesión            |
| `seo`                 | Metadatos SEO globales          |
| `profile`             | Perfil del fotógrafo            |
| `bookingconfig`       | Configuración de reservas       |
| `emailconfig`         | Configuración de EmailJS        |
| `analytics`           | Estadísticas del dashboard      |

### Almacenamiento (Storage)

Las imágenes subidas desde el CMS se guardan en buckets de Supabase Storage:

| Bucket                | Propósito                        |
| --------------------- | -------------------------------- |
| `photographs`         | Fotografías del portafolio       |
| `proofs`              | Fotos de prueba para clientes    |
| `profile`             | Avatar del fotógrafo             |
| `seo`                 | Imágenes del hero y OG           |
| `packages`            | Imágenes de paquetes             |
| `session_categories`  | Thumbnails de categorías         |

Todos los buckets son públicos (lectura) para que las URLs funcionen en el frontend. La escritura está protegida por autenticación.

### Autenticación

- **Admin**: El acceso usa exclusivamente Supabase Auth con el correo real del usuario. No se guardan credenciales ni indicadores de sesión administrativa en `localStorage`.
- **Client Portal**: Protegido por código de acceso validado contra la tabla `clientaccounts`. Acceso directo mediante link compartible con query param `?gallery=PASSCODE`.

---

## Vistas

| Vista          | Ruta (state)   | Descripción                                                          |
| -------------- | -------------- | -------------------------------------------------------------------- |
| Inicio         | `home`         | Hero split-screen con Ken Burns, estadísticas con Count Up, 3 teasers |
| Sobre mí       | `about`        | Diseño editorial con foto en columna, biografía fluida, línea de tiempo vertical con hitos profesionales (2010–2025) y 3 pilares de filosofía. Animaciones scroll. Sin tarjetas |
| Portafolio     | `portfolio`    | Galería masonry con hover grayscale→color, filtros, búsqueda, lightbox |
| Servicios      | `services`     | Flujo 2 pasos: grid de categorías de sesión → paquetes por categoría con nota de viaje + calendario de reservas |
| Portal Cliente | `client-portal` | Galería privada protegida por código con selección, descarga, link compartible y auto-login vía `?gallery=` |
| FAQ            | `faq`          | Acordeón de preguntas frecuentes multi-idioma                        |
| Contacto       | `contact`      | Formulario con EmailJS y datos del estudio                           |
| Admin          | `admin`        | CMS completo con dashboard analytics, CRUD y configuración           |
| Privacidad     | `privacy`      | Política de privacidad multi-idioma                                  |
| Términos       | `terms`        | Términos del servicio multi-idioma                                   |

---

## Internacionalización

Sistema multi-idioma conmutado via `lang` state (`es` | `en` | `pt`).

### Traducciones de interfaz

Definidas en `TRANSLATIONS` dentro de `src/data/mockData.ts` con más de 100 claves por idioma que cubren navegación, hero, biografía, servicios, testimonios, estadísticas, FAQ, booking, contacto y SEO.

### Traducciones de contenido

| Modelo              | Campos traducidos                     |
| ------------------- | ------------------------------------- |
| `Photograph`        | `title_es/pt`, `description_es/pt`   |
| `Service`           | `title_es/pt`, `description_es/pt`, `duration_es/pt`, `includes_es/pt` |
| `FAQ`               | `question_es/pt`, `answer_es/pt`     |
| `PhotographyPackage` | `name_es/pt`, `description_es/pt`, `duration_es/pt`, `priceFromText_es/pt`, `buttonText_es/pt`, `travelNote_es/pt`, `benefits_es/pt` |
| `PhotographerProfile` | `aboutTitle_es/pt`, `aboutText1_es/pt`, `aboutText2_es/pt` |

### Funciones helper

```typescript
function getPhotoTitle(photo: Photograph, lang: string): string
function getPhotoDescription(photo: Photograph, lang: string): string
```

Ambas retornan el valor traducido según el idioma activo, con fallback al valor por defecto (inglés).

---

## Despliegue

El proyecto está configurado para desplegarse en **Vercel** mediante GitHub Actions, después de que CI valide el cambio.

### Deploy automático

Vincula el proyecto en Vercel y configura el workflow con los secretos indicados abajo. Vercel detecta Vite y aplica la configuración de `vercel.json`:

- **Build**: `npm run build`
- **Output**: `dist/`
- **SPA rewrites**: Todas las rutas redirigen a `index.html`

Cada push a `main` ejecuta lint, auditoría de dependencias y build. Solo si CI termina correctamente se ejecuta el deploy de producción.

Configura estos secretos en GitHub (`Settings → Secrets and variables → Actions`) para habilitar el deploy:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Desactiva el deploy automático por integración Git en Vercel para no publicar dos veces el mismo commit. En `Settings → Branches`, protege `main` y exige los checks `CI`, `Security` y `CodeQL` antes de aceptar un pull request.

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

## Seguridad y Versionado

Los workflows de `.github/workflows/` aplican estos controles:

- `CI`: type-check, `npm audit` y build de producción en cada pull request y push a `main`.
- `Security`: Gitleaks analiza el historial completo para bloquear claves o tokens, además de auditar dependencias de producción.
- `CodeQL`: análisis estático semanal y en cada cambio de código.
- `Dependabot`: actualiza dependencias npm y GitHub Actions semanalmente.
- `Version and release`: Release Please crea un pull request de versión siguiendo Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE:`).

Si una clave se filtra, revócala inmediatamente en el proveedor, reemplázala en los secretos correspondientes y no la agregues al repositorio, aunque esté dentro de un archivo ignorado por Git.

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
