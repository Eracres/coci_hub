<div align="center">

# 🍳 CociHub

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

Plataforma web de recetas personales para organizar, publicar, adaptar y compartir recetas desde cualquier dispositivo.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-E5A93D?style=for-the-badge)
![Fase](https://img.shields.io/badge/fase%204-CRUD%20admin-D95D39?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-292522?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-activo-3978A8?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-activo-3F7D57?style=for-the-badge&logo=supabase)

</div>

---

## 📌 Descripción

**CociHub** es una plataforma web de recetas personales creada inicialmente para compartir recetas con familiares, amigos y compañeros de trabajo.

El MVP permite construir y administrar recetas completas desde un área privada y segura. La arquitectura queda preparada para que, más adelante, otros usuarios puedan registrarse y aportar sus propias recetas.

CociHub también forma parte del portfolio profesional de **Sergio Cáceres**, mostrando un proyecto full stack real con frontend, backend, PostgreSQL, autenticación, seguridad, almacenamiento, validación, migraciones, Git y despliegue.

---

# 🚦 Estado actual

| Fase | Estado |
|---|---|
| Fase 1 — Definición funcional | ✅ Completada |
| Fase 2 — Arquitectura visual y UX | ✅ Completada |
| Fase 3 — Design System | ✅ Completada |
| Fase 4 — Arquitectura técnica + CRUD administrador | 🟡 En progreso |
| Fase 5 — Área pública | ⬜ Pendiente |
| Fase 6 — SEO, optimización y despliegue | ⬜ Pendiente |

## Fase 4 — Punto actual

```text
01 Información básica       ✅
02 Imagen principal         ✅
03 Clasificación            ✅
04 Raciones                 ✅
05 Tiempos                  ✅
06 Ingredientes             ✅
07 Elaboración              ✅
08 Información adicional    ← siguiente
09 Alérgenos                ⬜
10 Publicación              ⬜
```

Ya están implementados y probados:

- ✅ Next.js + App Router + TypeScript.
- ✅ Tailwind CSS.
- ✅ React Hook Form.
- ✅ Zod.
- ✅ PostgreSQL + Supabase.
- ✅ Migraciones versionadas y seeds.
- ✅ Supabase Auth.
- ✅ `profiles` y roles.
- ✅ Registro público desactivado durante el MVP.
- ✅ Row Level Security.
- ✅ Login / logout.
- ✅ Protección de `/admin`.
- ✅ Proxy SSR.
- ✅ Supabase Storage.
- ✅ Políticas de Storage para administradores.
- ✅ Creación de borradores.
- ✅ Listado administrativo.
- ✅ Edición por ID.
- ✅ Información básica.
- ✅ Imagen principal.
- ✅ Clasificación.
- ✅ Categorías.
- ✅ Raciones base.
- ✅ Tiempos.
- ✅ Ingredientes agrupados.
- ✅ Ingredientes escalables mediante `scalable`.
- ✅ Pasos de elaboración ordenables.

---

# 🎯 Alcance del MVP

## Área pública

El visitante podrá:

- Consultar recetas sin iniciar sesión.
- Buscar y filtrar recetas.
- Consultar categorías.
- Ver la receta completa.
- Cambiar el número de comensales.
- Recalcular cantidades escalables.
- Compartir por WhatsApp.
- Copiar el enlace.
- Consultar recetas relacionadas.

## Área administrativa

El administrador podrá:

- Iniciar y cerrar sesión.
- Crear borradores.
- Editar recetas.
- Gestionar imágenes.
- Gestionar clasificación.
- Gestionar categorías y etiquetas.
- Gestionar raciones y tiempos.
- Gestionar ingredientes.
- Gestionar pasos de elaboración.
- Gestionar información adicional.
- Gestionar alérgenos.
- Publicar, despublicar y archivar.

## Fuera del MVP inicial

- Registro público.
- Recetas de usuarios normales.
- Comentarios.
- Valoraciones.
- Favoritos.
- Seguidores.
- Mensajería.
- Planificador.
- Lista de compra.
- Pagos.
- Aplicación móvil nativa.

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
/login
/privacy
/cookies
/legal-notice
```

Búsqueda:

```text
/recipes?search=...
```

## Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/categories
/admin/tags
```

## Desarrollo interno

```text
/design-system
/admin/storage-test
/supabase-test
```

Estas rutas temporales se eliminarán o deshabilitarán antes de producción.

---

# 🧰 Stack

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 |
| UI | React |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Formularios | React Hook Form + estado local en editores complejos |
| Validación | Zod |
| Backend | Server Components + Server Actions |
| Base de datos | PostgreSQL |
| Plataforma | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | PostgreSQL RLS + roles |
| Imágenes | Supabase Storage |
| Iconos | Lucide React |
| Migraciones | Supabase CLI |
| Control de versiones | Git + GitHub |
| Despliegue previsto | Vercel |

Node recomendado:

```text
Node.js >= 22
Node.js 24 LTS recomendado
```

---

# 🔐 Seguridad

```text
/login
   ↓
Supabase Auth
   ↓
Sesión / JWT
   ↓
Proxy SSR
   ↓
Admin Layout
   ↓
profiles.role = admin
   ↓
RLS
   ↓
PostgreSQL / Storage
```

Roles preparados:

```text
admin
editor
user
```

Durante el MVP:

```text
admin → puede gestionar recetas
user  → no puede modificar contenido
anon  → solo contenido público
```

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

Alérgenos:

```text
present
possible
```

---

# 📝 Información básica

Campos reales:

```text
title
slug
short_description
introduction
```

Los opcionales vacíos se normalizan:

```text
"" → NULL
```

---

# 🖼️ Imagen principal

Bucket:

```text
recipe-images
```

Ruta almacenada:

```text
recipes.image_path
```

Estructura prevista:

```text
recipe-images/
└── recipes/
    └── {recipeId}/
        ├── main.jpeg
        └── steps/
            ├── 01.webp
            └── 02.webp
```

Formatos actuales:

```text
JPEG
PNG
WebP
```

Máximo:

```text
5 MB
```

---

# 🗂️ Clasificación

Cada receta puede gestionar:

```text
recipe_type_id
difficulty
featured
categories
tags
```

---

# 🍽️ Raciones y cantidades

Cada receta almacena:

```text
base_servings
```

En el área pública:

```text
factor = raciones seleccionadas / raciones base
```

Cada ingrediente dispone de:

```ts
quantity: number | null;
scalable: boolean;
```

Solo se recalculan cantidades numéricas cuyo `scalable` sea `true`.

---

# ⏱️ Tiempos

Se almacenan:

```text
preparation_minutes
cooking_minutes
additional_minutes
```

El total se calcula, pero no se guarda:

```text
total = preparation_minutes + cooking_minutes + additional_minutes
```

---

# 🥕 Ingredientes

Las recetas admiten grupos ordenados de ingredientes.

Ejemplo:

```text
Ingredientes principales
Para la salsa
Para decorar
```

Cada ingrediente dispone de:

```text
name
quantity
unit
notes
scalable
position
```

El editor permite añadir, editar, duplicar, eliminar y reordenar grupos e ingredientes.

El guardado completo se realiza de forma atómica mediante:

```text
replace_recipe_ingredients(...)
```

---

# 👨‍🍳 Elaboración

Cada receta puede tener una secuencia ordenada de pasos.

Campos actuales:

```text
title
instructions
duration_minutes
tip
position
```

Funciones disponibles:

```text
Añadir paso
Editar paso
Duplicar paso
Eliminar paso
Reordenar pasos
```

El guardado se realiza mediante:

```text
replace_recipe_steps(...)
```

La imagen opcional por paso queda reservada para una iteración posterior.

---

# 🧪 Borradores y publicación

Los borradores pueden estar incompletos.

Ejemplo válido:

```text
title              definido
slug               definido
difficulty         null
base_servings      null
recipe_type_id     null
categories         []
ingredients        []
steps              []
```

Para publicar se exigirán, entre otros:

- Título.
- Slug único.
- Descripción corta.
- Imagen principal.
- Tipo.
- Al menos una categoría.
- Dificultad.
- Raciones base.
- Tiempo de preparación.
- Al menos un ingrediente.
- Al menos un paso.

---

# 🗄️ Migraciones

Las migraciones se encuentran en:

```text
supabase/migrations/
```

Se deben conservar porque forman el historial versionado del esquema.

Comandos principales:

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Una migración ya aplicada no debe modificarse. Los cambios posteriores se realizan mediante una nueva migración.

---

# 🧹 Limpieza técnica prevista

Los componentes:

```text
*-demo.tsx
```

se mantienen temporalmente mientras `/design-system` los utilice.

Antes de comenzar el área pública se revisarán y eliminarán, cuando corresponda:

```text
componentes demo sin uso
/design-system
/supabase-test
/admin/storage-test
código muerto
imports sobrantes
dependencias sin uso
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
| Texto | `#292522` |
| Texto secundario | `#6F675F` |
| Borde | `#DED3C8` |

Tipografía:

```text
Lora  → títulos y contenido editorial
Inter → interfaz y formularios
```

---

# ⚙️ Desarrollo local

```bash
npm ci
npm run dev
```

Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Nunca versionar `.env.local`.

Comprobaciones:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

# 🗺️ Roadmap

## Fase 1 — Definición funcional ✅

- [x] Visión y alcance.
- [x] Público objetivo.
- [x] Historias de usuario.
- [x] Modelo funcional.
- [x] Modelo de datos.
- [x] Identidad visual.

## Fase 2 — Arquitectura visual y UX ✅

- [x] Sitemap.
- [x] Rutas.
- [x] Wireframes.
- [x] Responsive.
- [x] Flujos.
- [x] Área pública y privada.

## Fase 3 — Design System ✅

- [x] Tokens.
- [x] Tipografías.
- [x] Componentes UI.
- [x] Demos.
- [x] `RecipeFormDemo`.
- [x] `/design-system`.

## Fase 4 — Arquitectura técnica y CRUD 🟡

- [x] Estructura técnica.
- [x] TypeScript.
- [x] Zod.
- [x] PostgreSQL.
- [x] Supabase.
- [x] Migraciones.
- [x] Seeds.
- [x] Auth.
- [x] Profiles y roles.
- [x] RLS.
- [x] Login y logout.
- [x] Protección `/admin`.
- [x] Proxy SSR.
- [x] Storage.
- [x] Políticas Storage.
- [x] Crear borradores.
- [x] Listar recetas.
- [x] Editar receta por ID.
- [x] Información básica.
- [x] Imagen principal.
- [x] Clasificación.
- [x] Categorías.
- [x] Raciones.
- [x] Tiempos.
- [x] Ingredientes.
- [x] Elaboración.
- [ ] Información adicional.
- [ ] Alérgenos.
- [ ] Publicación / archivo / eliminación.
- [ ] Gestión de errores definitiva.
- [ ] Caché y revalidación definitivas.
- [ ] Limpieza técnica del área admin.

## Fase 5 — Área pública ⬜

- [ ] Home.
- [ ] Listado público.
- [ ] Búsqueda.
- [ ] Filtros.
- [ ] Categorías.
- [ ] Detalle de receta.
- [ ] Selector de comensales.
- [ ] Recalculado de ingredientes.
- [ ] Compartir.
- [ ] Recetas relacionadas.
- [ ] Páginas legales.

## Fase 6 — Cierre y despliegue ⬜

- [ ] Accesibilidad.
- [ ] SEO.
- [ ] Metadata / Open Graph.
- [ ] Sitemap.
- [ ] `robots.txt`.
- [ ] Optimización.
- [ ] Pruebas finales.
- [ ] Vercel.
- [ ] Dominio.
- [ ] Monitorización.

---

# 🤖 Evolución futura

- Registro público.
- Recetas creadas por usuarios.
- Favoritos.
- Valoraciones.
- Comentarios.
- Planificador.
- Lista de compra.
- Funciones sociales.
- Imágenes por paso.
- Importación asistida por IA.

La futura importación con IA seguirá un flujo de revisión humana:

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

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web full stack.

---

<div align="center">

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

</div>
