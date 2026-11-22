import {
  Archive,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Eye,
  FilePenLine,
  Home,
  Plus,
  Send,
  UserRound,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


const RECIPE_IMAGES_BUCKET =
  "recipe-images";


type RecipeStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived";


type PageProps = {
  searchParams?:
    Promise<{
      status?:
        string;
    }>;
};


type ProfileRow = {
  display_name:
    string | null;

  username:
    string | null;

  role:
    string | null;

  avatar_url:
    string | null;
};


type MyRecipeRow = {
  id:
    string;

  title:
    string;

  slug:
    string;

  status:
    RecipeStatus;

  short_description:
    string | null;

  image_path:
    string | null;

  image_alt:
    string | null;

  created_at:
    string | null;

  updated_at:
    string | null;

  submitted_at:
    string | null;

  published_at:
    string | null;

  review_notes:
    string | null;
};


const statusConfig = {
  draft: {
    label:
      "Borrador",

    pluralLabel:
      "Borradores",

    description:
      "Recetas que todavía estás preparando.",

    icon:
      FilePenLine,

    badgeClassName:
      "border-brand/20 bg-brand/10 text-brand",

    cardClassName:
      "border-brand/20 bg-brand/[0.025]",

    iconWrapperClassName:
      "bg-brand/10 text-brand",

    arrowClassName:
      "text-brand",
  },

  pending_review: {
    label:
      "En revisión",

    pluralLabel:
      "En revisión",

    description:
      "Recetas enviadas al equipo de CociHub.",

    icon:
      Clock3,

    badgeClassName:
      "border-accent/35 bg-accent/15 text-warning",

    cardClassName:
      "border-accent/30 bg-accent/[0.045]",

    iconWrapperClassName:
      "bg-accent/15 text-warning",

    arrowClassName:
      "text-warning",
  },

  published: {
    label:
      "Publicada",

    pluralLabel:
      "Publicadas",

    description:
      "Recetas visibles para toda la comunidad.",

    icon:
      Send,

    badgeClassName:
      "border-secondary/30 bg-secondary/15 text-secondary-hover",

    cardClassName:
      "border-secondary/25 bg-secondary/[0.04]",

    iconWrapperClassName:
      "bg-secondary/15 text-secondary-hover",

    arrowClassName:
      "text-secondary-hover",
  },

  archived: {
    label:
      "Archivada",

    pluralLabel:
      "Archivadas",

    description:
      "Recetas retiradas de tu recetario activo.",

    icon:
      Archive,

    badgeClassName:
      "border-border bg-page-muted text-muted-foreground",

    cardClassName:
      "border-border bg-surface",

    iconWrapperClassName:
      "bg-page-muted text-muted-foreground",

    arrowClassName:
      "text-muted-foreground",
  },
} satisfies Record<
  RecipeStatus,
  {
    label:
      string;

    pluralLabel:
      string;

    description:
      string;

    icon:
      typeof FilePenLine;

    badgeClassName:
      string;

    cardClassName:
      string;

    iconWrapperClassName:
      string;

    arrowClassName:
      string;
  }
>;


function isRecipeStatus(
  value:
    string | undefined,
): value is RecipeStatus {
  return (
    value ===
      "draft" ||
    value ===
      "pending_review" ||
    value ===
      "published" ||
    value ===
      "archived"
  );
}


function normalizeExternalUrl(
  value:
    string | null | undefined,
) {
  if (
    !value
  ) {
    return null;
  }


  try {
    const url =
      new URL(
        value,
      );


    if (
      url.protocol !==
        "https:" &&
      url.protocol !==
        "http:"
    ) {
      return null;
    }


    return value;

  } catch {
    return null;
  }
}


function getMetadataAvatar(
  claims:
    unknown,
) {
  if (
    !claims ||
    typeof claims !==
      "object"
  ) {
    return null;
  }


  const claimsRecord =
    claims as
      Record<
        string,
        unknown
      >;


  const metadata =
    claimsRecord
      .user_metadata;


  if (
    !metadata ||
    typeof metadata !==
      "object"
  ) {
    return null;
  }


  const metadataRecord =
    metadata as
      Record<
        string,
        unknown
      >;


  const avatarUrl =
    typeof metadataRecord
      .avatar_url ===
      "string"
      ? metadataRecord
          .avatar_url
      : null;


  const picture =
    typeof metadataRecord
      .picture ===
      "string"
      ? metadataRecord
          .picture
      : null;


  return (
    normalizeExternalUrl(
      avatarUrl,
    ) ??
    normalizeExternalUrl(
      picture,
    )
  );
}


function formatDate(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return "Sin fecha";
  }


  return new Intl.DateTimeFormat(
    "es-ES",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


function getRecipeDateLabel(
  recipe:
    MyRecipeRow,
) {
  if (
    recipe.status ===
    "published"
  ) {
    return {
      label:
        "Publicada",

      date:
        recipe.published_at ??
        recipe.updated_at,
    };
  }


  if (
    recipe.status ===
    "pending_review"
  ) {
    return {
      label:
        "Enviada",

      date:
        recipe.submitted_at ??
        recipe.updated_at,
    };
  }


  return {
    label:
      "Actualizada",

    date:
      recipe.updated_at,
  };
}


export default async function MyRecipesPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;


  const requestedStatus =
    params?.status;


  const activeStatus =
    isRecipeStatus(
      requestedStatus,
    )
      ? requestedStatus
      : null;


  const supabase =
    await createClient();


  // =======================================================
  // AUTHENTICATION
  // =======================================================

  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase
      .auth
      .getClaims();


  const claims =
    claimsData
      ?.claims as
      Record<
        string,
        unknown
      > |
      undefined;


  const userId =
    typeof claims
      ?.sub ===
      "string"
      ? claims.sub
      : null;


  if (
    claimsError ||
    !userId
  ) {
    redirect(
      "/login?error=session-required",
    );
  }


  // =======================================================
  // PROFILE
  // =======================================================

  const {
    data:
      profileData,

    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(
        "display_name, username, role, avatar_url",
      )
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    profileError ||
    !profileData
  ) {
    redirect(
      "/login?error=profile-missing",
    );
  }


  const profile =
    profileData as
      ProfileRow;


  if (
    !profile.username
  ) {
    redirect(
      "/complete-profile",
    );
  }


  // =======================================================
  // AVATAR
  // =======================================================

  const storedAvatar =
    profile
      .avatar_url
      ?.trim() ||
    null;


  let profileAvatarUrl:
    string | null =
      null;


  if (
    storedAvatar
  ) {
    const externalAvatar =
      normalizeExternalUrl(
        storedAvatar,
      );


    if (
      externalAvatar
    ) {
      profileAvatarUrl =
        externalAvatar;

    } else {
      profileAvatarUrl =
        supabase
          .storage
          .from(
            "profile-avatars",
          )
          .getPublicUrl(
            storedAvatar,
          )
          .data
          .publicUrl;
    }
  }


  const avatarUrl =
    profileAvatarUrl ??
    getMetadataAvatar(
      claims,
    );


  const displayName =
    profile
      .display_name
      ?.trim() ||
    profile.username;


  // =======================================================
  // OWN RECIPES
  // =======================================================
  //
  // IMPORTANT:
  //
  // This select must remain a string literal.
  //
  // Supabase uses the literal query at compile time
  // to infer the returned TypeScript object.
  //
  // Building it dynamically with .join(",") widens
  // the expression to string and breaks that inference.
  // =======================================================

  const {
    data:
      recipes,

    error:
      recipesError,
  } =
    await supabase
      .from(
        "recipes",
      )
      .select(
        "id,title,slug,status,short_description,image_path,image_alt,created_at,updated_at,submitted_at,published_at,review_notes",
      )
      .eq(
        "author_id",
        userId,
      )
      .order(
        "updated_at",
        {
          ascending:
            false,
        },
      );


  if (
    recipesError
  ) {
    throw new Error(
      "No se pudieron cargar tus recetas.",
    );
  }


  const recipeList =
    (
      recipes ??
      []
    ) as MyRecipeRow[];


  // =======================================================
  // COUNTS + FILTER
  // =======================================================

  const recipeCounts =
    {
      draft:
        0,

      pending_review:
        0,

      published:
        0,

      archived:
        0,
    } satisfies Record<
      RecipeStatus,
      number
    >;


  for (
    const recipe
    of recipeList
  ) {
    recipeCounts[
      recipe.status
    ] +=
      1;
  }


  const visibleRecipes =
    activeStatus
      ? recipeList.filter(
          (
            recipe,
          ) =>
            recipe.status ===
            activeStatus,
        )
      : recipeList;


  // =======================================================
  // RECIPE IMAGE
  // =======================================================

  function getRecipeImageUrl(
    imagePath:
      string | null,
  ) {
    if (
      !imagePath
    ) {
      return null;
    }


    const externalImage =
      normalizeExternalUrl(
        imagePath,
      );


    if (
      externalImage
    ) {
      return externalImage;
    }


    return supabase
      .storage
      .from(
        RECIPE_IMAGES_BUCKET,
      )
      .getPublicUrl(
        imagePath,
      )
      .data
      .publicUrl;
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="min-h-screen bg-page text-foreground">
      {/* ===================================================
          PERSONAL NAVIGATION
      =================================================== */}

      <header className="border-b border-border bg-surface/95 shadow-sm">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <Image
              src="/brand/cocihub-logo.png"
              alt="CociHub"
              width={154}
              height={54}
              priority
              className="h-auto w-[142px]"
            />
          </Link>


          <nav
            className="hidden items-center rounded-2xl border border-border bg-surface px-2 py-1 shadow-sm lg:flex"
            aria-label="Navegación principal"
          >
            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Inicio
            </Link>

            <Link
              href="/recipes"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Recetas
            </Link>

            <Link
              href="/categories"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Categorías
            </Link>

            <Link
              href="/about"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Sobre CociHub
            </Link>
          </nav>


          <div className="flex items-center gap-3">
            <Link
              href="/mi-cocihub/recetas/nueva"
              className="hidden items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover sm:inline-flex"
            >
              <Plus
                className="size-4"
                aria-hidden="true"
              />

              Nueva receta
            </Link>


            <Link
              href="/mi-cocihub/perfil"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm transition hover:bg-page-muted"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-page-muted">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={
                      avatarUrl
                    }
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </span>


              <span className="hidden text-left sm:block">
                <span className="block text-[10px] leading-none text-muted-foreground">
                  Hola,
                </span>

                <span className="mt-0.5 block max-w-28 truncate text-sm font-semibold leading-none">
                  {
                    displayName
                  }
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ===============================================
            BREADCRUMB / BACK
        =============================================== */}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/mi-cocihub"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brand"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a Mi CociHub
          </Link>


          <div className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground sm:flex">
            <Home
              className="size-4 text-brand"
              aria-hidden="true"
            />

            <span>
              Mi CociHub
            </span>

            <span className="text-border-strong">
              /
            </span>

            <span className="text-foreground">
              Mis recetas
            </span>
          </div>
        </div>


        {/* ===============================================
            PAGE HEADER
        =============================================== */}

        <header className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                  Mi CociHub
                </p>

                <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                  Mis recetas
                </h1>
              </div>
            </div>


            <p className="mt-4 max-w-2xl font-serif text-base italic leading-7 text-muted-foreground">
              Gestiona todo tu recetario,
              continúa tus borradores y
              consulta el estado de las
              recetas que has enviado a
              la comunidad.
            </p>
          </div>


          <Link
            href="/mi-cocihub/recetas/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
          >
            <Plus
              className="size-5"
              aria-hidden="true"
            />

            Crear nueva receta
          </Link>
        </header>


        {/* ===============================================
            STATUS SUMMARY
        =============================================== */}

        <section className="mt-7">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {(
              Object.entries(
                statusConfig,
              ) as [
                RecipeStatus,
                (
                  typeof statusConfig
                )[RecipeStatus],
              ][]
            ).map(
              ([
                status,
                config,
              ]) => {
                const StatusIcon =
                  config.icon;


                const selected =
                  activeStatus ===
                  status;


                return (
                  <Link
                    key={
                      status
                    }
                    href={`/mi-cocihub/recetas?status=${status}`}
                    className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-sm ${
                      selected
                        ? `${config.cardClassName} ring-2 ring-brand/10`
                        : config.cardClassName
                    }`}
                  >
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${config.iconWrapperClassName}`}
                    >
                      <StatusIcon
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>


                    <div className="min-w-0 flex-1">
                      <span className="font-serif text-3xl font-bold leading-none">
                        {
                          recipeCounts[
                            status
                          ]
                        }
                      </span>

                      <p className="mt-1 text-sm font-semibold">
                        {
                          config.pluralLabel
                        }
                      </p>
                    </div>


                    <ArrowRight
                      className={`size-5 transition group-hover:translate-x-1 ${config.arrowClassName}`}
                      aria-hidden="true"
                    />
                  </Link>
                );
              },
            )}
          </div>
        </section>


        {/* ===============================================
            FILTERS
        =============================================== */}

        <section className="mt-7 border-t border-border pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">
                Tu recetario
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {
                  activeStatus
                    ? statusConfig[
                        activeStatus
                      ].description
                    : "Todas tus recetas, ordenadas por su última actualización."
                }
              </p>
            </div>


            <nav
              className="flex flex-wrap gap-2"
              aria-label="Filtrar recetas por estado"
            >
              <Link
                href="/mi-cocihub/recetas"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeStatus ===
                  null
                    ? "border-brand bg-brand text-inverse shadow-sm"
                    : "border-border bg-surface hover:border-brand/30 hover:bg-page-muted"
                }`}
              >
                Todas · {
                  recipeList.length
                }
              </Link>


              {(
                Object.entries(
                  statusConfig,
                ) as [
                  RecipeStatus,
                  (
                    typeof statusConfig
                  )[RecipeStatus],
                ][]
              ).map(
                ([
                  status,
                  config,
                ]) => (
                  <Link
                    key={
                      status
                    }
                    href={`/mi-cocihub/recetas?status=${status}`}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeStatus ===
                      status
                        ? "border-brand bg-brand text-inverse shadow-sm"
                        : "border-border bg-surface hover:border-brand/30 hover:bg-page-muted"
                    }`}
                  >
                    {
                      config.label
                    } ·{" "}
                    {
                      recipeCounts[
                        status
                      ]
                    }
                  </Link>
                ),
              )}
            </nav>
          </div>


          {/* =============================================
              EMPTY STATE
          ============================================= */}

          {visibleRecipes.length ===
          0 ? (
            <div className="mt-6 rounded-[2rem] border border-dashed border-border bg-surface px-6 py-12 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-4 font-serif text-2xl font-bold">
                {activeStatus
                  ? `No tienes recetas en “${statusConfig[activeStatus].label}”`
                  : "Tu recetario todavía está vacío"}
              </h2>


              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {activeStatus
                  ? "Cuando una receta llegue a este estado aparecerá automáticamente aquí."
                  : "Empieza creando tu primera receta y conviértela en parte de la comunidad CociHub."}
              </p>


              {!activeStatus ? (
                <Link
                  href="/mi-cocihub/recetas/nueva"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
                >
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />

                  Crear mi primera receta
                </Link>
              ) : null}
            </div>

          ) : (
            /* ===========================================
               RECIPE LIST
            =========================================== */

            <div className="mt-6 grid gap-4">
              {visibleRecipes.map(
                (
                  recipe,
                ) => {
                  const config =
                    statusConfig[
                      recipe.status
                    ];


                  const StatusIcon =
                    config.icon;


                  const imageUrl =
                    getRecipeImageUrl(
                      recipe.image_path,
                    );


                  const hasReviewNotes =
                    recipe.status ===
                      "draft" &&
                    Boolean(
                      recipe.review_notes,
                    );


                  const dateInfo =
                    getRecipeDateLabel(
                      recipe,
                    );


                  return (
                    <article
                      key={
                        recipe.id
                      }
                      className="group overflow-hidden rounded-[1.6rem] border border-border bg-surface shadow-sm transition hover:border-brand/25 hover:shadow-md"
                    >
                      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_190px]">
                        {/* IMAGE */}

                        <div className="relative min-h-48 overflow-hidden bg-page-muted lg:min-h-full">
                          {imageUrl ? (
                            <Image
                              src={
                                imageUrl
                              }
                              alt={
                                recipe.image_alt ??
                                recipe.title
                              }
                              fill
                              sizes="(max-width: 1024px) 100vw, 220px"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <ChefHat
                                  className="mx-auto size-9 text-muted-foreground/60"
                                  aria-hidden="true"
                                />

                                <p className="mt-2 text-xs text-muted-foreground">
                                  Sin imagen
                                </p>
                              </div>
                            </div>
                          )}


                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                        </div>


                        {/* CONTENT */}

                        <div className="min-w-0 p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.badgeClassName}`}
                            >
                              <StatusIcon
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              {
                                config.label
                              }
                            </span>


                            {hasReviewNotes ? (
                              <span className="rounded-full border border-brand/20 bg-brand/[0.06] px-3 py-1 text-xs font-semibold text-brand">
                                Cambios solicitados
                              </span>
                            ) : null}
                          </div>


                          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight">
                            {
                              recipe.title
                            }
                          </h2>


                          {recipe.short_description ? (
                            <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                              {
                                recipe.short_description
                              }
                            </p>
                          ) : (
                            <p className="mt-2 text-sm italic text-muted-foreground">
                              Esta receta todavía no tiene una descripción breve.
                            </p>
                          )}


                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              {
                                dateInfo.label
                              }{" "}
                              {
                                formatDate(
                                  dateInfo.date,
                                )
                              }
                            </span>
                          </div>


                          {hasReviewNotes ? (
                            <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/[0.035] p-4">
                              <div className="flex items-center gap-2">
                                <span className="flex size-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                                  <FilePenLine
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                </span>

                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                                  Comentario de revisión
                                </p>
                              </div>


                              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                {
                                  recipe.review_notes
                                }
                              </p>
                            </div>
                          ) : null}
                        </div>


                        {/* ACTION */}

                        <div className="flex items-center border-t border-border bg-page-muted/25 p-5 lg:border-l lg:border-t-0">
                          {recipe.status ===
                          "draft" ? (
                            <Link
                              href={`/mi-cocihub/recetas/${recipe.id}/editar`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
                            >
                              <FilePenLine
                                className="size-4"
                                aria-hidden="true"
                              />

                              {hasReviewNotes
                                ? "Revisar cambios"
                                : "Continuar editando"}
                            </Link>

                          ) : recipe.status ===
                            "pending_review" ? (
                            <div className="w-full text-center">
                              <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.08] px-4 py-3 text-sm font-semibold text-warning">
                                <Clock3
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                En revisión
                              </span>

                              <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                El equipo de CociHub está revisando esta receta.
                              </p>
                            </div>

                          ) : recipe.status ===
                            "published" ? (
                            <Link
                              href={`/recipes/${recipe.slug}`}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-secondary/[0.07] px-4 py-3 text-sm font-semibold text-secondary-hover transition hover:bg-secondary/10"
                            >
                              <Eye
                                className="size-4"
                                aria-hidden="true"
                              />

                              Ver publicada
                            </Link>

                          ) : (
                            <div className="w-full text-center">
                              <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-page-muted px-4 py-3 text-sm font-semibold text-muted-foreground">
                                <Archive
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                Archivada
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}