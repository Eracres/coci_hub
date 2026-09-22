<div align="center">

# 🍳 CociHub

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

Plataforma web de recetas personales para consultar, organizar, adaptar y compartir recetas desde cualquier dispositivo.

![Estado](https://img.shields.io/badge/estado-preproducci%C3%B3n-E5A93D?style=for-the-badge)
![Release](https://img.shields.io/badge/release-v1.0.0--rc.1-D95D39?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.2.12-292522?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-3978A8?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Storage-3F7D57?style=for-the-badge&logo=supabase)

</div>

---

## 📖 Índice

- [Descripción](#-descripción)
- [Estado actual](#-estado-actual)
- [Funcionalidades](#-funcionalidades)
- [Arquitectura](#-arquitectura)
- [Rutas](#-rutas)
- [Stack tecnológico](#-stack-tecnológico)
- [Base de datos y seguridad](#-base-de-datos-y-seguridad)
- [Importación con IA](#-importación-con-ia)
- [SEO y rendimiento](#-seo-y-rendimiento)
- [Identidad visual](#-identidad-visual)
- [Variables de entorno](#-variables-de-entorno)
- [Instalación local](#-instalación-local)
- [Comprobaciones](#-comprobaciones)
- [Despliegue previsto](#-despliegue-previsto)
- [Roadmap](#-roadmap)
- [Mejoras posteriores](#-mejoras-posteriores)
- [Versionado](#-versionado)
- [Autor](#-autor)

---

# 📌 Descripción

**CociHub** es una aplicación web de recetas personales creada inicialmente para compartir recetas con familiares, amigos y compañeros de trabajo.

El proyecto centraliza recetas que antes podían quedar dispersas en mensajes, fotografías o estados de WhatsApp y las convierte en contenido estructurado, buscable, adaptable y compartible.

Los visitantes pueden consultar recetas sin registrarse, buscar y filtrar contenido, adaptar cantidades al número de raciones y compartir cada receta mediante distintos canales.

El área administrativa permite crear y editar recetas, trabajar con borradores, gestionar imágenes y clasificaciones, publicar o despublicar contenido y utilizar una herramienta asistida por IA para convertir fotografías de recetas en borradores editables.

CociHub se desarrolla también como proyecto de portfolio, documentando el proceso completo de análisis, UX/UI, arquitectura, base de datos, seguridad, desarrollo, IA, pruebas, SEO, rendimiento y despliegue.

---

# 🚦 Estado actual

CociHub se encuentra en **preproducción**.

La aplicación principal está desarrollada y ha superado la regresión funcional y técnica en entorno local de producción.

```text
Release candidate: v1.0.0-rc.1
Objetivo:          CociHub 1.0
Node.js:           24
Next.js:           16.2.12
React:             19.2.4
```

Validaciones realizadas:

- [x] TypeScript sin errores.
- [x] ESLint sin errores.
- [x] Build de producción correcto.
- [x] Servidor de producción local correcto.
- [x] Área pública validada.
- [x] Área administrativa validada.
- [x] CRUD de recetas validado.
- [x] Importación mediante IA validada.
- [x] Estados 404, error y vacío validados.
- [x] SEO técnico validado.
- [x] Imágenes públicas optimizadas.
- [x] `.env.local` ignorado por Git.
- [ ] Despliegue en servidor.
- [ ] Dominio definitivo.
- [ ] HTTPS en producción.
- [ ] Revisión legal final con datos reales.
- [ ] Smoke test online.
- [ ] Backup de producción.
- [ ] Release final `v1.0.0`.

> ESLint muestra dos avisos conocidos relacionados con React Hook Form y React Compiler en formularios administrativos. No existen errores de lint.

---

# ✨ Funcionalidades

## 🌍 Área pública

### Inicio

- Presentación de CociHub.
- Eslogan e identidad visual.
- Recetas destacadas.
- Últimas recetas publicadas.
- Categorías activas.
- Accesos directos al catálogo.
- Estado vacío cuando no existen recetas.

### Recetas

- Catálogo de recetas publicadas.
- Búsqueda.
- Filtros.
- Ordenación.
- Contador de resultados.
- Estado sin resultados.
- Navegación hacia el detalle de cada receta.

### Detalle de receta

Cada receta puede mostrar:

- Título e imagen principal.
- Descripción e introducción.
- Tipo, categorías y etiquetas.
- Dificultad.
- Tiempos de preparación, cocción, adicional y total.
- Raciones base.
- Ingredientes agrupados.
- Elaboración paso a paso.
- Duración y consejo opcionales por paso.
- Consejos y sustituciones.
- Conservación, congelación y recalentado.
- Información orientativa sobre alérgenos.
- Fuente o procedencia.
- Recetas relacionadas.

### Ajuste de raciones

El visitante puede seleccionar entre **1 y 20 raciones**.

```text
factor = raciones seleccionadas / raciones base
```

Solo se recalculan cantidades numéricas marcadas como escalables. Expresiones como `al gusto`, `una pizca` o `cantidad necesaria` se conservan sin modificación.

### Compartir

- Compartir nativo del dispositivo cuando está disponible.
- WhatsApp.
- Telegram.
- Correo electrónico.
- Copiar enlace.

### Categorías y páginas informativas

- Listado de categorías.
- Página individual por categoría.
- Número de recetas publicadas por categoría.
- Sobre CociHub.
- Aviso legal.
- Política de privacidad.
- Política de cookies.
- Página 404 personalizada.
- Estado de error general.

---

# 🔐 Área administrativa

El acceso administrativo requiere autenticación y rol autorizado.

Funciones actuales:

- Login y logout.
- Protección de rutas administrativas.
- Listado de recetas.
- Creación y edición.
- Eliminación controlada.
- Estados `draft`, `published` y `archived`.
- Publicación y despublicación.
- Recetas destacadas.
- Previsualización.
- Imagen principal.
- Clasificación, categorías y etiquetas.
- Raciones y tiempos.
- Grupos de ingredientes e ingredientes.
- Pasos de elaboración.
- Información adicional.
- Alérgenos.
- Gestión de categorías.
- Checklist previo a publicación.

## Checklist de publicación

Antes de publicar, CociHub comprueba los requisitos obligatorios de la receta.

Los requisitos completos aparecen en verde y los incompletos en rojo. Los elementos pendientes permiten navegar al bloque que necesita corrección.

---

# 🧭 Arquitectura

CociHub utiliza **Next.js App Router** y separa el área pública del área administrativa.

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── recipes/
│   │   ├── categories/
│   │   ├── about/
│   │   ├── legal-notice/
│   │   ├── privacy/
│   │   └── cookies/
│   ├── admin/
│   │   ├── recipes/
│   │   └── categories/
│   ├── api/
│   │   └── admin/
│   │       └── recipes/
│   │           └── import/
│   ├── login/
│   ├── not-found.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   └── opengraph-image.tsx
├── components/
├── config/
├── lib/
├── schemas/
├── services/
└── types/
```

Separación principal de responsabilidades:

```text
páginas / UI
    ↓
componentes
    ↓
servicios y lógica
    ↓
Supabase / proveedores externos
```

Las validaciones utilizan Zod y los formularios administrativos React Hook Form.

---

# 🛣️ Rutas

## Públicas

```text
/
/recipes
/recipes/[slug]
/categories
/categories/[slug]
/about
/privacy
/cookies
/legal-notice
```

## Autenticación

```text
/login
```

## Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/recipes/[id]/preview
/admin/recipes/import
/admin/categories
```

## API administrativa

```text
/api/admin/recipes/import
/api/admin/recipes/import/draft
```

## Sistema

```text
/_not-found
/robots.txt
/sitemap.xml
/opengraph-image
```

---

# 🧰 Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js 16.2.12 |
| UI | React 19.2.4 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Formularios | React Hook Form |
| Validación | Zod |
| Backend | Server Components, Server Actions y Route Handlers |
| Base de datos | PostgreSQL |
| Plataforma | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | RLS + roles |
| Imágenes | Supabase Storage |
| IA | Google Gemini mediante `@google/genai` |
| Iconos | Lucide React |
| Versionado | Git + GitHub |
| Runtime previsto | Node.js 24 |
| Proxy web previsto | Nginx |
| Servicio previsto | systemd |
| Sistema previsto | Ubuntu Server |

`.nvmrc`:

```text
24
```

---

# 🗃️ Base de datos y seguridad

La persistencia principal utiliza PostgreSQL mediante Supabase.

Entidades principales:

```text
profiles
recipes
recipe_types
categories
recipe_categories
tags
recipe_tags
ingredient_groups
ingredients
recipe_steps
allergens
recipe_allergens
```

Estados de receta:

```text
draft
published
archived
```

El MVP utiliza el rol administrativo `admin`.

Medidas principales:

- Supabase Auth.
- Verificación de usuario y rol.
- Protección de rutas privadas.
- Políticas RLS.
- Separación de operaciones públicas y administrativas.
- Variables sensibles fuera del repositorio.
- `.env.local` ignorado por Git.
- Rutas administrativas excluidas de indexación.

---

# 🤖 Importación con IA

CociHub incluye una herramienta administrativa para convertir fotografías de recetas en borradores editables.

```text
Imagen
   ↓
Validación
   ↓
Gemini multimodal
   ↓
Respuesta estructurada
   ↓
Zod
   ↓
Normalización
   ↓
Revisión del administrador
   ↓
Borrador
   ↓
Edición manual
   ↓
Publicación
```

Características:

- JPG, PNG y WebP.
- Máximo actual: 5 MB.
- La IA nunca publica automáticamente.
- El resultado se revisa antes de crear el borrador definitivo.
- Los datos ausentes no deben inventarse.
- No se crean automáticamente categorías o etiquetas nuevas.
- Se muestran errores amigables ante cuota agotada o saturación temporal.

> La IA asiste al administrador; la revisión y publicación siguen siendo humanas.

---

# 🔎 SEO y rendimiento

## SEO implementado

- Metadata global y por página.
- Metadata dinámica por receta.
- Canonical.
- Open Graph.
- Twitter metadata.
- Imagen Open Graph generada por Next.js.
- `robots.txt`.
- `sitemap.xml`.
- JSON-LD tipo `Recipe`.
- `recipeIngredient`.
- `recipeInstructions`.
- Exclusión de `/admin`, `/api/` y `/login` en robots.
- `noindex` para login y administración.

En local las URLs SEO utilizan:

```text
http://localhost:3000
```

En producción deben utilizar el dominio definitivo.

## Rendimiento

Las imágenes públicas utilizan `next/image` con tamaños responsive y optimización para imágenes servidas desde Supabase Storage.

Las tarjetas aprovechan carga diferida y la imagen principal de la receta recibe tratamiento prioritario cuando corresponde.

---

# 🎨 Identidad visual

## Eslogan oficial

> **Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

## Paleta

| Uso | Color |
|---|---|
| Terracota | `#D95D39` |
| Terracota oscuro | `#A63F25` |
| Verde salvia | `#718C66` |
| Verde oscuro | `#4E6847` |
| Mostaza | `#E5A93D` |
| Crema | `#FFF9F2` |
| Beige | `#F4E9DC` |
| Texto principal | `#292522` |
| Texto secundario | `#6F675F` |
| Borde | `#DED3C8` |

Tipografías:

```text
Lora  → títulos y contenido editorial
Inter → interfaz, navegación y formularios
```

Principios: mobile first, cocina casera, claridad visual, fotografía protagonista, tarjetas limpias, sombras discretas y terracota como CTA principal.

---

# 🔐 Variables de entorno

CociHub utiliza actualmente:

```text
GEMINI_API_KEY
GEMINI_RECIPE_IMPORT_MODEL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_URL
```

Ejemplo sin valores:

```env
GEMINI_API_KEY=
GEMINI_RECIPE_IMPORT_MODEL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
```

Los valores reales deben mantenerse fuera del repositorio.

> Nunca deben documentarse claves privadas o tokens reales en este README.

Antes del despliegue se añadirá la configuración necesaria para que las URLs SEO utilicen el dominio definitivo.

---

# 💻 Instalación local

Requisitos:

- Node.js 24.
- npm.
- Git.
- Proyecto Supabase configurado.
- Variables de entorno necesarias.

Clonar:

```bash
git clone https://github.com/Eracres/coci_hub.git
cd coci_hub
```

Con NVM:

```bash
nvm install
nvm use
```

Instalar dependencias:

```bash
npm ci
```

Crear `.env.local` con las variables necesarias y ejecutar:

```bash
npm run dev
```

Aplicación local:

```text
http://localhost:3000
```

---

# 🧪 Comprobaciones

Antes de un commit importante:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Producción local:

```bash
npm run build
npm run start
```

Comprobar que `.env.local` está ignorado:

```bash
git check-ignore .env.local
```

Revisar cambios:

```bash
git status --short
git diff --stat
```

Comprobar SEO con el servidor iniciado:

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
```

Ejemplo de JSON-LD:

```bash
curl -s http://localhost:3000/recipes/albondigar-al-curry \
  | grep -o '"@type":"Recipe"'
```

---

# 🚀 Despliegue previsto

CociHub 1.0 se prepara para un despliegue autogestionado.

```text
Internet
   │
   ▼
Dominio CociHub
   │
   ▼
HTTPS :443
   │
   ▼
Nginx
   │
   ▼
Next.js / Node.js 24
127.0.0.1:3000
   │
   ├── Supabase PostgreSQL
   ├── Supabase Auth
   ├── Supabase Storage
   └── Google Gemini
```

El puerto de Next.js no debe exponerse directamente a Internet. Nginx actuará como reverse proxy y el proceso de aplicación se gestionará mediante `systemd`.

Pendientes:

- Ubuntu Server.
- Usuario de despliegue.
- SSH y firewall.
- Node.js 24.
- Clonado del repositorio.
- Variables de producción.
- `npm ci` y build.
- Servicio `systemd`.
- Nginx.
- DNS.
- HTTPS.
- Datos legales definitivos.
- SEO con dominio real.
- Smoke test.
- Backup.
- Release final `v1.0.0`.

---

# ⚖️ Legal

CociHub incluye:

```text
/legal-notice
/privacy
/cookies
```

La estructura está implementada, pero antes de producción deben completarse los datos reales del titular/responsable y revisar los proveedores realmente utilizados.

La revisión final deberá contemplar Supabase, hosting/VPS, CDN o proxy si se incorpora, Google Gemini, cookies de autenticación, analítica si se añade y logs del servidor.

---

# 🗺️ Roadmap

## Fase 1 — Definición funcional ✅

- [x] Problema real y público objetivo.
- [x] Alcance inicial e historias de usuario.
- [x] Modelo de datos.
- [x] Identidad visual.

## Fase 2 — UX y arquitectura visual ✅

- [x] Sitemap y wireframes.
- [x] Navegación y responsive.
- [x] Flujos principales.

## Fase 3 — Sistema de diseño ✅

- [x] Tokens de color.
- [x] Inter y Lora.
- [x] Componentes y estados visuales.

## Fase 4 — Arquitectura técnica y administración ✅

- [x] Next.js App Router.
- [x] Supabase, PostgreSQL, Auth, RLS y Storage.
- [x] Zod y formularios.
- [x] CRUD administrativo.
- [x] Publicación y borradores.
- [x] Importación con IA.

## Fase 5 — Área pública ✅

- [x] Inicio, recetas y categorías.
- [x] Detalle y selector de raciones.
- [x] Compartir.
- [x] About y páginas legales base.
- [x] 404, errores y estados vacíos.
- [x] SEO, Open Graph y JSON-LD.
- [x] Sitemap y robots.
- [x] Optimización de imágenes.
- [x] Regresión local final.

## Fase 6 — Preproducción y lanzamiento ⏳

- [x] Release candidate local.
- [x] Build de producción validada.
- [x] Inventario de variables.
- [ ] Preparar servidor.
- [ ] Configurar Node.js, `systemd` y Nginx.
- [ ] Configurar dominio y HTTPS.
- [ ] Completar datos legales.
- [ ] Validar SEO con dominio real.
- [ ] Smoke test online.
- [ ] Backup de producción.
- [ ] Publicar `v1.0.0`.

---

# 🔮 Mejoras posteriores

Estas funciones quedan fuera del lanzamiento inicial y no deben bloquear CociHub 1.0:

- Inferencia avanzada de alérgenos mediante IA.
- Mejor contextualización automática de recetas importadas.
- Nuevas reglas de redondeo de cantidades al cambiar raciones.
- Flujo público para que otros usuarios creen recetas.
- Permisos de edición por propietario/administrador.
- Guardado administrativo unificado o aviso de cambios pendientes.
- Ventana avanzada de compartir y nuevas redes.
- Modo oscuro.
- Múltiples idiomas.
- Favoritos.
- Comentarios y valoraciones.
- Perfiles públicos.
- Lista de la compra.
- Planificación de menús.
- Recetas privadas o colaborativas.
- Notificaciones.
- Aplicación móvil nativa.

---

# 📦 Versionado

Repositorio:

```text
https://github.com/Eracres/coci_hub
```

Convención:

```text
v1.0.0-rc.1 → primera candidata a producción
v1.0.0      → primera versión estable publicada
```

Un tag representa un punto concreto del historial y permite recuperar exactamente el código correspondiente a una release.

Como copia adicional se recomienda conservar un ZIP fuera del repositorio excluyendo:

```text
node_modules/
.next/
.git/
.env.local
```

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web.

CociHub se desarrolla como una aplicación real y como proyecto de portfolio, cubriendo análisis, UX/UI, arquitectura, desarrollo full stack, base de datos, autenticación, seguridad, integración con IA, SEO, optimización, pruebas y despliegue.

---

# 📄 Licencia

La licencia definitiva se establecerá antes o durante la publicación pública de la primera versión estable.

---

<div align="center">

## 🍳 CociHub

**Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

</div>