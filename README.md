<div align="center">

# 🍳 CociHub

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

Plataforma web de recetas personales para organizar, publicar, adaptar y compartir recetas desde cualquier dispositivo.

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-E5A93D?style=for-the-badge)

![Fase](https://img.shields.io/badge/fase%204-backend%20%2B%20CRUD-D95D39?style=for-the-badge)

![Next.js](https://img.shields.io/badge/Next.js-16-292522?style=for-the-badge&logo=nextdotjs)

![TypeScript](https://img.shields.io/badge/TypeScript-activo-3978A8?style=for-the-badge&logo=typescript)

![Supabase](https://img.shields.io/badge/Supabase-activo-3F7D57?style=for-the-badge&logo=supabase)

</div>

---

## 📌 Descripción

**CociHub** nace para centralizar recetas que inicialmente se comparten con familiares, amigos y compañeros de trabajo.

El objetivo del MVP es disponer de una aplicación web **mobile first**, rápida y sencilla, donde cualquier visitante pueda consultar recetas publicadas sin registrarse y ajustar las cantidades según el número de comensales.

La administración es privada. En la primera versión, **solo los administradores pueden crear y modificar recetas**. La arquitectura queda preparada para que, en una fase futura, usuarios normales puedan registrarse y publicar sus propias recetas.

CociHub también forma parte del portfolio profesional de **Sergio Cáceres**, cubriendo análisis funcional, UX/UI, frontend, backend, PostgreSQL, autenticación, seguridad, almacenamiento, validación, Git y despliegue.

---

## 🚦 Estado actual

### Fases

| Fase | Estado |
|---|---|
| 1. Definición funcional | ✅ Completada |
| 2. Arquitectura visual y UX | ✅ Completada |
| 3. Design System y componentes | ✅ Completada |
| 4. Arquitectura técnica, seguridad y CRUD | 🟡 En progreso |
| 5. Área pública y cierre del MVP | ⬜ Pendiente |
| 6. Despliegue, SEO y optimización | ⬜ Pendiente |

### Punto actual de la Fase 4

Ya están implementados y probados:

- ✅ Next.js + App Router + TypeScript + Tailwind.
- ✅ React Hook Form y Zod.
- ✅ Modelo PostgreSQL.
- ✅ Supabase conectado.
- ✅ Migraciones versionadas.
- ✅ Seeds iniciales.
- ✅ Supabase Auth.
- ✅ `profiles` y roles.
- ✅ Registro público desactivado para el MVP.
- ✅ Row Level Security.
- ✅ Área `/admin` protegida.
- ✅ Login y logout.
- ✅ Proxy SSR y refresco de sesión.
- ✅ Supabase Storage.
- ✅ Políticas Storage para administradores.
- ✅ Subida, lectura, sustitución y borrado de imágenes.
- ✅ Creación de borradores de recetas.
- ✅ Listado administrativo de recetas.
- ✅ Edición de recetas por ID.
- ✅ Imagen principal vinculada a una receta real mediante `image_path`.
- 🟡 Información básica real: implementada, en validación funcional.
- ⬜ Clasificación.
- ⬜ Raciones.
- ⬜ Tiempos.
- ⬜ Ingredientes.
- ⬜ Elaboración.
- ⬜ Información adicional.
- ⬜ Alérgenos.
- ⬜ Publicación / archivo / eliminación final.

---

## 🎯 Alcance del MVP

### Área pública

El visitante podrá:

- Consultar recetas sin iniciar sesión.
- Buscar y filtrar recetas.
- Consultar categorías.
- Ver el detalle completo de una receta.
- Cambiar el número de comensales.
- Recalcular automáticamente cantidades escalables.
- Compartir por WhatsApp o copiar el enlace.
- Consultar recetas relacionadas.
- Acceder a páginas legales y página 404.

### Área administrativa

El administrador podrá:

- Iniciar y cerrar sesión.
- Acceder a rutas protegidas.
- Crear borradores.
- Editar recetas.
- Subir y eliminar imágenes.
- Gestionar clasificación.
- Gestionar ingredientes y pasos.
- Guardar borradores.
- Publicar, despublicar y archivar.
- Gestionar categorías y etiquetas.

### Fuera del MVP inicial

- Registro público.
- Recetas creadas por usuarios normales.
- Comentarios.
- Valoraciones.
- Favoritos.
- Seguidores.
- Mensajería.
- Planificador de menús.
- Lista de la compra.
- Aplicación móvil nativa.
- Pagos.

La arquitectura sí queda preparada para incorporar cuentas de usuario y recetas propias posteriormente.

---

## 🧭 Rutas

### Públicas

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

La búsqueda se realizará mediante:

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

### Desarrollo interno

```text
/design-system
/admin/storage-test
/supabase-test
```

Las rutas de prueba se eliminarán o deshabilitarán antes de producción.

---

## 🧰 Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 |
| UI | React |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Formularios | React Hook Form |
| Validación | Zod |
| Backend | Next.js Server Components / Server Actions |
| Base de datos | PostgreSQL |
| Plataforma de datos | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | PostgreSQL RLS + roles |
| Imágenes | Supabase Storage |
| Iconos | Lucide React |
| Versionado DB | Supabase CLI + migraciones |
| Control de versiones | Git + GitHub |
| Despliegue previsto | Vercel |

### Node.js

Se recomienda trabajar con:

```text
Node.js >= 22
Node.js 24 LTS recomendado
```

Si se utiliza NVM:

```bash
nvm use
```

El repositorio puede incluir un `.nvmrc` con:

```text
24
```

---

## 🔐 Seguridad

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

La interfaz no es la barrera de seguridad principal. Las operaciones sobre datos y archivos están protegidas también mediante **Row Level Security**.

Roles preparados:

```text
admin
editor
user
```

En el MVP:

```text
admin → puede gestionar recetas
user  → no puede crear ni modificar recetas
anon  → solo contenido público
```

---

## 🗃️ Modelo de datos

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

Estados de receta:

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

## 🍽️ Cantidades y comensales

Cada receta publicada tendrá un número de **raciones base**.

Las cantidades guardadas son siempre las cantidades base. El visitante podrá cambiar los comensales sin modificar PostgreSQL.

```text
factor = raciones seleccionadas / raciones base
```

Cada ingrediente dispone de:

```ts
quantity: number | null
scalable: boolean
```

Solo se recalculan cantidades numéricas cuyo `scalable` sea `true`.

---

## 🖼️ Imágenes

Bucket:

```text
recipe-images
```

Estructura:

```text
recipe-images/
└── recipes/
    └── {recipeId}/
        ├── main.jpeg
        └── steps/
            ├── 01.webp
            └── 02.webp
```

PostgreSQL guarda la ruta en:

```text
recipes.image_path
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

## 🧾 Formulario de receta

Bloques previstos:

```text
01 Información básica
02 Imagen principal
03 Clasificación
04 Raciones
05 Tiempos
06 Ingredientes
07 Elaboración
08 Información adicional
09 Alérgenos
10 Publicación
```

Actualmente:

```text
Información básica  → implementada, pendiente de validación funcional final
Imagen principal    → funcional con Supabase Storage
```

Los strings opcionales vacíos se normalizan antes de persistir:

```text
"" → NULL
```

---

## 🎨 Identidad visual

Paleta principal:

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

La integración visual definitiva se realizará después de completar la funcionalidad del CRUD real.

---

## 📂 Estructura actual

```text
coci_hub/
├── database/
│   └── schema.sql
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── recipes/
│   │   │   └── storage-test/
│   │   ├── design-system/
│   │   ├── login/
│   │   └── supabase-test/
│   ├── components/
│   │   ├── admin/
│   │   │   └── recipes/
│   │   ├── layout/
│   │   └── ui/
│   ├── config/
│   ├── lib/
│   │   ├── recipes/
│   │   └── supabase/
│   ├── schemas/
│   ├── services/
│   │   ├── recipes/
│   │   └── storage/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── config.toml
│   └── seed.sql
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Desarrollo local

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

## 🗄️ Migraciones

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

Las migraciones aplicadas no deben modificarse. Cada cambio posterior se realiza mediante una migración nueva.

---

## 🗺️ Roadmap actualizado

### Fase 1 — Definición funcional ✅

- [x] Visión.
- [x] Público objetivo.
- [x] Alcance MVP.
- [x] Historias de usuario.
- [x] Modelo funcional de receta.
- [x] Modelo de datos inicial.
- [x] Identidad visual.

### Fase 2 — Arquitectura visual y UX ✅

- [x] Sitemap.
- [x] Rutas.
- [x] Wireframes.
- [x] Responsive.
- [x] Flujos.
- [x] Área pública / privada.
- [x] Diseño del formulario.

### Fase 3 — Design System ✅

- [x] Tokens principales.
- [x] Tipografías.
- [x] Componentes UI básicos.
- [x] Demos de todos los bloques de receta.
- [x] Composición `RecipeFormDemo`.
- [x] Página `/design-system`.

### Fase 4 — Arquitectura técnica y CRUD 🟡

- [x] Estructura técnica.
- [x] TypeScript del dominio.
- [x] Validaciones Zod.
- [x] PostgreSQL.
- [x] Supabase.
- [x] Migraciones.
- [x] Seeds.
- [x] Auth.
- [x] Profiles / roles.
- [x] RLS.
- [x] Login / logout.
- [x] Protección de `/admin`.
- [x] Proxy SSR.
- [x] Storage.
- [x] Políticas Storage.
- [x] CRUD mínimo de borradores.
- [x] Listado administrativo.
- [x] Edición por ID.
- [x] Imagen principal real.
- [ ] Validar funcionalmente Información básica.
- [ ] Clasificación real.
- [ ] Raciones reales.
- [ ] Tiempos reales.
- [ ] Ingredientes reales.
- [ ] Elaboración real.
- [ ] Información adicional real.
- [ ] Alérgenos reales.
- [ ] Publicación / archivo / eliminación.
- [ ] Gestión de errores definitiva.
- [ ] Caché y revalidación definitiva.

### Fase 5 — Área pública

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

### Fase 6 — Cierre y despliegue

- [ ] Accesibilidad.
- [ ] SEO.
- [ ] Metadata / Open Graph.
- [ ] Sitemap.
- [ ] `robots.txt`.
- [ ] Optimización de imágenes.
- [ ] Pruebas finales.
- [ ] Vercel.
- [ ] Dominio.
- [ ] Monitorización y mantenimiento.

---

## 🤖 Evolución futura

Fuera del MVP se contempla:

- Registro público.
- Recetas creadas por usuarios.
- Favoritos y valoraciones.
- Comentarios.
- Planificador.
- Lista de la compra.
- Funciones sociales.
- Importación asistida por IA.

La importación con IA nunca publicará automáticamente; el contenido pasará por validación y revisión humana.

---

## 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web full stack.

---

<div align="center">

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

</div>
