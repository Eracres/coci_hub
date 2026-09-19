# 🍳 CociHub

> **Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

Aplicación web full stack de recetas personales para organizar, publicar, adaptar y compartir recetas desde cualquier dispositivo.

---

## Estado actual

| Fase | Estado |
|---|---|
| Fase 1 — Definición funcional | ✅ Completada |
| Fase 2 — Arquitectura visual y UX | ✅ Completada |
| Fase 3 — Design System y prototipos | ✅ Completada |
| Fase 4 — Arquitectura técnica + CRUD administrador | ✅ Completada |
| Fase 5 — Área pública | 🟡 En cierre |
| Extensión — Importación asistida por IA | ✅ Completada |
| Fase 6 — Pulido, SEO, optimización y despliegue | ⬜ Pendiente |

CociHub ya dispone de un flujo administrativo completo, área pública funcional e importación de recetas desde imagen mediante IA con revisión humana obligatoria.

La prioridad actual es **cerrar el producto**, no añadir nuevas funcionalidades. Las mejoras funcionales futuras se estudiarán después del despliegue inicial y de realizar un backup estable del proyecto.

---

## Funcionalidades implementadas

### Base técnica

- Next.js 16 con App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Zod.
- React Hook Form.
- Server Components.
- Client Components cuando la interacción lo requiere.
- Server Actions.
- Route Handlers para endpoints internos.
- PostgreSQL.
- Supabase.
- Supabase CLI.
- Migraciones SQL versionadas.
- Seeds.
- Git y GitHub.
- Node.js 22 o superior recomendado.
- `.nvmrc` para fijar la versión de Node del proyecto.

---

## Autenticación y seguridad

- Supabase Auth.
- Login y logout administrativo.
- Tabla `profiles`.
- Roles preparados: `admin`, `editor`, `user`.
- MVP restringido a administradores.
- Protección de `/admin`.
- Proxy SSR y refresco de sesión.
- Row Level Security.
- Políticas de lectura y escritura.
- Policies específicas para Storage.
- Comprobación de rol administrativo en operaciones sensibles.
- Validación tanto en aplicación como en PostgreSQL.
- Variables de entorno privadas para claves y configuración.
- `.env.local` excluido de Git.

Flujo general de seguridad:

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
Server Action / Route Handler
   ↓
Service
   ↓
Supabase Auth
   ↓
RLS / funciones PostgreSQL
```

---

## Storage de imágenes

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
- Cache-busting al sustituir imágenes.

Formatos admitidos:

```text
JPEG
PNG
WebP
```

Máximo actual:

```text
5 MB
```

---

## Gestión administrativa de recetas

El CRUD administrativo está completado.

Ya funciona:

- Crear borradores.
- Listar recetas.
- Editar recetas por ID.
- Eliminar recetas de forma segura.
- Previsualizar recetas.
- Título.
- Slug.
- Descripción corta.
- Introducción.
- Imagen principal.
- Texto alternativo de imagen.
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
- Publicación.
- Gestión de `published_at`.
- Despublicación y vuelta a borrador.
- Archivado.
- Restauración de recetas archivadas a borrador.
- Validación de publicación tanto en aplicación como en PostgreSQL.

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

---

## Creación de recetas

CociHub dispone actualmente de dos flujos de creación.

### Creación manual

```text
Nueva receta
   ↓
Título
   ↓
Crear borrador
   ↓
Editor completo
   ↓
Publicar cuando esté lista
```

### Importación con IA

```text
Imagen
   ↓
Análisis multimodal
   ↓
JSON estructurado
   ↓
Validación Zod
   ↓
Revisión humana editable
   ↓
Normalización al modelo CociHub
   ↓
Borrador real
   ↓
Editor normal
   ↓
Publicación manual
```

Ambos flujos terminan en el mismo editor y generan recetas normales dentro del mismo modelo de datos.

---

# 🤖 Importación asistida por IA

La importación desde imagen está implementada y probada con recetas reales.

Proveedor actual:

```text
Google Gemini API
```

SDK:

```text
@google/genai
```

El modelo se configura mediante variable de entorno:

```text
GEMINI_RECIPE_IMPORT_MODEL
```

La clave permanece exclusivamente en servidor:

```text
GEMINI_API_KEY
```

Nunca debe utilizarse una variable `NEXT_PUBLIC_*` para esta clave.

## Flujo

```text
Imagen
   ↓
