# 🍳 CociHub

> **Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

Aplicación web full stack de recetas personales para organizar, publicar, adaptar y compartir recetas desde cualquier dispositivo.

---

## 📌 Estado actual

| Fase | Estado |
|---|---|
| Fase 1 — Definición funcional | ✅ Completada |
| Fase 2 — Arquitectura visual y UX | ✅ Completada |
| Fase 3 — Design System y prototipos | ✅ Completada |
| Fase 4 — Arquitectura técnica + CRUD administrador | ✅ Completada |
| Fase 5 — Área pública | 🟡 En progreso |
| Fase 6 — SEO, optimización y despliegue | ⬜ Pendiente |

### 🧩 Editor administrativo de recetas

```text
01 Información básica       ✅
02 Imagen principal         ✅
03 Clasificación            ✅
04 Raciones                 ✅
05 Tiempos                  ✅
06 Ingredientes             ✅
07 Elaboración              ✅
08 Información adicional    ✅
09 Alérgenos                ✅
10 Publicación              ✅
```

La **Fase 4 está completamente cerrada** y la **Fase 5 — Área pública** ya está en desarrollo.

Estado actual de la Fase 5:

```text
5.1 Servicio público de recetas       ✅
5.2 Listado /recipes                   ✅
5.3 RecipeCard pública                 ✅
5.4 Detalle /recipes/[slug]            ✅
5.5 Selector de raciones               ✅
5.6 Búsqueda + filtros + ordenación    ✅
5.7 Categorías públicas                ✅

5.8 Home definitiva                    ⏭️ SIGUIENTE
5.9 Compartir + relacionadas           ⬜
5.10 Regresión Fase 5                  ⬜
```

---

# ✅ Funcionalidades implementadas

## ⚙️ Base técnica

- Next.js 16 con App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Zod.
- React Hook Form.
- Server Components.
- Client Components solo donde existe interacción real.
- Server Actions.
- PostgreSQL.
- Supabase.
- Supabase CLI.
- Migraciones SQL versionadas.
- Seeds.
- Git y GitHub.

---

## 🔐 Autenticación y seguridad

- Supabase Auth.
- Login y logout administrativo.
- Tabla `profiles`.
- Roles preparados: `admin`, `editor`, `user`.
- MVP restringido a administradores para creación y edición.
- Protección de `/admin`.
- Proxy SSR y refresco de sesión.
- Row Level Security.
- Policies de lectura y escritura.
- Policies específicas para Storage.
- Auditoría real de permisos para `anon`, `authenticated` y `admin`.
- Hardening de RPC administrativas.
- `anon` no puede ejecutar RPC administrativas.
- Usuarios autenticados sin rol `admin` son rechazados por `public.is_admin()`.
- Las recetas públicas solo son visibles cuando `status = published`.
- Las recetas `draft` y `archived` no pueden aparecer en el área pública.

Flujo de seguridad:

```text
Supabase Auth
      ↓
profiles.role
      ↓
Protección de rutas
      ↓
RLS
      ↓
Permisos RPC
      ↓
public.is_admin()
      ↓
PostgreSQL / Storage
```

---

## 🖼️ Storage

Bucket:

```text
recipe-images
```

Ruta de imágenes principales:

```text
recipes/{recipeId}/main.ext
```

Ya funciona:

- Subida.
- Sustitución.
- Eliminación.
- URL pública.
- Persistencia de `image_path`.
- Sustitución JPG → JPG.
- Sustitución JPG → WebP.
- Limpieza de la imagen anterior al cambiar extensión.
- Cache busting para evitar mostrar imágenes antiguas.
- Sincronización inmediata de la preview.

Formatos:

```text
JPEG
PNG
WebP
```

Máximo actual:

```text
5 MB
```

Policies definitivas:

```text
SELECT
INSERT
UPDATE
DELETE
```

Todas restringidas a:

```text
authenticated
+
public.is_admin()
```

Las policies antiguas duplicadas de Storage fueron retiradas mediante migración.

---

## 🛠️ Gestión administrativa de recetas

Ya funciona:

