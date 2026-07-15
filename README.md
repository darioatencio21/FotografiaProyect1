# Miriam Campos Photography

> Plataforma profesional de portafolio y suite administrativa para un estudio fotográfico de lujo. Construida como una Single Page Application (SPA) con React, TypeScript y Firebase.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Empezando](#empezando)
- [Scripts](#scripts)
- [Arquitectura y Flujo](#arquitectura-y-flujo)
- [Vistas](#vistas)
- [Despliegue](#despliegue)
- [Variables de Entorno](#variables-de-entorno)

---

## Descripción

Miriam Campos Photography es una aplicación web completa que funciona como **portafolio público interactivo** y como **suite de gestión empresarial** para un estudio fotográfico de alta gama. Permite a los visitantes explorar galerías de fotos, reservar sesiones, contactar al estudio y acceder a un portal privado de pruebas. Del lado administrativo, incluye un CMS completo con dashboard de analytics, gestión de contenido, cola de reservas, bandeja de mensajes y administración de cuentas de clientes.

El proyecto está diseñado para desplegarse en Firebase Hosting con Firestore como base de datos en tiempo real.

---

## Funcionalidades

- **Portafolio interactivo** — Galería en formato masonry con filtros por categoría, búsqueda por texto, vista de favoritos y lightbox a pantalla completa con metadatos EXIF, descarga, share y comparación.
- **Sistema de reservas multi-paso** — Selección de servicio, fecha, horario, datos de contacto y extras (drone, entrega express, maquillaje) con cálculo de presupuesto en tiempo real.
- **Portal de cliente** — Área protegida por código de acceso donde los clientes pueden ver, seleccionar y descargar sus fotos, y solicitar impresiones.
- **CMS administrativo** — Dashboard con gráficos de ingresos y tráfico, CRUD completo de fotografías (con drag & drop y compresión), servicios, testimonios, blog, FAQ, mensajería, SEO, perfil del fotógrafo y cuentas de clientes.
- **Checkout simulado** — Modal de pago con Stripe simulado, con animación de procesamiento y comprobante de transacción.
- **Notificaciones por email** — Integración con EmailJS para notificaciones al administrador y auto-respuestas al cliente desde el formulario de contacto y reservas.
- **Multi-idioma** — Soporte completo para Español, English y Português con cambio en tiempo real.
- **Cursor personalizado** — Cursor animado con física Spring que cambia de estado sobre elementos interactivos.
- **Diseño responsive** — Adaptado a todos los tamaños de pantalla con menú mobile tipo drawer.
- **Persistencia offline** — Datos cacheados en localStorage con prefijo `aurea_` para funcionamiento sin conexión.

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
| Base de datos       | Firebase Firestore                  | —       |
| Hosting             | Vercel                              | —       |
| Email               | EmailJS                             | —       |
| CI/CD               | Vercel (automatico desde GitHub)    | —       |

---

## Estructura del Proyecto

```
├── public/
├── src/
│   ├── App.tsx                   # Componente raíz: estado global, routing y lógica de datos
│   ├── main.tsx                  # Punto de entrada de React
│   ├── index.css                 # Configuración de Tailwind, tema, fuentes y estilos globales
│   ├── types.ts                  # Interfaces TypeScript para todos los modelos de datos
│   ├── components/
│   │   ├── Header.tsx            # Barra de navegación con menú responsive y selector de idioma
│   │   ├── Footer.tsx            # Pie de página con newsletter, redes sociales y enlaces legales
│   │   ├── CustomCursor.tsx      # Cursor animado personalizado con física Spring
│   │   ├── Lightbox.tsx          # Visor de fotos a pantalla completa con EXIF y acciones
│   │   ├── BookingCalendar.tsx   # Formulario de reserva en 4 pasos
│   │   ├── ClientPortal.tsx      # Portal de pruebas protegido por código
│   │   ├── AdminCMS.tsx          # Panel de administración completo
│   │   ├── StripeCheckout.tsx    # Modal de pago simulado con Stripe
│   │   ├── LegalViews.tsx        # Páginas de Política de Privacidad y Términos
│   │   └── Logo.tsx              # Logotipo SVG del estudio
│   ├── lib/
│   │   └── firebase.ts           # Inicialización de Firebase y helpers CRUD
│   └── data/
│       └── mockData.ts           # Datos de inicialización y fallback
├── firebase.json                 # Configuración de Firebase Hosting + Firestore
├── firestore.rules               # Reglas de seguridad de Firestore
├── firebase-applet-config.json   # Credenciales de Firebase
├── firebase-blueprint.json       # Schema de las colecciones de Firestore
├── vite.config.ts                # Configuración de Vite
├── tsconfig.json                 # Configuración de TypeScript
├── package.json                  # Dependencias y scripts
├── index.html                    # Entry point HTML
├── .env.example                  # Plantilla de variables de entorno
└── metadata.json                 # Metadatos de AI Studio
```

---

## Empezando

### Prerrequisitos

- Node.js 18 o superior
- npm

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd miriam-campos-photography

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores correspondientes

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

---

## Arquitectura y Flujo

### Routing

La aplicación utiliza **ruteo por estado** en lugar de React Router. El estado `currentView` en `App.tsx` determina qué componente/vista se renderiza. Las transiciones entre vistas se realizan mediante animaciones de Motion.

```
App.tsx
└── currentView (state)
    ├── "home"          → Hero + Stats + Portfolio Teaser
    ├── "about"         → Biografía + Premios
    ├── "portfolio"     → Galería completa
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
Firestore (cloud)
    │
    ├── syncCollection() / getCollectionWithFallback()
    │
    ▼
App.tsx State + localStorage (caché offline)
    │
    ├── Se renderiza la vista correspondiente
    │
    └── Cualquier mutación → saveDocument() → Firestore
```

1. **Carga inicial**: `App.tsx` fetches todas las colecciones de Firestore mediante `getCollectionWithFallback()`.
2. **Fallback**: Si Firestore devuelve vacío, se usan los datos definidos en `mockData.ts`.
3. **Caché offline**: Los datos se persisten en `localStorage` con claves con prefijo `aurea_`.
4. **Sincronización**: Cada modificación (crear, editar, eliminar) llama a `saveDocument()` o `syncCollection()` para persistir en Firestore.
5. **Admin CMS**: El panel administrativo realiza operaciones CRUD directas contra Firestore.

### Colecciones de Firestore

| Colección            | Propósito                       |
| -------------------- | ------------------------------- |
| `photographs`        | Fotografías del portafolio       |
| `services`           | Paquetes de servicio            |
| `testimonials`       | Testimonios de clientes         |
| `blogPosts`          | Artículos del blog              |
| `faqs`               | Preguntas frecuentes            |
| `bookings`           | Solicitudes de reserva          |
| `messages`           | Mensajes de contacto            |
| `clientAccounts`     | Cuentas de clientes             |
| `seo/config`         | Metadatos SEO globales          |
| `profile/photographer` | Perfil del fotógrafo          |
| `bookingConfig/config` | Configuración de reservas     |
| `emailConfig/config` | Configuración de EmailJS        |

### Autenticación

- **Admin**: Hardcoded (`admin` / `admin123`). La sesión se guarda en `localStorage` como `aurea_admin_logged`.
- **Client Portal**: Protegido por código de acceso validado contra la colección `clientAccounts`.

---

## Vistas

| Vista          | Ruta (state)   | Descripción                                           |
| -------------- | -------------- | ----------------------------------------------------- |
| Inicio         | `home`         | Hero con llamado a la acción, estadísticas, fotos destacadas |
| Sobre mí       | `about`        | Biografía, avatar y línea de tiempo de premios        |
| Portafolio     | `portfolio`    | Galería masonry con filtros, búsqueda y lightbox      |
| Servicios      | `services`     | Tarjetas de servicios + calendario de reservas        |
| Portal Cliente | `client-portal` | Galería privada protegida por código                  |
| FAQ            | `faq`          | Acordeón de preguntas frecuentes multi-idioma         |
| Contacto       | `contact`      | Formulario con EmailJS y datos del estudio            |
| Admin          | `admin`        | CMS completo con dashboard, CRUD y configuración      |
| Privacidad     | `privacy`      | Política de privacidad multi-idioma                   |
| Términos       | `terms`        | Términos del servicio multi-idioma                    |

---

## Despliegue

El proyecto está configurado para desplegarse en **Vercel** con deploy automático desde GitHub.

### Deploy automático

Conectá el repositorio en [vercel.com/import](https://vercel.com/import). Vercel detecta automáticamente Vite y aplica la configuración de `vercel.json`:

- **Build**: `npm run build`
- **Output**: `dist/`
- **SPA rewrites**: Todas las rutas redirigen a `index.html`

Cada push a `main` dispara un deploy automático.

### Variables de entorno en Vercel

Agregá estas en el dashboard (Project Settings → Environment Variables):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_DATABASE_ID
GEMINI_API_KEY (opcional)
APP_URL=https://tu-app.vercel.app
```

### Deploy manual

```bash
npm run build
vercel --prod
```

---

## Variables de Entorno

| Variable         | Descripción                       | Ejemplo                          |
| ---------------- | --------------------------------- | -------------------------------- |
| `GEMINI_API_KEY` | Clave de API de Gemini            | `AIzaSy...`                      |
| `APP_URL`        | URL base de la aplicación         | `http://localhost:3000`          |

Copia `.env.example` a `.env.local` y completa los valores antes de ejecutar la aplicación.

---

## Licencia

Todos los derechos reservados — Miriam Campos Photography