POST /api/admin/recipes/import
   ↓
Autenticación
   ↓
Comprobación de rol admin
   ↓
Gemini multimodal
   ↓
Structured JSON
   ↓
Zod
   ↓
Revisión humana
   ↓
POST /api/admin/recipes/import/draft
   ↓
Normalización
   ↓
Supabase
   ↓
Borrador
   ↓
Editor
```

## Reglas de seguridad y comportamiento

- Solo un administrador autenticado puede utilizar la función.
- Se aceptan JPG, PNG y WebP.
- Tamaño máximo: 5 MB.
- La IA no publica recetas automáticamente.
- El resultado siempre pasa por revisión humana.
- La receta importada se crea siempre como `draft`.
- Los campos no detectados permanecen `null` o vacíos.
- La IA no debe inventar información ausente.
- Las sugerencias de categorías, etiquetas, tipos y alérgenos se comparan con los catálogos existentes.
- No se crean automáticamente nuevos elementos de catálogo.
- Los grupos de ingredientes sin nombre se normalizan antes de persistirlos.
- La imagen utilizada como fuente para leer la receta no se convierte automáticamente en la imagen pública del plato.
- Si falla la creación secundaria del borrador se intenta limpiar la receta creada para evitar registros incompletos.

## Datos extraídos

El contrato de importación puede contener:

- Título.
- Descripción corta.
- Introducción.
- Raciones.
- Dificultad.
- Tiempos.
- Grupos de ingredientes.
- Ingredientes.
- Pasos.
- Alérgenos.
- Sugerencias de clasificación.
- Fuente.
- Texto original detectado.
- Nivel de confianza.
- Campos inciertos.
- Advertencias.

---

# 🌍 Área pública

El área pública ya está funcional y solo muestra recetas con estado `published`.

## Inicio

La Home incluye:

- Presentación de CociHub.
- Eslogan oficial.
- Recetas destacadas.
- Recetas recientes.
- Categorías principales.
- Accesos a exploración de recetas.

## Listado de recetas

Ruta:

```text
/recipes
```

Incluye:

- Recetas publicadas.
- Búsqueda.
- Filtros.
- Ordenación.
- Contador de resultados.
- Estados sin resultados.

Búsqueda:

```text
/recipes?search=...
```

## Detalle de receta

Ruta:

```text
/recipes/[slug]
```

Incluye:

- Título.
- Imagen.
- Descripción.
- Introducción.
- Clasificación.
- Dificultad.
- Tiempos.
- Raciones.
- Ingredientes.
- Pasos.
- Información adicional.
- Alérgenos.
- Acciones de compartir.
- Recetas relacionadas.

Los borradores y recetas archivadas no son accesibles públicamente.

## Selector de raciones

Rango público actual:

```text
1–20 raciones
```

Factor:

```text
factor =
  raciones seleccionadas
  / raciones base
```

Solo se recalculan cantidades numéricas con:

```text
scalable = true
```

Las cantidades originales almacenadas nunca se modifican.

Expresiones como:

```text
al gusto
una pizca
cantidad necesaria
```

no se recalculan.

## Compartir

Actualmente se soporta:

- Compartir nativo del dispositivo cuando está disponible.
- WhatsApp.
- Telegram.
- Correo electrónico.
- Copiar enlace.

## Recetas relacionadas

Las recetas relacionadas se calculan utilizando coincidencias de:

- Tipo de receta.
- Categorías.
- Etiquetas.

---

# 🗂️ Categorías

Rutas:

```text
/categories
/categories/[slug]
```

Permiten:

- Consultar categorías públicas.
- Ver recetas publicadas asociadas.
- Navegar desde una categoría al detalle de una receta.

---

# 🍽️ Modelo funcional de receta

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

## Clasificación

```text
1 tipo principal
1 o más categorías para publicar
0 o más etiquetas
```

## Tiempos

Se almacenan:

```text
preparation_minutes
cooking_minutes
additional_minutes
```

El tiempo total se calcula:

```text
total =
  preparation_minutes
  + cooking_minutes
  + additional_minutes