- Crear borradores.
- Listar recetas.
- Editar recetas por ID.
- Título.
- Slug.
- Descripción corta.
- Introducción.
- Imagen principal.
- Tipo de receta.
- Categorías.
- Etiquetas.
- Dificultad.
- `featured`.
- Raciones base.
- Tiempos.
- Ingredientes agrupados.
- Ingredientes escalables.
- Reordenación de grupos e ingredientes.
- Pasos de elaboración.
- Reordenación de pasos.
- Consejos por paso.
- Consejos generales.
- Sustituciones.
- Conservación.
- Congelación.
- Recalentado.
- Fuente/procedencia.
- Alérgenos presentes.
- Posibles trazas.
- Checklist de requisitos de publicación.
- Publicación de recetas completas.
- Gestión de `published_at`.
- Despublicación y vuelta a borrador.
- Archivado.
- Restauración a borrador.
- Validación de publicación en aplicación y PostgreSQL.
- Vista previa administrativa.
- Eliminación segura.
- Limpieza de imagen asociada al eliminar.
- Revalidación del listado, editor y preview.

---

# 🌐 Área pública — Fase 5

## 🍽️ Listado público de recetas

Ruta:

```text
/recipes
```

El listado público muestra únicamente recetas:

```text
status = published
```

Cada tarjeta pública puede mostrar:

- Imagen principal.
- Indicador de receta destacada.
- Título.
- Descripción corta.
- Tiempo total.
- Raciones.
- Dificultad.
- Enlace al detalle.

Las recetas `draft` y `archived` quedan fuera tanto por la consulta de aplicación como por RLS.

---

## 🔎 Búsqueda, filtros y ordenación

El listado público soporta parámetros de URL compartibles.

Ejemplos:

```text
/recipes?search=macarrones
/recipes?category=pasta
/recipes?difficulty=easy
/recipes?type=segundo-plato
/recipes?tag=rapido
/recipes?order=time-asc
```

También pueden combinarse:

```text
/recipes?search=pollo&category=espanola&difficulty=easy&order=time-asc
```

Filtros implementados:

- Texto de búsqueda.
- Categoría.
- Tipo de receta.
- Dificultad.
- Etiqueta.

Ordenación implementada:

```text
Destacadas primero
Más recientes
Más antiguas
Título A–Z
Título Z–A
Menor tiempo
Mayor tiempo
```

El formulario utiliza `GET`, por lo que las búsquedas son navegables, compartibles y compatibles con atrás/adelante del navegador.

---

## 🍝 Detalle público de receta

Ruta:

```text
/recipes/[slug]
```

El detalle público incluye, cuando existe información:

```text
Estado destacado
Tipo de receta
Categorías
Título
Descripción corta
Tiempo total
Raciones
Dificultad
Imagen principal
Introducción
Ingredientes
Elaboración
Consejos por paso
Información adicional
Resumen de tiempos
Alérgenos
Etiquetas
Fuente
```

Comportamiento de seguridad:

```text
slug válido + published   → receta visible ✅
slug válido + draft       → 404 ❌
slug válido + archived    → 404 ❌
slug inexistente          → 404 ❌
```

El servicio público exige explícitamente:

```text
status = published
```

además de la protección RLS.

---

## 👥 Selector de raciones

El detalle público permite ajustar el número de raciones sin modificar la receta almacenada.

Rango actual:

```text
1–20 raciones
```

Fórmula:

```text
factor = selectedServings / baseServings
```

Solo se recalculan ingredientes con:

```text
quantity != NULL
scalable = true
```

Ejemplo:

```text
Receta base: 4 raciones
300 g macarrones
200 g tomate
50 g queso

Seleccionamos 2 raciones
↓
150 g macarrones
100 g tomate
25 g queso
```

Los ingredientes no escalables permanecen intactos.

Ejemplos:

```text
Sal al gusto
Aceite necesario
Especias al gusto
```

El recalculado ocurre únicamente en el navegador y **no modifica PostgreSQL**.

El usuario puede volver en cualquier momento a las raciones originales mediante el botón de restablecimiento.

---

## 🗂️ Categorías públicas

Rutas:

```text
/categories
/categories/[slug]
```

`/categories` muestra las categorías disponibles con:

- Nombre.
- Icono.
- Número de recetas publicadas.
- Enlace al detalle de categoría.

Ejemplo:

```text
Pasta
1 receta publicada
```

El detalle de categoría muestra únicamente las recetas públicas asociadas:

