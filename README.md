# Miriam Campos Photography

Una web completa para un estudio fotográfico de alta gama: un **portafolio público elegante** donde los visitantes descubren el trabajo de la fotógrafa, y un **panel privado** desde el que se administra todo el estudio (reservas, clientes, fotografías, facturas y más).

La estética sigue una línea editorial premium: beiges cálidos, acentos en bronce y tipografía serif, inspirada en revistas como Leica, Hasselblad o Kinfolk.

---

## Qué puede hacer el visitante

- Explorar el **portafolio** con galerías externas (Pixieset) y fotos destacadas.
- Ver el **feed de Instagram** en vivo.
- Leer la sección **Sobre mí** con la historia, trayectoria y filosofía de la fotógrafa.
- Consultar **paquetes de sesión**, **precios** y **preguntas frecuentes**.
- Enviar un **formulario de contacto** (llega un email al estudio y una respuesta automática al visitante).
- **Reservar una sesión** eligiendo categoría, paquete, fecha y horario; firmar un contrato digital, pagar el depósito y recibir su factura.
- Entrar al **portal del cliente** con un código de acceso para ver sus fotos, marcarlas como favoritas, descargarlas y pedir impresiones.
- Cambiar el idioma entre **español e inglés** en cualquier momento.

## Qué puede hacer la fotógrafa (panel de administración)

Con su cuenta, desde el panel puede:

- Ver un **dashboard** con estadísticas de visitas e ingresos.
- Subir y organizar **fotografías** (con compresión automática y datos de la cámara).
- Administrar **reservas** (estado, depósitos, gastos de viaje, contrato firmado, pagos) y **facturas**.
- Crear **paquetes** y **tipos de sesión**.
- Gestionar **testimonios**, **mensajes de contacto** y el **SEO** de la web.
- Editar su **biografía y perfil**.
- Crear cuentas de clientes, subir sus **fotos de prueba** y enviarles el enlace de acceso por email.
- Recibir **notificaciones en tiempo real** (y de escritorio) cuando llega una nueva reserva o mensaje.

## Extras que hacen especial esta web

- **Checkout con tarjeta** (simulado) con animación y comprobante de pago.
- **Contratos digitales** firmados por el cliente y contra-firmados por la fotógrafa.
- **Sincronización automática de Instagram**: el feed se actualiza solo cada cierto tiempo.
- **Multi-idioma** completo (español e inglés).
- **Funciona offline** en parte: si no hay conexión, muestra los datos guardados en el navegador.

---

## Tecnologías utilizadas

| Para qué            | Qué se usa                              |
| ------------------- | --------------------------------------- |
| Interfaz            | React + TypeScript                      |
| Diseño y estilo     | Tailwind CSS + animaciones Motion       |
| Base de datos, archivos y acceso | Supabase (PostgreSQL, Storage, Auth, Edge Functions) |
| Correos electrónicos| EmailJS (formularios, reservas, galerías) |
| Galerías externas   | Pixieset                                |
| Hosting y publicación automática | Vercel + GitHub Actions      |

---

## Cómo levantar el proyecto en tu computadora

Necesitás tener instalados **Node.js** (18 o superior) y **npm**.

```bash
# 1. Instalar las dependencias
npm install

# 2. Configurar las claves de acceso
cp .env.example .env.local
#   Abrí .env.local y completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
#   (se obtienen en Supabase → Settings → API Keys)

# 3. Crear las carpetas de archivos en Supabase
npm run setup:buckets

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La web queda disponible en `http://localhost:3000`.

> Para crear el proyecto de base de datos (tablas), pegá el contenido de
> `supabase/migrations/001_init.sql` en el **SQL Editor** de Supabase y ejecutalo.
> Si el proyecto se crea desde cero, esos archivos también se pueden aplicar
> con la línea de comandos de Supabase (`supabase db push`).

---

## Comandos útiles

| Comando                | Qué hace                                  |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Inicia el servidor de desarrollo          |
| `npm run build`        | Genera la versión final para publicar     |
| `npm run lint`         | Verifica que el código esté correcto      |
| `npm run seed`         | Carga datos de ejemplo de estadísticas    |
| `npm run setup:buckets`| Crea las carpetas de archivos en Supabase |

---

## Notas importantes sobre las claves

- Las claves de acceso se guardan en el archivo `.env.local`, que **no se sube** a Git.
- La web pública solo usa la **clave anónima** de Supabase (segura para el navegador).
- La **clave de administración** (service role) tiene acceso total a los datos: solo se usa en el panel y en las funciones de servidor, nunca se expone en el navegador. Las funciones de servidor la leen desde la variable `apykeysecret_new` en Supabase → Edge Functions → Secrets.
- En Vercel hay que configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `APP_URL` en Project Settings → Environment Variables (entornos Production, Preview y Development).

---

## Publicación automática (GitHub Actions)

Cada vez que se publican cambios en la rama principal:

1. **CI** revisa que el código compile y esté sano.
2. **Seguridad** escanea el repositorio en busca de claves filtradas y dependencias vulnerables (semanalmente también).
3. **CodeQL** hace un análisis estático de seguridad.
4. Si todo pasa, **Deploy** publica automáticamente en Vercel.

---

## Licencia

Todos los derechos reservados — Miriam Campos Photography