```

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

---

# 📋 Elaboración

Tabla:

```text
recipe_steps
```

Campos:

```text
title
instructions
duration_minutes
tip
position
```

El editor permite añadir, editar, duplicar, eliminar y reordenar pasos.

Las imágenes por paso quedan reservadas para una evolución posterior.

---

# ℹ️ Información adicional

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

Relación:

```text
recipe_allergens
```

> La información sobre alérgenos es orientativa y no sustituye la comprobación del etiquetado de los productos utilizados ni contempla por sí sola posibles contaminaciones cruzadas.

---

# 🚦 Publicación

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

## Requisitos mínimos de publicación

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

La validación se realiza en varios niveles:

```text
Interfaz
   ↓
Checklist
   ↓
Servidor
   ↓
PostgreSQL
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

Enums principales:

```text
role:
  admin
  editor
  user

recipe status:
  draft
  published
  archived

difficulty:
  easy
  medium
  hard

allergen presence:
  present
  possible

source type:
  own
  family
  book
  magazine
  web
  handwritten
  other
```

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

Las rutas `/about`, `/privacy`, `/cookies` y `/legal-notice` forman parte del cierre pendiente antes del despliegue definitivo.

## Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/import
/admin/recipes/[id]/edit
/admin/recipes/[id]/preview
/admin/categories
/admin/tags
```

## API interna de importación IA

```text
POST /api/admin/recipes/import
POST /api/admin/recipes/import/draft
```

## Rutas temporales eliminadas

Ya se eliminaron:

```text
/design-system
/supabase-test
/admin/storage-test
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
| Backend | Server Components + Server Actions + Route Handlers |
| Base de datos | PostgreSQL |
| Plataforma | Supabase |
| Auth | Supabase Auth |
| Seguridad | RLS + roles |
| Imágenes | Supabase Storage |
| IA | Google Gemini API |
| SDK IA | `@google/genai` |
| Iconos | Lucide React |
| Migraciones | Supabase CLI |
| Versionado | Git + GitHub |
| Despliegue | Servidor/hosting Node + dominio propio, por definir |

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

La funcionalidad está prácticamente cerrada. El siguiente gran bloque es el pulido visual global para aplicar de forma consistente esta identidad a toda la aplicación.

---

# 📂 Estructura actual orientativa

```text
coci_hub/
├── database/
├── docs/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
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
│   │   ├── ai/
│   │   └── supabase/
│   ├── schemas/
│   ├── services/
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
├── tsconfig.json
└── README.md
```

> `.env.local` existe solo en el entorno local y no debe añadirse nunca al repositorio.

---

# 🧪 Comprobaciones antes de commit

Comprobaciones generales:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Comprobación de secretos locales:

```bash
git check-ignore .env.local
```

Debe devolver:

```text
.env.local
```

Para cambios de base de datos:

```bash
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Una migración aplicada no se modifica: se crea una nueva migración para corregir o evolucionar el esquema.

## Estado conocido del lint

Actualmente existen dos warnings aceptados de React Compiler relacionados con `watch()` de React Hook Form:

```text
recipe-basic-info-form.tsx
recipe-times-form.tsx
```

No son errores de compilación.

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
- [x] Diseño de formularios.
- [x] Diseño de tarjetas.
- [x] Estados visuales.

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
- [x] Eliminación segura.
- [x] Previsualización.
- [x] Revisión global de errores.
- [x] Limpieza de rutas temporales.
- [x] Pruebas de regresión del CRUD.

## Fase 5 — Área pública 🟡

- [x] Home.
- [x] Listado de recetas.
- [x] Búsqueda.
- [x] Filtros.
- [x] Ordenación.
- [x] Categorías.
- [x] Detalle de receta.
- [x] Selector de raciones.
- [x] Recalculado de ingredientes.
- [x] WhatsApp.
- [x] Telegram.
- [x] Correo electrónico.
- [x] Compartir nativo.
- [x] Copiar enlace.
- [x] Recetas relacionadas.
- [ ] Página Sobre CociHub.
- [ ] Página 404 definitiva.
- [ ] Estados de error finales.
- [ ] Aviso legal.
- [ ] Política de privacidad.
- [ ] Política de cookies.
- [ ] Revisión responsive final.

## Extensión — Importación asistida por IA ✅

- [x] Contrato JSON.
- [x] Schema Zod.
- [x] Carga y previsualización de imagen.
- [x] Validación de formato y tamaño.
- [x] Endpoint protegido.
- [x] Gemini multimodal.
- [x] Structured Output.
- [x] Validación de respuesta.
- [x] Revisión humana editable.
- [x] Ingredientes y grupos.
- [x] Pasos.
- [x] Tiempos.
- [x] Alérgenos.
- [x] Clasificación sugerida.
- [x] Normalización de catálogos.
- [x] Creación de borrador real.
- [x] Rollback de creación incompleta.
- [x] Redirección al editor.
- [x] Integración en `/admin/recipes/new`.
- [x] Pruebas reales con varias recetas.
- [x] Garantía de publicación manual.

## Fase 6 — Cierre y despliegue ⬜

- [ ] Pulido visual global.
- [ ] Responsive final.
- [ ] Accesibilidad.
- [ ] Página 404.
- [ ] Estados vacíos y de error.
- [ ] Páginas legales.
- [ ] SEO.
- [ ] Metadata.
- [ ] Open Graph.
- [ ] JSON-LD.
- [ ] Sitemap.
- [ ] `robots.txt`.
- [ ] Optimización de imágenes.
- [ ] Optimización de rendimiento.
- [ ] Regresión completa.
- [ ] `npm run build`.
- [ ] Preparación del servidor.
- [ ] Configuración de producción.
- [ ] Dominio.
- [ ] HTTPS.
- [ ] Backup estable previo a nuevas funcionalidades.
- [ ] Despliegue público.

---

# 🎯 Siguiente paso

## Pulido y cierre de CociHub

La funcionalidad principal está construida.

El trabajo continúa con:

```text
Diseño visual final
      ↓
Responsive
      ↓
404 / errores / estados vacíos
      ↓
About
      ↓
Legal / privacidad / cookies
      ↓
SEO / metadata / Open Graph / JSON-LD
      ↓
Rendimiento
      ↓
Build y regresión completa
      ↓
Servidor + dominio
      ↓
Backup estable
      ↓
Producción
```

Durante esta fase no se introducirán nuevas funcionalidades importantes salvo que aparezca un requisito imprescindible para completar el MVP.

---

# 🔮 Evolución futura

Las nuevas funcionalidades se valorarán después de:

```text
CociHub terminado
   ↓
Despliegue estable
   ↓
Backup completo
   ↓
Uso real
   ↓
Evaluación de demanda
```

Posibles líneas de evolución ya contempladas:

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
- Nuevas mejoras funcionales definidas tras el lanzamiento.
- Sistema de IA alternativo o autoalojado si resulta conveniente.
- Migración a servicios de IA de pago únicamente si el uso real lo justifica.

La arquitectura de importación está preparada para mantener separado el proveedor de IA del resto del flujo de CociHub.

---

# 📚 Documentación y aprendizaje

CociHub se desarrolla también como proyecto de aprendizaje y portfolio.

Una vez finalizado el proyecto se realizará una revisión técnica completa para documentar y comprender:

- Arquitectura general.
- App Router.
- Server y Client Components.
- Server Actions.
- Route Handlers.
- Supabase.
- PostgreSQL.
- RLS.
- Autenticación.
- Storage.
- CRUD.
- Zod.
- React Hook Form.
- Servicios.
- Importación IA.
- Seguridad.
- Git.
- Migraciones.
- Despliegue.
- Decisiones de arquitectura tomadas durante el desarrollo.

El objetivo será poder explicar no solo **qué hace cada parte**, sino también **por qué se diseñó de esa forma**.

---

# 👨‍💻 Autor

**Sergio Cáceres**

Desarrollador web full stack.

CociHub se desarrolla como aplicación real y proyecto de portfolio, documentando el proceso completo desde la idea inicial hasta el despliegue.

---

# 📄 Licencia

La licencia se definirá antes de la publicación de la primera versión estable.