```text
/categories/pasta
```

Comportamiento:

```text
categoría existente + recetas publicadas → listado ✅
categoría existente + 0 recetas          → estado vacío ✅
categoría inexistente                     → 404 ✅
```

Las recetas `draft` o `archived`:

- No aparecen en el listado.
- No aumentan el contador público de la categoría.

---

# 🧱 Modelo funcional de receta

Campos principales:

```text
title
slug
short_description
introduction
image_path
image_alt
status
difficulty
base_servings
preparation_minutes
cooking_minutes
additional_minutes
recipe_type_id
featured
```

Estados:

```text
draft
published
archived
```

Dificultad:

```text
easy
medium
hard
```

### 🗂️ Clasificación

```text
1 tipo principal
1 o más categorías para publicar
0 o más etiquetas
```

### ⏱️ Tiempos

Se almacenan:

```text
preparation_minutes
cooking_minutes
additional_minutes
```

El tiempo total no se almacena:

```text
total =
  preparation_minutes
  + cooking_minutes
  + additional_minutes
```

### 👥 Raciones

```text
base_servings
```

En el área pública:

```text
factor =
  raciones seleccionadas
  / raciones base
```

Las cantidades originales nunca se modifican al cambiar raciones.

---

# 🥕 Ingredientes y escalado

Estructura:

```text
ingredient_groups
└── ingredients
```

Cada ingrediente:

```text
name
quantity
unit
notes
scalable
position
```

Ejemplo escalable:

```text
quantity = 600
unit = g
scalable = true
```

Ejemplo no escalable:

```text
quantity = NULL
notes = "al gusto"
scalable = false
```

La escritura administrativa se realiza de forma atómica con:

```text
replace_recipe_ingredients(...)
```

---

# 👨‍🍳 Elaboración

Tabla:

```text
recipe_steps
```

Campos actuales:

```text
title
instructions
duration_minutes
tip
position
```

El editor permite:

- Añadir.
- Editar.
- Duplicar.
- Eliminar.
- Reordenar pasos.

La escritura se realiza con:

```text
replace_recipe_steps(...)
```

Las imágenes por paso quedan para una evolución posterior.

---

# 📝 Información adicional

Campos:

```text
tips
substitutions
storage
freezing
reheating
source_type
source_title
source_author
source_page
source_url
source_notes
```

Tipos de fuente:

```text
own
family
book
magazine
web
handwritten
other
```

Los campos opcionales vacíos se normalizan:

```text
"" → NULL
```

---

# ⚠️ Alérgenos

Estados:

```text
present
possible
```

Interpretación:

```text
present  → contiene
possible → puede contener / posibles trazas
sin fila → no indicado
```

La relación se guarda en:

```text
recipe_allergens
```

con:

```text
recipe_id
allergen_id
presence
```

El guardado se realiza mediante:

```text
replace_recipe_allergens(...)
```

> La información de alérgenos es orientativa y no sustituye la comprobación del etiquetado de los productos utilizados.

---

# 🚦 Publicación

Estados:

```text
draft
published
archived
```

Flujo principal:

```text
draft
  ↓
validación de requisitos
  ↓
published
```

También se soporta:

```text
published → draft
draft     → archived
published → archived
archived  → draft
```

## ✅ Requisitos mínimos para publicar

Una receta debe disponer de:

- Título.
- Slug.
- Descripción corta.
- Imagen principal.
- Tipo de receta.
- Dificultad.
- Raciones base.
- Tiempo de preparación mayor que cero.
- Al menos una categoría.
- Al menos un ingrediente.
- Al menos un paso de elaboración.

Validación:

```text
Interfaz / aplicación
        ↓
checklist de preparación
        ↓
Server Action
        ↓
Service
        ↓
PostgreSQL
        ↓
validación definitiva
```

Cambio de estado:

```text
set_recipe_status(...)
```

Al publicar:

```text
status = published
published_at = now()
```

Al despublicar:

```text
status = draft
published_at = NULL
```

---

# 👁️ Previsualización administrativa

Ruta:

```text
/admin/recipes/[id]/preview
```

Permite visualizar recetas aunque todavía estén en borrador.

Incluye:

```text
Estado
Destacada
Imagen
Título
Descripción
Tipo
Categorías
Tags
Raciones
Tiempos
Dificultad
Introducción
Ingredientes
Elaboración
Información adicional
Alérgenos
Fuente
```

