# 🍳 CociHub

> **Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

Aplicación web full stack de recetas personales para organizar, publicar, adaptar y compartir recetas desde cualquier dispositivo.

## Estado actual

| Fase | Estado |
|---|---|
| Fase 1 — Definición funcional | ✅ Completada |
| Fase 2 — Arquitectura visual y UX | ✅ Completada |
| Fase 3 — Design System y prototipos | ✅ Completada |
| Fase 4 — Arquitectura técnica + CRUD administrador | 🟡 En progreso |
| Fase 5 — Área pública | ⬜ Pendiente |
| Fase 6 — SEO, optimización y despliegue | ⬜ Pendiente |

### Editor de recetas

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

Los **10 bloques funcionales del editor administrativo de recetas están completados**. La Fase 4 entra ahora en su tramo final: revisión técnica, eliminación segura, previsualización, limpieza de rutas/componentes temporales y comprobación global antes de comenzar el área pública.

---

## Funcionalidades implementadas

### Base técnica

- Next.js 16 con App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Zod.
- React Hook Form para formularios convencionales.
- Estado local de React para editores dinámicos complejos.
- Server Components.
- Server Actions.
- PostgreSQL.
- Supabase.
- Supabase CLI.
- Migraciones SQL versionadas.
- Seeds.
- Git y GitHub.

### Autenticación y seguridad

- Supabase Auth.
- Login y logout administrativo.
- Tabla `profiles`.
- Roles preparados: `admin`, `editor`, `user`.
- MVP restringido a administradores.
- Protección de `/admin`.
- Proxy SSR y refresco de sesión.
- Row Level Security.
- Políticas de lectura/escritura.
- Policies específicas para Storage.

### Storage

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

### Gestión administrativa de recetas

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
- Restauración de recetas archivadas a borrador.
- Validación de publicación tanto en aplicación como en PostgreSQL.

---

## Modelo funcional de receta

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

### Clasificación

```text
1 tipo principal
1 o más categorías para publicar
0 o más etiquetas
```

### Tiempos

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

### Raciones

```text
base_servings
```

En el área pública:

```text
factor =
  raciones seleccionadas
  / raciones base
```

Las cantidades originales de la receta nunca se modifican al cambiar raciones en la vista pública.

---

## Ingredientes y escalado

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

La escritura se realiza de forma atómica con:

```text
replace_recipe_ingredients(...)
```

---

## Elaboración

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

El editor permite añadir, editar, duplicar, eliminar y reordenar pasos.

La escritura se realiza con:

```text
replace_recipe_steps(...)
```

Las imágenes por paso quedan para una evolución posterior.

---

## Información adicional

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

## Alérgenos

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

Los identificadores son UUID. El guardado se realiza mediante:

```text
replace_recipe_allergens(...)
```

> La información de alérgenos será orientativa y no sustituirá la comprobación del etiquetado de los productos utilizados.

---

## Publicación

El bloque de publicación completa el editor administrativo y controla el ciclo de vida de una receta.

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

### Requisitos mínimos para publicar

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

El panel muestra un checklist de preparación antes de habilitar la publicación.

La validación se realiza en dos niveles:

```text
Interfaz / aplicación
        ↓
checklist de preparación
        ↓
Server Action
        ↓
PostgreSQL
        ↓
validación definitiva
```

El cambio de estado se centraliza mediante:

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

Al archivar se conserva la fecha histórica de publicación cuando corresponde.

Este diseño evita que una manipulación del frontend permita publicar una receta incompleta.

---

## Modelo de datos

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

## Seguridad

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

Las operaciones sensibles no dependen únicamente del frontend:

```text
Interfaz
   ↓
Server Action
   ↓
Service
   ↓
Supabase Auth
   ↓
RLS / funciones PostgreSQL
```

---

## Rutas

### Públicas previstas

```text
/
/recipes
/recipes/[slug]
/categories
/categories/[slug]
/about
/login
/privacy
/cookies
/legal-notice
```

Búsqueda:

```text
/recipes?search=...
```

### Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/categories
/admin/tags
```

### Temporales de desarrollo

```text
/design-system
/supabase-test
/admin/storage-test
```

Se revisarán antes de producción.

---

## Stack

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

## Identidad visual

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

La prioridad actual sigue siendo la funcionalidad; el pulido visual definitivo del panel se hará después de cerrar el CRUD.

---

## Estructura

```text
coci_hub/
├── database/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── design-system/
│   │   ├── login/
│   │   └── supabase-test/
│   ├── components/
│   │   ├── admin/
│   │   ├── layout/
│   │   └── ui/
│   ├── config/
│   ├── lib/
│   ├── schemas/
│   ├── services/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── config.toml
│   └── seed.sql
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

## Migraciones

Se conservan en:

```text
supabase/migrations/
```

Son el historial versionado de la base de datos.

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Una migración aplicada no se modifica: se crea una nueva migración para corregir o evolucionar el esquema.

---

## Comprobaciones antes de commit

```bash
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

---

## Limpieza técnica pendiente

Los componentes `*-demo.tsx` siguen existiendo porque `/design-system` todavía puede utilizarlos.

Antes del área pública se revisarán:

```text
componentes demo sin uso
/design-system
/supabase-test
/admin/storage-test
código muerto
imports sobrantes
dependencias no utilizadas
```

---

# Roadmap

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

## Fase 4 — Arquitectura técnica y CRUD administrador 🟡

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
- [x] Checklist de requisitos de publicación.
- [x] Validación final de publicación en PostgreSQL.
- [ ] Eliminación segura.
- [ ] Previsualización.
- [ ] Revisión global de errores.
- [ ] Limpieza técnica final.

## Fase 5 — Área pública ⬜

- [ ] Home.
- [ ] Listado.
- [ ] Búsqueda.
- [ ] Filtros.
- [ ] Categorías.
- [ ] Detalle.
- [ ] Selector de comensales.
- [ ] Recalculado de ingredientes.
- [ ] Redondeo legible.
- [ ] WhatsApp.
- [ ] Copiar enlace.
- [ ] Recetas relacionadas.
- [ ] Páginas legales.

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

# Siguiente paso

## Cierre técnico de la Fase 4

Con los **10 bloques del editor completados**, el siguiente trabajo será estabilizar y cerrar el área administrativa antes de comenzar la Fase 5.

Pendientes principales:

- Eliminación segura de recetas.
- Previsualización administrativa.
- Revisión global de errores y mensajes.
- Revisión de caché y revalidación.
- Comprobación de permisos/RLS de todos los flujos.
- Limpieza de componentes `*-demo.tsx` que ya no sean necesarios.
- Revisión de `/design-system`.
- Eliminación o desactivación de `/supabase-test`.
- Eliminación o desactivación de `/admin/storage-test`.
- Pruebas de regresión del CRUD completo.
- `npx tsc --noEmit`.
- `npm run lint`.
- `npm run build`.

Después de este cierre comenzará la **Fase 5 — Área pública**, donde se implementarán el listado y detalle públicos, búsqueda, filtros y el selector de comensales con recalculado real de ingredientes.

---

## Evolución futura

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

## Autor

**Sergio Cáceres**

Desarrollador web full stack.

CociHub se desarrolla como aplicación real y proyecto de portfolio, documentando el proceso completo desde la idea inicial hasta el despliegue.