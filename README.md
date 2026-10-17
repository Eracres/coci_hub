<div align="center">

# 🍳 CociHub

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

Plataforma web de recetas para consultar, organizar, adaptar, crear y compartir recetas desde cualquier dispositivo.

![Estado](https://img.shields.io/badge/estado-producci%C3%B3n-3F7D57?style=for-the-badge)
![Deploy](https://img.shields.io/badge/deploy-Vercel-292522?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-16.2.12-292522?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.2.4-3978A8?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Storage-3F7D57?style=for-the-badge&logo=supabase)

**Producción:** https://cocihub.com

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
- [Modelo de tiempos de receta](#-modelo-de-tiempos-de-receta)
- [Importación con IA](#-importación-con-ia)
- [Correo y notificaciones](#-correo-y-notificaciones)
- [SEO y rendimiento](#-seo-y-rendimiento)
- [Identidad visual](#-identidad-visual)
- [Variables de entorno](#-variables-de-entorno)
- [Instalación local](#-instalación-local)
- [Comprobaciones](#-comprobaciones)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Versionado y flujo Git](#-versionado-y-flujo-git)
- [Autor](#-autor)
- [Licencia](#-licencia)

---

# 📌 Descripción

**CociHub** es una aplicación web de recetas creada para centralizar, organizar y compartir contenido culinario de forma estructurada.

El proyecto nació con la idea de evitar que recetas familiares, fotografías, mensajes o apuntes terminen dispersos y difíciles de recuperar. CociHub transforma ese contenido en recetas completas, buscables, adaptables y preparadas para consultar desde cualquier dispositivo.

Los visitantes pueden navegar por el recetario público, buscar y filtrar recetas, consultar categorías, adaptar cantidades al número de raciones y compartir contenido.

Los usuarios autenticados disponen además de un área personal desde la que pueden gestionar su perfil y trabajar con sus propias recetas.

El área administrativa permite revisar contenido, gestionar recetas, categorías y catálogo alimentario, moderar sugerencias y utilizar herramientas asistidas por IA.

CociHub se desarrolla también como proyecto de portfolio, documentando el proceso completo de análisis, UX/UI, arquitectura, base de datos, seguridad, desarrollo full stack, IA, pruebas, SEO, despliegue y mantenimiento.

---

# 🚦 Estado actual

CociHub se encuentra **desplegado en producción** y continúa en desarrollo activo.

```text
Producción:        https://cocihub.com
Rama de producción: main
Hosting:           Vercel
Base de datos:     Supabase PostgreSQL
Autenticación:     Supabase Auth
Storage:           Supabase Storage
Node.js recomendado: 24
Next.js:           16.2.12
React:             19.2.4
```

Validaciones realizadas:

- [x] TypeScript sin errores.
- [x] Build de producción correcto.
- [x] Preview de Vercel validada.
- [x] Despliegue de producción activo.
- [x] Dominio `cocihub.com`.
- [x] HTTPS en producción.
- [x] Área pública operativa.
- [x] Login en producción operativo.
- [x] Área personal autenticada.
- [x] Área administrativa.
- [x] CRUD de recetas.
- [x] Importación mediante IA.
- [x] SEO técnico base.
- [x] Imágenes públicas optimizadas.
- [x] `.env.local` ignorado por Git.
- [ ] Cierre funcional del sistema de moderación del catálogo alimentario.
- [ ] Revisión final de alérgenos y clasificación alimentaria.
- [ ] Auditoría funcional completa.
- [ ] Auditoría final de seguridad y permisos.
- [ ] Revisión legal final.
- [ ] Release estable etiquetada.

> La aplicación está en producción, pero sigue evolucionando mediante ramas de desarrollo y Pull Requests antes de integrar cambios en `main`.

---

# ✨ Funcionalidades

## 🌍 Área pública

### Inicio

- Presentación de CociHub.
- Identidad visual y eslogan.
- Resumen del recetario.
- Categorías activas.
- Accesos directos a recetas y categorías.
- Navegación responsive.
- Estado adaptado a usuarios autenticados y visitantes.

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
- Tiempo de preparación.
- Tiempo de elaboración.
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

El visitante puede adaptar las cantidades de una receta al número de raciones seleccionado.

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

## 👤 Autenticación y área personal

CociHub permite registro e inicio de sesión mediante Supabase Auth.

Funciones disponibles:

- Registro.
- Confirmación de correo.
- Inicio y cierre de sesión.
- Acceso mediante Google cuando está configurado.
- Completar perfil.
- Área personal `Mi CociHub`.
- Gestión del perfil.
- Listado de recetas propias.
- Creación de recetas.
- Edición de recetas.
- Flujo de envío y revisión de recetas comunitarias.

Las rutas privadas se protegen tanto a nivel de aplicación como mediante las políticas de acceso de la base de datos.

---

## 🔐 Área administrativa

El acceso administrativo requiere autenticación y rol autorizado.

Funciones actuales:

- Dashboard administrativo.
- Gestión de recetas.
- Creación y edición.
- Eliminación controlada.
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
- Catálogo de alimentos.
- Moderación de sugerencias del catálogo.
- Flujo de revisión de recetas comunitarias.
- Checklist previo a publicación.

### Checklist de publicación

Antes de publicar, CociHub comprueba los requisitos obligatorios de la receta.

Los requisitos completos aparecen en verde y los incompletos en rojo. Los elementos pendientes permiten navegar al bloque que necesita corrección.

---

# 🧭 Arquitectura

CociHub utiliza **Next.js App Router** y separa las áreas pública, autenticada y administrativa.

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
│   │   ├── categories/
│   │   └── ingredients/
│   ├── api/
│   │   └── admin/
│   ├── auth/
│   ├── complete-profile/
│   ├── login/
│   ├── mi-cocihub/
│   ├── register/
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
servicios / acciones / lógica
   ↓
Supabase / proveedores externos
```

Las validaciones utilizan Zod y los formularios React Hook Form.

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
/register
/register/check-email
/auth/callback
/auth/confirm
/complete-profile
```

## Área personal

```text
/mi-cocihub
/mi-cocihub/perfil
/mi-cocihub/recetas
/mi-cocihub/recetas/nueva
/mi-cocihub/recetas/[id]/editar
```

## Administración

```text
/admin
/admin/categories
/admin/ingredients
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/recipes/[id]/preview
/admin/recipes/import
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
| Plataforma backend | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | RLS + roles |
| Imágenes | Supabase Storage |
| IA | Google Gemini mediante `@google/genai` |
| Correo | Resend |
| Iconos | Lucide React |
| Versionado | Git + GitHub |
| CI / Preview / Producción | Vercel |
| Runtime recomendado | Node.js 24 |

`.nvmrc`:

```text
24
```

> Las versiones actuales de Supabase han comenzado a requerir Node.js 22 o superior. El proyecto utiliza Node.js 24 como referencia para desarrollo y despliegues futuros.

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

Además del modelo principal de recetas, el proyecto incorpora infraestructura para:

- catálogo de alimentos;
- aliases y clasificación;
- sugerencias de nuevos alimentos;
- moderación administrativa;
- flujo de revisión de recetas comunitarias.

Medidas principales:

- Supabase Auth.
- Verificación de usuario y rol.
- Protección de rutas privadas.
- Políticas RLS.
- Separación de operaciones públicas, privadas y administrativas.
- Variables sensibles fuera del repositorio.
- `.env.local` ignorado por Git.
- Rutas administrativas excluidas de indexación.
- Revisión humana antes de publicar contenido asistido por IA.

---

# ⏱️ Modelo de tiempos de receta

El modelo actual evita mantener tiempos redundantes.

Las recetas utilizan:

```text
preparation_minutes
elaboration_minutes
```

`preparation_minutes` representa el tiempo previo de preparación.

`elaboration_minutes` representa el tiempo de elaboración de la receta y se relaciona con la duración definida en los pasos.

El antiguo modelo basado en `cooking_minutes` y tiempos adicionales se considera **legacy** y ha sido retirado.

Este cambio reduce inconsistencias entre los tiempos mostrados en la receta y la suma real de sus pasos.

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
- Validación de tamaño.
- La IA nunca publica automáticamente.
- El resultado se revisa antes de crear el borrador definitivo.
- Los datos ausentes no deben inventarse.
- No se crean automáticamente categorías o etiquetas nuevas.
- Se muestran errores amigables ante cuota agotada o saturación temporal.

> La IA asiste; la revisión y publicación siguen siendo humanas.

---

# ✉️ Correo y notificaciones

CociHub integra **Resend** para los flujos de correo del servidor.

La capa de correo se mantiene exclusivamente en servidor y no debe exponer claves privadas al navegador.

Los correos forman parte de los flujos de notificación relacionados con acciones de recetas y revisión.

> Las claves y datos sensibles del proveedor nunca deben documentarse con valores reales en este README.

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

En desarrollo local:

```text
http://localhost:3000
```

En producción:

```text
https://cocihub.com
```

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

Principios:

- mobile first;
- cocina casera;
- claridad visual;
- fotografía protagonista;
- tarjetas limpias;
- sombras discretas;
- terracota como CTA principal.

---

# 🔐 Variables de entorno

CociHub utiliza variables de entorno para separar configuración y secretos del código.

Variables documentadas:

```text
GEMINI_API_KEY
GEMINI_RECIPE_IMPORT_MODEL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SITE_URL
```

Ejemplo sin valores:

```env
GEMINI_API_KEY=
GEMINI_RECIPE_IMPORT_MODEL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En producción:

```env
NEXT_PUBLIC_SITE_URL=https://cocihub.com
```

Los valores reales deben mantenerse fuera del repositorio.

> Nunca deben documentarse claves privadas, tokens ni credenciales reales en este README.

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

Instalar dependencias exactamente desde el lockfile:

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

Antes de integrar cambios importantes:

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

---

# 🚀 Despliegue

CociHub está desplegado en **Vercel**.

```text
Usuario
   │
   ▼
https://cocihub.com
   │
   ▼
Vercel / Next.js
   │
   ├── Supabase PostgreSQL
   ├── Supabase Auth
   ├── Supabase Storage
   ├── Google Gemini
   └── Resend
```

Flujo de despliegue:

```text
rama de desarrollo
   ↓
commit
   ↓
push
   ↓
Pull Request
   ↓
Vercel Preview
   ↓
TypeScript / build / validación funcional
   ↓
merge a main
   ↓
Vercel Production
   ↓
https://cocihub.com
```

La rama `main` representa el código desplegable en producción.

Las Preview Deployments permiten validar una rama antes del merge.

## URLs de autenticación

Desarrollo local:

```text
http://localhost:3000
```

Producción:

```text
https://cocihub.com
```

Supabase debe mantener configuradas las URL de redirección necesarias para ambos entornos.

---

# ⚖️ Legal

CociHub incluye:

```text
/legal-notice
/privacy
/cookies
```

La estructura está implementada.

Antes de considerar cerrada una release estable debe revisarse que los textos reflejen los proveedores y tratamientos realmente utilizados en producción, incluyendo Supabase, Vercel, Google Gemini, Resend, cookies de autenticación y logs técnicos.

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

## Fase 6 — Producción ✅

- [x] Build de producción validada.
- [x] Inventario de variables.
- [x] Vercel configurado.
- [x] Dominio `cocihub.com`.
- [x] HTTPS.
- [x] Deploy de `main`.
- [x] Smoke test público.
- [x] Login validado en producción.

## Fase 7 — Comunidad y perfiles ✅ / 🔄

- [x] Registro y autenticación.
- [x] Completar perfil.
- [x] Área `Mi CociHub`.
- [x] Gestión de recetas propias.
- [x] Creación y edición de recetas comunitarias.
- [x] Flujo de revisión.
- [x] Notificaciones de receta.
- [ ] Auditoría funcional completa del flujo comunitario.

## Fase 8 — Catálogo alimentario y moderación 🔄

- [x] Base de gestión del catálogo.
- [x] Infraestructura de sugerencias.
- [x] Interfaz administrativa de moderación.
- [ ] Validación funcional completa de aprobar/rechazar sugerencias.
- [ ] Cierre de aliases y clasificación.
- [ ] Revisión final de alérgenos.

## Fase 9 — Auditoría y estabilización ⏳

- [ ] Recorrido funcional completo.
- [ ] Revisión RLS y permisos.
- [ ] Revisión de operaciones administrativas.
- [ ] Revisión de errores y estados vacíos.
- [ ] Revisión de dependencias.
- [ ] Revisión legal.
- [ ] Etiquetado de release estable.

## Fase 10 — Evolución visual y producto ⏳

- [ ] Integración final del branding.
- [ ] Buscador protagonista en Home.
- [ ] Categorías más visuales.
- [ ] Recetas destacadas.
- [ ] Fotografía gastronómica.
- [ ] Bloques de comunidad.
- [ ] CTA final.
- [ ] Revisión responsive y UX.

---

# 🔮 Mejoras posteriores

Estas funciones no deben bloquear la estabilización del núcleo actual:

- Inferencia avanzada de alérgenos mediante IA.
- Mejor contextualización automática de recetas importadas.
- Nuevas reglas de redondeo de cantidades al cambiar raciones.
- Favoritos.
- Comentarios y valoraciones.
- Perfiles públicos.
- Lista de la compra.
- Planificación de menús.
- Recetas privadas o colaborativas.
- Múltiples idiomas.
- Modo oscuro.
- Aplicación móvil nativa.

---

# 📦 Versionado y flujo Git

Repositorio:

```text
https://github.com/Eracres/coci_hub
```

Flujo recomendado:

```text
rama de trabajo
   ↓
cambio funcional
   ↓
validación
   ↓
git commit
   ↓
git push
   ↓
Pull Request
   ↓
Preview
   ↓
merge a main
```

Reglas de trabajo del proyecto:

1. Toda modificación de un fichero de código se entrega como fichero completo.
2. Cada cambio funcional debe quedar acompañado por su correspondiente `git commit`.
3. Antes de integrar en `main`, se valida TypeScript y build.
4. Los cambios destinados a producción pasan por Pull Request y Preview cuando corresponda.

Convención orientativa de commits:

```text
feat: nueva funcionalidad
fix: corrección
refactor: cambio interno sin nueva funcionalidad
docs: documentación
chore: mantenimiento
```

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web.

CociHub se desarrolla como una aplicación real y como proyecto de portfolio, cubriendo análisis, UX/UI, arquitectura, desarrollo full stack, base de datos, autenticación, seguridad, integración con IA, correo, SEO, optimización, pruebas, despliegue y mantenimiento.

---

# 📄 Licencia

La licencia definitiva se establecerá antes o durante la publicación pública de la primera versión estable.

---

<div align="center">

## 🍳 CociHub

**Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

https://cocihub.com

</div>