La revalidación del editor invalida también la ruta de preview.

---

# 🗑️ Eliminación segura

Una receta publicada no puede eliminarse directamente.

Para eliminar una receta:

```text
1. Debe dejar de estar publicada.
2. Se introduce exactamente su título.
3. Se confirma la operación.
```

La eliminación:

- Borra la receta de PostgreSQL.
- Elimina relaciones dependientes mediante integridad referencial.
- Elimina también la imagen principal de Supabase Storage.
- Devuelve un warning si falla únicamente la limpieza posterior de Storage.

---

# 🗃️ Modelo de datos

Tablas principales:

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

Relaciones principales:

```text
profiles
   └── recipes
         ├── recipe_types
         ├── recipe_categories ── categories
         ├── recipe_tags ──────── tags
         ├── ingredient_groups
         │      └── ingredients
         ├── recipe_steps
         └── recipe_allergens ─── allergens
```

---

# 🔒 Seguridad

Flujo:

```text
/login
   ↓
Supabase Auth
   ↓
Sesión
   ↓
Proxy SSR
   ↓
/admin
   ↓
profiles.role = admin
   ↓
RLS
   ↓
PostgreSQL / Storage
```

Resultado de la auditoría:

```text
ANON
├── /admin                    ❌
├── editar recipes            ❌
├── ejecutar RPC admin        ❌
├── modificar Storage         ❌
├── leer draft                ❌
├── leer archived             ❌
└── leer published            ✅

AUTHENTICATED USER
├── /admin                    ❌
├── editar recipes            ❌
├── RPC admin                 ❌ por is_admin()
├── modificar Storage         ❌
└── leer published            ✅

ADMIN
├── /admin                    ✅
├── CRUD recipes              ✅
├── RPC                       ✅
├── Storage                   ✅
├── Preview drafts            ✅
└── eliminación segura        ✅
```

RLS está habilitado en las tablas principales del esquema `public`.

---

# 🌐 Rutas

## Públicas implementadas

```text
/
/recipes
/recipes/[slug]
/categories
/categories/[slug]
/login
```

La Home `/` sigue siendo provisional y será sustituida en **5.8**.

## Públicas previstas

```text
/about
/privacy
/cookies
/legal-notice
```

Búsqueda y filtros:

```text
/recipes?search=...
/recipes?category=...
/recipes?type=...
/recipes?difficulty=...
/recipes?tag=...
/recipes?order=...
```

## Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/recipes/[id]/preview
/admin/categories
/admin/tags
```

## Rutas temporales eliminadas

```text
/design-system              ✅ eliminada
/supabase-test              ✅ eliminada
/admin/storage-test         ✅ eliminada
```

---

# 🧰 Stack

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 |
| UI | React |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Formularios | React Hook Form |
| Validación | Zod |
| Backend | Server Components + Server Actions |
| Base de datos | PostgreSQL |
| Plataforma | Supabase |
| Auth | Supabase Auth |
| Seguridad | RLS + roles |
| Imágenes | Supabase Storage |
| Iconos | Lucide React |
| Migraciones | Supabase CLI |
| Versionado | Git + GitHub |
| Despliegue previsto | Vercel |

Node recomendado:

```text
Node.js 22 o superior
```

---

# 🎨 Identidad visual

| Uso | Color |
|---|---|
| Terracota | `#D95D39` |
| Terracota oscuro | `#A63F25` |
| Verde salvia | `#718C66` |
| Verde oscuro | `#4E6847` |
| Mostaza | `#E5A93D` |
| Crema | `#FFF9F2` |
| Beige | `#F4E9DC` |
| Blanco | `#FFFFFF` |
| Texto | `#292522` |
| Texto secundario | `#6F675F` |
| Borde | `#DED3C8` |

Tipografías:

```text
Lora  → títulos
Inter → interfaz y formularios
```

La estética pública actual es funcional. El pulido visual global se realizará cuando estén completadas las funcionalidades principales de la Fase 5.

---

# 📁 Estructura

