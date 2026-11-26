<div align="center">

# 🍳 CociHub

### Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

Plataforma web gastronómica para descubrir, organizar, adaptar, crear y compartir recetas desde cualquier dispositivo.

![Estado](https://img.shields.io/badge/estado-desarrollo%20activo-3F7D57?style=for-the-badge)
![Deploy](https://img.shields.io/badge/deploy-Vercel-292522?style=for-the-badge&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-16-292522?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-3978A8?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth%20%2B%20Storage-3F7D57?style=for-the-badge&logo=supabase)

**Producción:** https://cocihub.com

**Proyecto en desarrollo activo y fase de estabilización.**

</div>

---

## Índice

- [Descripción](#descripción)
- [Estado del proyecto](#estado-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Arquitectura](#arquitectura)
- [Rutas](#rutas)
- [Stack tecnológico](#stack-tecnológico)
- [Base de datos](#base-de-datos)
- [Seguridad](#seguridad)
- [Motor de tiempos](#motor-de-tiempos)
- [Motor alimentario y alérgenos](#motor-alimentario-y-alérgenos)
- [Importación mediante IA](#importación-mediante-ia)
- [Correo y notificaciones](#correo-y-notificaciones)
- [Almacenamiento](#almacenamiento)
- [SEO y rendimiento](#seo-y-rendimiento)
- [Identidad visual](#identidad-visual)
- [Variables de entorno](#variables-de-entorno)
- [Instalación local](#instalación-local)
- [GitHub Codespaces](#github-codespaces)
- [Comprobaciones](#comprobaciones)
- [Despliegue](#despliegue)
- [Auditoría y calidad](#auditoría-y-calidad)
- [Roadmap](#roadmap)
- [Documentación](#documentación)
- [Versionado y flujo Git](#versionado-y-flujo-git)
- [Consideraciones legales](#consideraciones-legales)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Descripción

**CociHub** es una plataforma web gastronómica creada para centralizar, organizar y compartir recetas de forma estructurada.

El proyecto nació con la intención de preservar recetas familiares, fotografías, apuntes y conocimientos culinarios que habitualmente quedan dispersos en diferentes soportes.

CociHub transforma ese contenido en recetas organizadas, buscables, adaptables y accesibles desde cualquier dispositivo.

La plataforma combina:

- Un recetario público.
- Una comunidad de usuarios.
- Un espacio personal de gestión de recetas.
- Un sistema de moderación.
- Un catálogo de conocimiento alimentario.
- Herramientas de importación asistidas por inteligencia artificial.

CociHub se desarrolla como una aplicación real y como proyecto de portfolio profesional, abarcando análisis, diseño, arquitectura, desarrollo full stack, seguridad, datos, inteligencia artificial, pruebas y despliegue.

---

## Estado del proyecto

CociHub dispone de un despliegue de producción y continúa evolucionando mediante ramas de desarrollo.

| Entorno | Referencia |
|---|---|
| Producción | https://cocihub.com |
| Rama de producción | `main` |
| Rama de desarrollo actual | `feat/recipe-interactions` |
| Hosting | Vercel |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Runtime recomendado | Node.js 24 |

### Estado funcional del desarrollo

| Módulo | Estado |
|---|---|
| Área pública | Implementado |
| Búsqueda y clasificación | Implementado |
| Autenticación | Implementado |
| Mi CociHub | Implementado |
| Personalización del perfil | Implementado |
| Editor comunitario | Implementado; validación integral pendiente |
| Valoraciones | Implementado; pruebas pendientes |
| Comentarios y fotografías | Implementado; pruebas pendientes |
| Administración de recetas | Implementado; revisión pendiente |
| Moderación de recetas | Implementado |
| Moderación de comentarios | Implementado |
| Gestión de categorías | Gestión básica implementada |
| Catálogo alimentario | Implementado; consolidación pendiente |
| Sugerencias alimentarias | Infraestructura SQL implementada; integración pendiente de verificar |
| Motor de alérgenos | Implementado; revisión de integridad pendiente |
| Importación mediante IA | Implementado; evolución planificada |
| SEO técnico | Base implementada |
| Auditoría estática administrativa | Realizada dentro del alcance definido |
| Auditoría funcional y de seguridad | Pendiente de completar |
| Release estable | Pendiente |

> Esta tabla describe el estado conocido de la rama de desarrollo. No implica que todas las funcionalidades estén desplegadas en producción ni que hayan superado las pruebas finales.

---

## Funcionalidades

### 🌍 Área pública

#### Inicio

- Presentación de CociHub.
- Identidad visual propia.
- Descubrimiento de recetas.
- Navegación por categorías.
- Accesos al recetario.
- Interfaz responsive.
- Navegación adaptada al estado de autenticación.

#### Recetario

- Listado de recetas publicadas.
- Búsqueda.
- Filtros.
- Ordenación.
- Contadores de resultados.
- Estados vacíos.
- Navegación hacia el detalle de cada receta.

#### Detalle de receta

Cada receta puede incluir:

- Título e imagen principal.
- Descripción e introducción.
- Tipo de receta, categorías y etiquetas.
- Dificultad.
- Tiempos de preparación y elaboración.
- Raciones base.
- Grupos de ingredientes.
- Elaboración paso a paso.
- Duración y consejos por paso.
- Consejos y sustituciones.
- Conservación, congelación y recalentado.
- Información orientativa sobre alérgenos.
- Fuente o procedencia.
- Recetas relacionadas.
- Valoraciones.
- Comentarios y fotografías de la comunidad.

#### Ajuste dinámico de raciones

Las cantidades escalables se adaptan mediante:

```text
factor = raciones seleccionadas / raciones base
```

Únicamente se recalculan cantidades numéricas marcadas como escalables.

Las expresiones no cuantificables, como «al gusto», conservan su significado original.

#### Compartir recetas

- Función nativa de compartir cuando está disponible.
- WhatsApp.
- Telegram.
- Correo electrónico.
- Copia del enlace.

#### Categorías

- Listado general.
- Agrupaciones gastronómicas.
- Páginas individuales.
- Contadores de recetas publicadas.

Las agrupaciones compartidas se encuentran actualmente definidas mediante configuración de la aplicación.

---

### 👥 Comunidad

#### Valoraciones

- Valoraciones de una a cinco estrellas.
- Una valoración por usuario y receta.
- Modificación de la valoración propia.
- Retirada de valoraciones.
- Cálculo de media y número de votos.
- Consultas agrupadas de valoraciones para varias recetas.

#### Comentarios

- Publicación de comentarios.
- Edición de comentarios propios.
- Eliminación de comentarios propios.
- Incorporación de fotografías.
- Visualización de comentarios de la comunidad.
- Moderación administrativa.

Las fotografías de comentarios utilizan almacenamiento privado y URL firmadas.

---

### 👤 Autenticación y Mi CociHub

La autenticación está integrada mediante Supabase Auth.

#### Autenticación

- Registro de usuarios.
- Confirmación de correo electrónico.
- Inicio y cierre de sesión.
- Acceso mediante Google cuando está configurado.
- Completar perfil.
- Gestión de sesiones.
- Renovación de cookies de autenticación.

#### Perfil personal

- Gestión de datos personales.
- Nombre de usuario.
- Avatar personalizado.
- Personalización de la cabecera de Mi CociHub.
- Selección de una receta propia como cabecera.
- Imágenes personalizadas de cabecera.

#### Mis recetas

- Listado de recetas propias.
- Creación de borradores.
- Edición de recetas.
- Consulta de estados.
- Envío a moderación.
- Recepción de observaciones administrativas.
- Reapertura de recetas publicadas para su edición.

---

### 📝 Editor comunitario

El editor comunitario organiza la creación y edición de recetas en nueve etapas.

| Etapa | Responsabilidad |
|---|---|
| 01. Información básica | Título, slug, descripción e introducción |
| 02. Raciones | Número de comensales |
| 03. Clasificación | Tipo, dificultad, categorías y etiquetas |
| 04. Ingredientes | Grupos, cantidades, unidades y escalabilidad |
| 05. Elaboración | Pasos, duración, consejos y orden |
| 06. Tiempos | Preparación y elaboración calculada |
| 07. Imagen | Selección, gestión y texto alternativo |
| 08. Información adicional | Consejos, conservación y procedencia |
| 09. Revisión | Resumen y envío a moderación |

El editor incorpora, según la etapa, validaciones, indicadores de progreso, gestión de cambios pendientes, confirmaciones y estados de guardado.

El recorrido integral de creación, revisión, devolución y publicación forma parte de las pruebas de estabilización pendientes.

#### Ciclo de vida comunitario

```text
Borrador
   ↓
Pendiente de revisión
   ├── Devolución con observaciones → Borrador
   └── Aprobación → Publicada
                         ↓
                 Reapertura para editar
                         ↓
                      Borrador
```

La reapertura de una receta publicada la retira temporalmente del recetario público.

Después de editarla, el autor debe volver a enviarla a revisión.

---

### 🔐 Administración

El área administrativa requiere autenticación y rol autorizado.

#### Dashboard

Acceso a los principales módulos:

- Recetas.
- Categorías.
- Catálogo alimentario.
- Comentarios y fotografías.

#### Gestión de recetas

- Creación y edición.
- Eliminación controlada.
- Publicación y despublicación.
- Archivado.
- Gestión de recetas destacadas.
- Previsualización.
- Clasificación.
- Ingredientes y grupos.
- Pasos de elaboración.
- Raciones y tiempos.
- Imagen principal.
- Información adicional.
- Evidencias de alérgenos.
- Checklist de publicación.
- Importación mediante IA.

#### Moderación de recetas

- Consulta de recetas pendientes de revisión.
- Previsualización.
- Aprobación.
- Devolución al autor con observaciones.
- Registro de metadatos de moderación.
- Notificaciones por correo electrónico.

#### Gestión de categorías

- Creación.
- Consulta.
- Eliminación.

La ampliación del ciclo de vida de categorías y la gestión dinámica de agrupaciones forman parte de la evolución administrativa.

#### Catálogo alimentario

- Gestión de alimentos canónicos.
- Alias exactos.
- Keywords seguras.
- Asociaciones deterministas de alérgenos.
- Activación y desactivación de alimentos.
- Estados de revisión alimentaria.
- Búsqueda y filtrado.

La infraestructura SQL de sugerencias permite su envío y moderación mediante creación de alimentos, asociación con alimentos existentes o rechazo.

Su integración funcional completa permanece pendiente de verificar.

#### Moderación de comentarios

- Consulta de comentarios.
- Visualización de fotografías.
- Ocultación.
- Restauración.
- Eliminación definitiva.
- Información de moderación.
- Limpieza de archivos asociados.

---

## Arquitectura

CociHub utiliza Next.js App Router y una arquitectura organizada por responsabilidades.

```text
coci_hub/
├── public/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── recipes/
│   │   │   ├── categories/
│   │   │   ├── about/
│   │   │   ├── legal-notice/
│   │   │   ├── privacy/
│   │   │   └── cookies/
│   │   ├── admin/
│   │   │   ├── recipes/
│   │   │   ├── categories/
│   │   │   ├── ingredients/
│   │   │   └── comments/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── complete-profile/
│   │   ├── login/
│   │   ├── register/
│   │   └── mi-cocihub/
│   ├── components/
│   ├── config/
│   ├── lib/
│   ├── schemas/
│   ├── services/
│   ├── types/
│   └── proxy.ts
├── supabase/
│   └── migrations/
├── next.config.ts
├── package.json
├── package-lock.json
└── README.md
```

Árbol simplificado de los principales directorios del proyecto.

### Capas de aplicación

```text
Interfaz de usuario
        ↓
Componentes React
        ↓
Server Actions / Route Handlers
        ↓
Validaciones y servicios
        ↓
Supabase Auth / PostgreSQL / Storage
        ↓
RPC, RLS y restricciones de integridad
```

### Responsabilidades

| Capa | Responsabilidad |
|---|---|
| `app` | Rutas, páginas y operaciones de servidor |
| `components` | Componentes reutilizables |
| `config` | Configuraciones compartidas |
| `lib` | Infraestructura y funciones auxiliares |
| `schemas` | Validación y normalización |
| `services` | Acceso a datos y lógica de negocio |
| `types` | Contratos TypeScript |
| `supabase/migrations` | Evolución versionada del esquema SQL |

---

## Rutas

### Públicas

```text
/
/recipes
/recipes/[slug]
/categories
/categories/[slug]
/about
/legal-notice
/privacy
/cookies
```

### Autenticación

```text
/login
/register
/register/check-email
/auth/callback
/auth/confirm
/complete-profile
```

### Área personal

```text
/mi-cocihub
/mi-cocihub/perfil
/mi-cocihub/recetas
/mi-cocihub/recetas/nueva
/mi-cocihub/recetas/[id]/editar
```

### Administración

```text
/admin
/admin/recipes
/admin/recipes/new
/admin/recipes/[id]/edit
/admin/recipes/[id]/preview
/admin/recipes/import
/admin/categories
/admin/ingredients
/admin/comments
```

### API administrativa

```text
/api/admin/recipes/import
/api/admin/recipes/import/draft
```

### SEO y sistema

```text
/robots.txt
/sitemap.xml
/opengraph-image
```

---

## Stack tecnológico

| Área | Tecnología |
|---|---|
| Framework | Next.js 16 |
| Interfaz | React 19 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Formularios | React Hook Form y estados React |
| Validación | Zod |
| Backend | Server Components, Server Actions y Route Handlers |
| Base de datos | PostgreSQL |
| Plataforma backend | Supabase |
| Autenticación | Supabase Auth |
| Seguridad | RLS, roles, RPC y restricciones SQL |
| Almacenamiento | Supabase Storage |
| Inteligencia artificial | Google Gemini |
| SDK de IA | `@google/genai` |
| Correo electrónico | Resend |
| Iconos | Lucide React |
| Versionado | Git |
| Repositorio | GitHub |
| Desarrollo remoto | GitHub Codespaces |
| Despliegue | Vercel |
| Runtime recomendado | Node.js 24 |

Las versiones exactas de las dependencias se mantienen en `package.json` y `package-lock.json`.

---

## Base de datos

La persistencia utiliza PostgreSQL mediante Supabase.

### Identidad

```text
profiles
```

### Recetas

```text
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

### Conocimiento alimentario

```text
food_items
food_aliases
food_keywords
food_allergens
```

El modelo incorpora también infraestructura para sugerencias y moderación del catálogo alimentario.

### Comunidad

```text
recipe_ratings
recipe_comments
recipe_comment_images
```

### Migraciones

Las modificaciones del esquema, funciones, restricciones, políticas y triggers se versionan en:

```text
supabase/migrations/
```

Las migraciones históricas deben conservarse.

Las correcciones del esquema se incorporarán mediante nuevas migraciones controladas.

No deben ejecutarse migraciones ni operaciones destructivas sobre producción sin comprobar previamente el entorno de destino y disponer de un procedimiento de recuperación.

---

## Seguridad

La arquitectura utiliza diferentes capas de autorización e integridad.

### Roles de aplicación

| Rol | Responsabilidad general |
|---|---|
| `user` | Usuario de la comunidad |
| `editor` | Rol reservado para evolución funcional |
| `admin` | Administración y moderación |

Los permisos concretos dependen de las políticas y funciones implementadas.

### Medidas de protección

- Autenticación mediante Supabase Auth.
- Verificación de identidad y rol.
- Protección de rutas privadas.
- Row Level Security.
- Privilegios SQL.
- Funciones RPC controladas.
- Restricciones de integridad referencial.
- Validación de propiedad de recursos.
- Separación de operaciones públicas y privadas.
- Gestión de Storage mediante políticas de acceso.
- Variables sensibles fuera del repositorio.
- Exclusión de rutas administrativas de indexación.
- Revisión humana de contenido importado mediante IA.

Los clientes habituales de Supabase utilizan la clave publicable y la identidad del usuario autenticado.

La protección de los datos depende de las políticas, permisos y funciones de la base de datos, no de ocultar la clave publicable.

La auditoría estática no sustituye las pruebas reales de autorización y seguridad.

---

## Motor de tiempos

El modelo actual utiliza dos valores principales.

```text
preparation_minutes
elaboration_minutes
```

### Preparación

Tiempo previo de preparación introducido manualmente.

### Elaboración

Tiempo calculado automáticamente mediante la duración de los pasos.

```text
Elaboración = suma de las duraciones de los pasos
```

El modelo incorpora los tiempos de:

- Cocción.
- Horneado.
- Fermentación.
- Reposo.
- Marinado.
- Enfriamiento.
- Otras etapas representadas como pasos.

PostgreSQL utiliza un trigger para actualizar el tiempo de elaboración cuando se insertan, modifican o eliminan pasos.

Si no existen pasos o alguno carece de duración, el tiempo calculado se establece como `NULL`.

El tiempo cero y la ausencia de información representan estados diferentes.

Las recetas históricas pueden requerir revisión debido a la transición desde el modelo anterior.

Los campos legacy `cooking_minutes` y `additional_minutes` fueron retirados del modelo actual.

---

## Motor alimentario y alérgenos

CociHub dispone de un motor determinista de identificación alimentaria.

Su finalidad es relacionar los nombres de ingredientes con alimentos conocidos y sus evidencias de alérgenos.

### Resolución alimentaria

```text
Nombre del ingrediente
        ↓
Normalización
        ↓
Nombre canónico o alias exacto
        ↓
Keywords, si no existe coincidencia exacta
        ↓
Estado de resolución
        ↓
Evidencias alimentarias
```

### Estados de resolución

| Estado | Significado |
|---|---|
| `matched` | Alimento identificado |
| `unknown` | Alimento desconocido |
| `ambiguous` | Varias coincidencias posibles |
| `invalid` | Entrada no válida |

### Evidencias de alérgenos

El modelo diferencia:

- Evidencias automáticas.
- Declaraciones manuales.
- Presencia efectiva del alérgeno.

La evidencia automática prevalece como presencia confirmada cuando corresponde.

Las declaraciones manuales pueden representar presencia o posible presencia.

### Principio fundamental

> Un alimento desconocido no equivale a un alimento libre de alérgenos.

La identificación de un alimento tampoco garantiza que su composición esté completamente revisada.

La información facilitada por CociHub es orientativa y no sustituye la comprobación del etiquetado, la composición real de los ingredientes ni el asesoramiento profesional.

La cobertura del análisis, la comunicación de incertidumbre y los procedimientos de revisión alimentaria forman parte del proceso actual de estabilización.

---

## Importación mediante IA

CociHub incorpora una herramienta administrativa para transformar fotografías de recetas en borradores editables.

### Flujo

```text
Fotografía
    ↓
Validación
    ↓
Proveedor multimodal
    ↓
Respuesta estructurada
    ↓
Validación mediante Zod
    ↓
Normalización
    ↓
Revisión administrativa
    ↓
Creación de borrador
    ↓
Edición y revisión humana
    ↓
Publicación
```

### Características

- Importación de JPG, PNG y WebP.
- Extracción estructurada de información culinaria.
- Identificación de ingredientes y pasos.
- Extracción de tiempos y raciones cuando están disponibles.
- Información sobre la fuente.
- Advertencias y campos inciertos.
- Edición de los resultados antes de crear el borrador.
- Asociación con clasificaciones existentes.
- Tratamiento de errores del proveedor.

### Proveedor actual

Google Gemini mediante `@google/genai`.

### Evolución prevista

Evaluar alternativas que permitan reducir la dependencia de cuotas externas, incluyendo modelos multimodales de ejecución local.

La elección del proveedor definitivo requiere pruebas de precisión, rendimiento, infraestructura y coste.

La IA no publica recetas automáticamente ni sustituye la revisión humana o el motor determinista de alérgenos.

---

## Correo y notificaciones

CociHub utiliza Resend como proveedor de correo transaccional.

Los flujos de notificación contemplan:

- Envío de recetas a revisión.
- Aprobación de recetas comunitarias.
- Devolución de recetas con observaciones.

La integración de correo se ejecuta en servidor.

El funcionamiento efectivo de los envíos depende de la configuración del proveedor, la verificación del dominio y las variables de entorno.

La fiabilidad integral de las notificaciones permanece incluida en las pruebas pendientes.

---

## Almacenamiento

CociHub utiliza Supabase Storage.

| Bucket | Acceso configurado | Tamaño máximo por archivo |
|---|---|---|
| `recipe-images` | Público | 5 MiB |
| `profile-avatars` | Público | 5 MiB |
| `recipe-comment-images` | Privado | 5 MiB |
| `profile-hero-images` | Privado | 1 MiB |

Los tres primeros admiten JPEG, PNG y WebP.

Las imágenes personalizadas de cabecera utilizan WebP.

Los recursos privados se gestionan mediante políticas de acceso y URL firmadas cuando corresponde.

La integridad entre PostgreSQL y Storage, los permisos efectivos y los procedimientos de limpieza forman parte de la estabilización técnica.

---

## SEO y rendimiento

### SEO

La base SEO incluye:

- Metadata global.
- Metadata dinámica de recetas.
- Canonical.
- Open Graph.
- Twitter metadata.
- Imagen Open Graph.
- Sitemap.
- Robots.
- Datos estructurados JSON-LD de recetas.
- Exclusión de rutas privadas y administrativas de indexación cuando corresponde.

### Rendimiento

- Server Components.
- Consultas agrupadas cuando corresponde.
- Optimización de imágenes públicas.
- Imágenes responsive.
- Carga diferida.
- Priorización de imágenes principales cuando procede.

La paginación, las estrategias de caché, las consultas de catálogo y el rendimiento con volúmenes elevados de datos serán revisados durante la estabilización.

---

## Identidad visual

### Eslogan oficial

> Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.

### Paleta de colores

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

### Tipografías

```text
Lora  → Títulos y contenido editorial
Inter → Interfaz, navegación y formularios
```

### Principios de diseño

- Mobile first.
- Identidad gastronómica.
- Fotografía protagonista.
- Claridad visual.
- Accesibilidad.
- Navegación intuitiva.
- Consistencia entre componentes.
- Terracota como color principal de acción.

---

## Variables de entorno

Crear un fichero `.env.local` con la configuración necesaria.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000

GEMINI_API_KEY=
GEMINI_RECIPE_IMPORT_MODEL=

RESEND_API_KEY=
COCIHUB_EMAIL_FROM=
COCIHUB_ADMIN_EMAIL=
```

### Clasificación

| Variable | Finalidad |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable |
| `NEXT_PUBLIC_SITE_URL` | URL de la aplicación |
| `GEMINI_API_KEY` | Credencial privada del proveedor de IA |
| `GEMINI_RECIPE_IMPORT_MODEL` | Modelo de importación |
| `RESEND_API_KEY` | Credencial privada de correo |
| `COCIHUB_EMAIL_FROM` | Remitente configurado |
| `COCIHUB_ADMIN_EMAIL` | Destinatario administrativo |

Ejemplo de remitente:

```env
COCIHUB_EMAIL_FROM="CociHub <correo@dominio-verificado>"
```

En producción:

```env
NEXT_PUBLIC_SITE_URL=https://cocihub.com
```

Las variables privadas no deben incluir el prefijo `NEXT_PUBLIC_`.

Nunca deben incorporarse al repositorio valores reales de claves privadas, tokens o credenciales.

---

## Instalación local

### Requisitos

- Git.
- Node.js 24 recomendado.
- npm.
- Proyecto Supabase configurado.
- Variables de entorno.
- Proveedores externos configurados cuando se utilicen.

### Clonar repositorio

```bash
git clone https://github.com/Eracres/coci_hub.git
cd coci_hub
```

### Configurar Node.js mediante NVM

```bash
nvm install
nvm use
```

### Instalar dependencias

```bash
npm ci
```

### Configurar entorno

Crear `.env.local` con las variables correspondientes al entorno de desarrollo.

El proyecto Supabase utilizado debe disponer de un esquema compatible con las migraciones requeridas por la rama.

### Iniciar aplicación

```bash
npm run dev
```

Acceso local:

```text
http://localhost:3000
```

---

## GitHub Codespaces

CociHub puede desarrollarse mediante GitHub Codespaces.

Este entorno permite trabajar desde diferentes equipos utilizando:

- Terminal Linux.
- Visual Studio Code.
- Git.
- Node.js.
- Puertos reenviados.
- Entorno de desarrollo remoto.

### Inicio

```bash
npm ci
npm run dev
```

Abrir la aplicación mediante el puerto reenviado `3000`.

La URL del entorno remoto debe estar contemplada en la configuración de desarrollo y en las redirecciones de Supabase Auth cuando sea necesario.

Los puertos y las credenciales deben mantenerse protegidos.

Antes de realizar pruebas que modifiquen datos, debe verificarse que el proyecto Supabase conectado corresponde al entorno de pruebas previsto.

---

## Comprobaciones

### Estado del repositorio

```bash
git status
git diff --stat
git diff --check
```

### Validación técnica

```bash
npx tsc --noEmit
npm run lint
npm run build
```

### Ejecución de producción local

```bash
npm run build
npm run start
```

### Protección de variables de entorno

```bash
git check-ignore .env.local
```

### Comprobaciones SEO

Con la aplicación iniciada:

```bash
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
```

### Pruebas funcionales

El plan de pruebas incluye:

- Navegación pública.
- Registro y autenticación.
- Gestión del perfil.
- Creación y edición de recetas.
- Moderación y publicación.
- Notificaciones.
- Clasificación alimentaria.
- Resolución de alérgenos.
- Comentarios y fotografías.
- Valoraciones.
- Autorización y propiedad.
- Almacenamiento y limpieza.
- Importación mediante IA.
- Responsive y accesibilidad.

Las comprobaciones de compilación no sustituyen las pruebas funcionales, de integración y de seguridad.

---

## Despliegue

CociHub utiliza Vercel como plataforma de despliegue.

```text
Usuario
   ↓
cocihub.com
   ↓
Vercel / Next.js
   ├── Supabase PostgreSQL
   ├── Supabase Auth
   ├── Supabase Storage
   ├── Google Gemini
   └── Resend
```

### Flujo de despliegue

```text
Rama de desarrollo
        ↓
Cambios y validaciones
        ↓
Commit
        ↓
Push
        ↓
Pull Request
        ↓
Vercel Preview
        ↓
Pruebas funcionales
        ↓
Integración autorizada en main
        ↓
Producción
```

Antes de integrar una rama deben comprobarse:

- Compatibilidad del esquema de base de datos.
- Migraciones necesarias.
- Variables de entorno.
- URLs de autenticación.
- Compilación.
- Funcionamiento de las rutas afectadas.
- Pruebas de regresión.
- Procedimiento de recuperación.

Una Preview de Vercel no garantiza por sí sola el aislamiento de la base de datos respecto a producción.

---

## Auditoría y calidad

CociHub ha realizado una auditoría estática del alcance administrativo y de los principales mecanismos de seguridad relacionados.

### Áreas analizadas

- Arquitectura administrativa.
- Gestión de recetas.
- Editor administrativo.
- Moderación y publicación.
- Importación mediante IA.
- Categorías.
- Catálogo alimentario.
- Motor determinista de alérgenos.
- Comentarios.
- Fotografías.
- Valoraciones.
- Autenticación.
- Perfiles.
- Funciones RPC.
- Políticas RLS.
- Storage.
- Integridad de datos.

Los resultados se utilizarán para establecer una hoja de ruta de estabilización.

### Líneas de actuación

1. Seguridad y autorización.
2. Integridad alimentaria.
3. Integridad transaccional y concurrencia.
4. Almacenamiento y gestión de imágenes.
5. Evolución de la importación mediante IA.
6. Rendimiento y escalabilidad.
7. Validación y tratamiento de errores.
8. Consistencia visual y experiencia de usuario.

La revisión de permisos efectivos, las pruebas de diagnóstico y la validación integral permanecen pendientes.

Los detalles sensibles de seguridad se gestionarán mediante documentación interna.

---

## Roadmap

### Fase 1 — Definición del producto

- [x] Problema y objetivos.
- [x] Alcance funcional inicial.
- [x] Arquitectura de datos.
- [x] Identidad visual.

### Fase 2 — Arquitectura técnica

- [x] Next.js App Router.
- [x] TypeScript y Tailwind CSS.
- [x] Supabase PostgreSQL.
- [x] Supabase Auth.
- [x] Supabase Storage.
- [x] Migraciones versionadas.

### Fase 3 — Área pública

- [x] Inicio.
- [x] Recetario.
- [x] Categorías.
- [x] Detalle de recetas.
- [x] Ajuste de raciones.
- [x] Compartir recetas.
- [x] SEO técnico base.
- [x] Páginas informativas y legales base.

### Fase 4 — Comunidad

- [x] Registro y autenticación.
- [x] Mi CociHub.
- [x] Gestión de perfiles.
- [x] Avatares y cabeceras.
- [x] Comentarios.
- [x] Fotografías.
- [x] Valoraciones.

### Fase 5 — Editor comunitario

- [x] Información básica.
- [x] Raciones.
- [x] Clasificación.
- [x] Ingredientes.
- [x] Elaboración.
- [x] Tiempos.
- [x] Imagen.
- [x] Información adicional.
- [x] Revisión y envío.
- [ ] Validación integral de las nueve etapas.

### Fase 6 — Administración

- [x] Gestión básica de recetas.
- [x] Gestión básica de categorías.
- [x] Moderación de recetas.
- [x] Catálogo alimentario.
- [x] Moderación de comentarios.
- [x] Importación mediante IA.
- [ ] Consolidación funcional.
- [ ] Rediseño administrativo.
- [ ] Gestión ampliada de categorías.

### Fase 7 — Conocimiento alimentario

- [x] Alimentos canónicos.
- [x] Alias.
- [x] Keywords.
- [x] Resolver determinista.
- [x] Evidencias automáticas y manuales.
- [x] Infraestructura SQL de sugerencias.
- [ ] Integración funcional de sugerencias.
- [ ] Revisión de incertidumbre alimentaria.
- [ ] Pruebas del motor de alérgenos.

### Fase 8 — Auditoría y estabilización

- [x] Auditoría estática del alcance administrativo.
- [ ] Verificación de permisos efectivos.
- [ ] Preparación del entorno de pruebas.
- [ ] Pruebas de diagnóstico.
- [ ] Consolidación de actuaciones correctivas.
- [ ] Correcciones de seguridad e integridad.
- [ ] Revisión de Storage.
- [ ] Revisión de rendimiento.
- [ ] Pruebas de integración y regresión.
- [ ] Revisión de dependencias.

### Fase 9 — Evolución de inteligencia artificial

- [ ] Evaluar alternativas a Gemini.
- [ ] Evaluar modelos multimodales locales.
- [ ] Reducir dependencia de cuotas externas.
- [ ] Validar precisión de extracción.
- [ ] Consolidar la persistencia de borradores.
- [ ] Ejecutar pruebas de importación.

### Fase 10 — Consolidación visual y producto

- [ ] Rediseño de Administración.
- [ ] Integración definitiva del branding.
- [ ] Revisión de consistencia visual.
- [ ] Revisión responsive.
- [ ] Accesibilidad.
- [ ] Revisión de estados de error y carga.
- [ ] Validación de experiencia de usuario.

### Fase 11 — Documentación y release

- [ ] Informe detallado de auditoría.
- [ ] Manual técnico de CociHub.
- [ ] Manual Git y GitHub.
- [ ] Memoria del proyecto.
- [ ] Manual de administración.
- [ ] Manual de despliegue y mantenimiento.
- [ ] Revisión legal definitiva.
- [ ] Release estable etiquetada.

### Fase 12 — Evolución futura

- [ ] Favoritos y colecciones.
- [ ] Lista de la compra.
- [ ] Planificación de menús.
- [ ] Modo cocina.
- [ ] Temporizadores.
- [ ] Perfiles públicos.
- [ ] Recetas privadas o colaborativas.
- [ ] Internacionalización.
- [ ] Modo oscuro.
- [ ] Información nutricional.
- [ ] Aplicación móvil nativa.

Las funcionalidades futuras no deben bloquear la estabilización del núcleo actual.

---

## Documentación

La documentación de CociHub se organizará en los siguientes entregables.

| Documento | Contenido |
|---|---|
| README | Presentación, instalación y estado del proyecto |
| MEGAMANUAL CociHub | Arquitectura, código, datos y funcionamiento |
| MEGAMANUAL Git y GitHub | Versionado, comandos y casos prácticos |
| Memoria del proyecto | Motivación, objetivos, metodología y resultados |
| Informe de auditoría | Hallazgos, evidencias, prioridades y seguimiento |
| Manual de administración | Operaciones y gestión del contenido |
| Manual de despliegue | Entornos, migraciones y mantenimiento |

La documentación debe evolucionar junto con el código.

---

## Versionado y flujo Git

Repositorio:

https://github.com/Eracres/coci_hub

### Metodología

```text
Análisis
   ↓
Propuesta
   ↓
Aprobación
   ↓
Implementación
   ↓
Validación
   ↓
Commit
   ↓
Push
   ↓
Pull Request
   ↓
Integración autorizada
```

### Reglas del proyecto

1. Cada modificación de código se entrega como fichero completo.
2. Cada cambio funcional debe disponer de su correspondiente commit.
3. Las propuestas de rediseño requieren aprobación previa.
4. Se valida TypeScript y build antes de integrar cambios funcionales.
5. Las funcionalidades modificadas requieren pruebas específicas.
6. No se realizan cambios de rama ni merges sin autorización.
7. Las migraciones deben versionarse.
8. No se incorporan secretos al repositorio.
9. Los ficheros temporales de auditoría no deben incluirse accidentalmente en los commits.
10. La documentación debe mantenerse actualizada.

### Convención de commits

```text
feat: nueva funcionalidad
fix: corrección
refactor: reorganización interna
style: cambios de presentación
docs: documentación
test: pruebas
chore: mantenimiento
```

Ejemplos:

```text
feat(recipe-editor): improve recipe review
fix(storage): improve image cleanup
docs: update project README
```

### Validaciones previas a un commit funcional

```bash
git diff --check
npx tsc --noEmit
npm run build
```

Además, deben realizarse las pruebas correspondientes a la funcionalidad modificada.

---

## Consideraciones legales

CociHub incorpora páginas informativas relativas a:

- Aviso legal.
- Política de privacidad.
- Política de cookies.

Antes de publicar una release estable deben revisarse los textos legales y su correspondencia con los tratamientos y proveedores utilizados.

Especialmente:

- Autenticación.
- Datos de perfil.
- Contenido generado por usuarios.
- Fotografías.
- Proveedores de alojamiento.
- Proveedores de inteligencia artificial.
- Correo electrónico.
- Cookies.
- Logs técnicos.
- Información alimentaria y alérgenos.

La información alimentaria es orientativa y no constituye una garantía de ausencia de alérgenos.

---

## Autor

**Sergio Cáceres**

Desarrollador web.

CociHub se desarrolla como una aplicación real y como proyecto de portfolio profesional.

El proyecto abarca:

- Análisis funcional.
- UX/UI.
- Arquitectura de software.
- Desarrollo frontend y backend.
- PostgreSQL.
- Autenticación y autorización.
- Seguridad.
- Inteligencia artificial.
- Correo transaccional.
- SEO.
- Rendimiento.
- Control de versiones.
- Pruebas.
- Despliegue.
- Documentación y mantenimiento.

---

## Licencia

La licencia definitiva se establecerá antes o durante la publicación de la primera versión estable.

La disponibilidad del código en el repositorio no implica por sí sola la concesión de una licencia de reutilización.

---

<div align="center">

## 🍳 CociHub

**Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.**

https://cocihub.com

Desarrollado con pasión por la cocina y la tecnología.

</div>