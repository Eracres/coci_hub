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

La aplicación permitirá centralizar recetas, organizarlas por tipos, categorías y etiquetas, consultarlas cómodamente desde el móvil, ajustar cantidades según el número de comensales y compartirlas mediante WhatsApp o enlace.

Aunque el público inicial será cercano, la arquitectura se está preparando para crecer en el futuro hacia una plataforma pública donde otros usuarios puedan registrarse y aportar sus propias recetas.

CociHub también forma parte del portfolio profesional de **Sergio Cáceres**, mostrando el desarrollo completo de una aplicación real: análisis funcional, UX/UI, frontend, backend, PostgreSQL, autenticación, seguridad, almacenamiento, validación, Git y despliegue.

---

# 🚦 Estado actual del proyecto

| Fase | Estado |
|---|---|
| Fase 1 — Definición funcional | ✅ Completada |
| Fase 2 — Arquitectura visual y UX | ✅ Completada |
| Fase 3 — Design System y componentes | ✅ Completada |
| Fase 4 — Arquitectura técnica + CRUD administrador | 🟡 En progreso |
| Fase 5 — Área pública | ⬜ Pendiente |
| Fase 6 — SEO, optimización y despliegue | ⬜ Pendiente |

## Punto actual

- ✅ Next.js + App Router.
- ✅ React + TypeScript.
- ✅ Tailwind CSS.
- ✅ React Hook Form.
- ✅ Zod.
- ✅ PostgreSQL.
- ✅ Supabase.
- ✅ Migraciones y seeds.
- ✅ Supabase Auth.
- ✅ `profiles` y roles.
- ✅ Registro público desactivado en el MVP.
- ✅ Row Level Security.
- ✅ Login y logout.
- ✅ Protección real de `/admin`.
- ✅ Proxy SSR y refresco de sesión.
- ✅ Supabase Storage.
- ✅ Políticas de seguridad para Storage.
- ✅ Subida, reemplazo y eliminación de imágenes.
- ✅ Creación de borradores.
- ✅ Listado administrativo de recetas.
- ✅ Edición de recetas por ID.
- ✅ Información básica real.
- ✅ Imagen principal real.
- ✅ Clasificación real.
- ✅ Gestión de categorías.
- ✅ Raciones base reales.
- 🟡 Siguiente bloque: **Tiempos**.

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

---

# 🧰 Stack tecnológico

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
| Plataforma de datos | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | PostgreSQL RLS + roles |
| Imágenes | Supabase Storage |
| Iconos | Lucide React |
| Versionado DB | Supabase CLI + migraciones |
| Control de versiones | Git + GitHub |
| Despliegue previsto | Vercel |

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

---

# 🧾 Editor de recetas

```text
01 Información básica       ✅
02 Imagen principal         ✅
03 Clasificación            ✅
04 Raciones                 ✅
05 Tiempos                  ← siguiente
06 Ingredientes             ⬜
07 Elaboración              ⬜
08 Información adicional    ⬜
09 Alérgenos                ⬜
10 Publicación              ⬜
```

---

# 🍽️ Raciones y cantidades

Cada receta guarda:

```text
base_servings
```

Ejemplo:

```text
Raciones base: 4
```

En el área pública:

```text
factor = raciones seleccionadas / raciones base
```

La base de datos mantiene siempre las cantidades originales.

Cada ingrediente tendrá:

```ts
quantity: number | null;
scalable: boolean;
```

Solo se recalcularán cantidades numéricas cuyo `scalable` sea `true`.

---

# ⏱️ Tiempos

El siguiente bloque gestionará:

```text
preparation_minutes
cooking_minutes
additional_minutes
```

El tiempo total no se almacenará:

```text
tiempo total =
  preparación
  + cocción
  + tiempo adicional
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

Comprobaciones:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

# 🗄️ Migraciones

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Las migraciones aplicadas no se modifican. Cada cambio posterior se realiza mediante una migración nueva.

---

# 🗺️ Roadmap

## Fase 1 — Definición funcional ✅
- [x] Visión y alcance.
- [x] Público objetivo.
- [x] Historias de usuario.
- [x] Modelo funcional de receta.
- [x] Modelo de datos inicial.
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
- [x] Demos de todos los bloques.
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
- [ ] Tiempos.
- [ ] Ingredientes.
- [ ] Elaboración.
- [ ] Información adicional.
- [ ] Alérgenos.
- [ ] Publicación / archivo / eliminación.
- [ ] Errores definitivos.
- [ ] Caché y revalidación definitivas.

## Fase 5 — Área pública ⬜
- [ ] Home.
- [ ] Listado público.
- [ ] Búsqueda.
- [ ] Filtros.
- [ ] Categorías.
- [ ] Detalle.
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
- [ ] Optimización de imágenes.
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
- Lista de la compra.
- Funciones sociales.
- Importación asistida por IA.

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web full stack.

---

<div align="center">

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

</div>