```text
coci_hub/
├── database/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── categories/
│   │   ├── login/
│   │   └── recipes/
│   ├── components/
│   │   ├── admin/
│   │   ├── categories/
│   │   ├── layout/
│   │   ├── recipes/
│   │   └── ui/
│   ├── config/
│   ├── lib/
│   ├── schemas/
│   ├── services/
│   │   ├── categories/
│   │   └── recipes/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── config.toml
│   └── seed.sql
├── .env.example
├── .env.local
├── .nvmrc
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

> `.env.local` es configuración local y no se versiona.

---

# 🧬 Migraciones

Se conservan en:

```text
supabase/migrations/
```

Comandos habituales:

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Una migración aplicada no se modifica. Para corregir o evolucionar el esquema se crea siempre una nueva migración.

Durante el cierre de la Fase 4 se añadieron migraciones específicas para:

- Hardening de permisos de RPC administrativas.
- Corrección de policies de imágenes.
- Limpieza de policies duplicadas de Storage.

---

# 🧹 Limpieza técnica de Fase 4

Se eliminaron:

```text
/design-system
/supabase-test
/admin/storage-test
*-demo.tsx
```

También se revisó el código buscando:

```text
console.log
TODO
FIXME
HACK
image_url
```

sin quedar residuos relevantes en `src`.

---

# 🧪 Regresión de Fase 4

La regresión comprobó:

```text
Autenticación
Protección de /admin
Creación de borrador
Información básica
Subida de imagen
Sustitución JPG → JPG
Sustitución JPG → WebP
Eliminación de imagen
Clasificación
Raciones
Tiempos
Ingredientes
Edición y reordenación de ingredientes
Pasos
Edición y reordenación de pasos
Información adicional
Alérgenos
Validación previa a publicación
Publicación
Despublicación
Archivado
Restauración
Vista previa administrativa
Lectura pública mediante RLS
Eliminación segura
Limpieza de Storage
```

Resultado:

```text
✅ REGRESIÓN COMPLETADA
```

---

# ✅ Comprobaciones antes de commit

```bash
rm -rf .next
npx tsc --noEmit
npm run lint
npm run build
```

Para cambios de base de datos:

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Estado técnico conocido:

```text
TypeScript   → 0 errores
ESLint       → 0 errores
Build        → correcto
```

Warnings conocidos:

```text
recipe-basic-info-form.tsx
recipe-times-form.tsx
```

Ambos proceden del uso de `watch()` de React Hook Form y del React Compiler.

```text
2 warnings
0 errors
```

No afectan al funcionamiento ni bloquean el build.

---

# 🗺️ Roadmap

## Fase 1 — Definición funcional ✅

- [x] Problema real.
- [x] Público objetivo.
- [x] Alcance MVP.
- [x] Historias de usuario.
- [x] Modelo inicial.
- [x] Identidad visual.
- [x] Principios UX.

## Fase 2 — Arquitectura visual y UX ✅

- [x] Sitemap.
- [x] Rutas.
- [x] Wireframes.
- [x] Responsive.
- [x] Flujos.
- [x] Área pública y privada.

## Fase 3 — Design System ✅

- [x] Tokens.
- [x] Paleta.
- [x] Tipografías.
- [x] Componentes base.
- [x] Prototipos administrativos.
- [x] `RecipeFormDemo`.
- [x] `/design-system`.
- [x] Retirada posterior de demos y ruta temporal tras cumplir su función.

## Fase 4 — Arquitectura técnica y CRUD administrador ✅

### Infraestructura

- [x] Next.js.
- [x] TypeScript.
- [x] Tailwind.
- [x] Zod.
- [x] PostgreSQL.
- [x] Supabase.
- [x] CLI y migraciones.
- [x] Seeds.

### Seguridad

- [x] Auth.
- [x] Profiles.
- [x] Roles.
- [x] Login/logout.
- [x] Protección `/admin`.
- [x] RLS.
- [x] Storage seguro.
- [x] Auditoría de permisos.
- [x] Hardening de RPC.
- [x] Restricción de `anon`.
- [x] Lectura pública solo para recetas publicadas.

### CRUD

- [x] Crear borrador.
- [x] Listar recetas.
- [x] Editar receta.
- [x] Información básica.
- [x] Imagen principal.
- [x] Clasificación.
- [x] Categorías.
- [x] Raciones.
- [x] Tiempos.
- [x] Ingredientes.
- [x] Elaboración.
- [x] Información adicional.
- [x] Alérgenos.
- [x] Publicación.
- [x] Despublicación.
- [x] Archivado.
- [x] Restauración a borrador.
- [x] Checklist de publicación.
- [x] Validación final en PostgreSQL.
- [x] Eliminación segura.
- [x] Previsualización administrativa.
- [x] Revisión de errores.
- [x] Revalidación y caché.
- [x] Limpieza técnica final.
- [x] Pruebas de regresión.
- [x] Build de producción.

## Fase 5 — Área pública 🟡

### Base pública

- [x] Servicio público de recetas.
- [x] Listado `/recipes`.
- [x] `RecipeCard` pública.
- [x] Mostrar solo recetas `published`.

### Detalle

- [x] `/recipes/[slug]`.
- [x] Metadata dinámica.
- [x] Imagen principal.
- [x] Ingredientes agrupados.
- [x] Elaboración.
- [x] Información adicional.
- [x] Alérgenos.
- [x] Tags.
- [x] Fuente.
- [x] 404 para recetas no públicas.

### Raciones

- [x] Selector 1–20.
- [x] Recalculado en cliente.
- [x] Respeto de `scalable`.
- [x] Restablecer raciones originales.
- [ ] Redondeo legible avanzado.

### Búsqueda y filtros

- [x] Búsqueda por texto.
- [x] Filtro por categoría.
- [x] Filtro por tipo.
- [x] Filtro por dificultad.
- [x] Filtro por tag.
- [x] Orden por destacadas.
- [x] Orden por fecha.
- [x] Orden alfabético.
- [x] Orden por tiempo.
- [x] Parámetros compartibles en URL.
- [x] Estado sin resultados.

### Categorías

- [x] `/categories`.
- [x] `CategoryCard`.
- [x] Número de recetas publicadas.
- [x] `/categories/[slug]`.
- [x] Listado de recetas por categoría.
- [x] Categoría vacía sin 404.
- [x] 404 para categoría inexistente.
- [x] Exclusión de `draft` y `archived` en contadores.

### Pendiente

- [ ] Home definitiva.
- [ ] Recetas destacadas en Home.
- [ ] Últimas recetas en Home.
- [ ] Categorías principales en Home.
- [ ] Compartir por WhatsApp.
- [ ] Copiar enlace.
- [ ] Recetas relacionadas.
- [ ] Páginas legales.
- [ ] Pulido visual global.
- [ ] Regresión completa Fase 5.

## Fase 6 — Cierre y despliegue ⬜

- [ ] Accesibilidad.
- [ ] SEO.
- [ ] Metadata / Open Graph.
- [ ] Sitemap.
- [ ] `robots.txt`.
- [ ] Optimización de imágenes.
- [ ] Pruebas finales.
- [ ] Vercel.
- [ ] Dominio.
- [ ] Monitorización.

---

# 🚀 Siguiente paso

## Fase 5.8 — Home definitiva

Con `/recipes`, el detalle, el selector de raciones, la búsqueda, los filtros y las categorías ya operativos, el siguiente objetivo es sustituir la Home provisional.

Estructura prevista:

```text
Hero CociHub
  ↓
Buscador / llamadas a la acción
  ↓
Recetas destacadas
  ↓
Últimas recetas
  ↓
Categorías principales
  ↓
Presentación de CociHub
```

Acciones principales:

```text
[ Explorar recetas ]
[ Ver categorías ]
```

Después de la Home se implementarán:

```text
Compartir por WhatsApp
Copiar enlace
Recetas relacionadas
```

---

# 🤖 Evolución futura

- Registro público.
- Recetas de usuarios.
- Favoritos.
- Valoraciones.
- Comentarios.
- Seguidores.
- Planificador.
- Lista de compra.
- Funciones sociales.
- Imágenes por paso.
- Importación asistida por IA.

La futura importación con IA seguirá un flujo controlado:

```text
texto / imagen
      ↓
extracción
      ↓
JSON estructurado
      ↓
validación Zod
      ↓
revisión humana
      ↓
borrador
```

Nunca se publicará automáticamente contenido interpretado por IA.

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web full stack.

CociHub se desarrolla como aplicación real y proyecto de portfolio, documentando el proceso completo desde la idea inicial hasta el despliegue.
