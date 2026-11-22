import {
  Archive,
  ArrowRight,
  CalendarDays,
  ChefHat,
  Clock3,
  Eye,
  FilePenLine,
  Home,
  LogOut,
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
  getProfileHeroPreset,
} from "@/config/profile-hero-presets";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  logout,
} from "./actions";


const RECIPE_IMAGES_BUCKET =
  "recipe-images";


const PROFILE_HERO_IMAGES_BUCKET =
  "profile-hero-images";


type RecipeStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived";


type DashboardHeroType =
  | "preset"
  | "recipe"
  | "custom"
  | null;


type ProfileRow = {
  display_name:
    string | null;

  username:
    string | null;

  role:
    string | null;

  avatar_url:
    string | null;

  dashboard_hero_type:
    DashboardHeroType;

  dashboard_hero_value:
    string | null;
};


type DashboardRecipe = {
  id:
    string;

  title:
    string;

  slug:
    string;

  status:
    RecipeStatus;

  image_path:
    string | null;

  image_alt:
    string | null;

  updated_at:
    string | null;

  submitted_at:
    string | null;

  published_at:
    string | null;
};


const recipeStatusConfig = {
  draft: {
    label:
      "Borrador",

    icon:
      FilePenLine,

    badgeClassName:
      "border-brand/15 bg-brand/10 text-brand",

    iconClassName:
      "text-brand",
  },

  pending_review: {
    label:
      "En revisión",

    icon:
      Clock3,

    badgeClassName:
      "border-accent/30 bg-accent/15 text-warning",

    iconClassName:
      "text-warning",
  },

  published: {
    label:
      "Publicada",

    icon:
      Send,

    badgeClassName:
      "border-secondary/25 bg-secondary/15 text-secondary-hover",

    iconClassName:
      "text-secondary-hover",
  },

  archived: {
    label:
      "Archivada",

    icon:
      Archive,

    badgeClassName:
      "border-border bg-page-muted text-muted-foreground",

    iconClassName:
      "text-muted-foreground",
  },
} satisfies Record<
  RecipeStatus,
  {
    label:
      string;

    icon:
      typeof FilePenLine;

    badgeClassName:
      string;

    iconClassName:
      string;
  }
>;


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
    DashboardRecipe,
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


function getRecipeHref(
  recipe:
    DashboardRecipe,
) {
  if (
    recipe.status ===
    "published"
  ) {
    return `/recipes/${recipe.slug}`;
  }


  if (
    recipe.status ===
    "draft"
  ) {
    return `/mi-cocihub/recetas/${recipe.id}/editar`;
  }


  return `/mi-cocihub/recetas?status=${recipe.status}`;
}


function getRecipeActionLabel(
  status:
    RecipeStatus,
) {
  switch (
    status
  ) {
    case "draft":
      return "Continuar editando";

    case "published":
      return "Ver receta";

    case "pending_review":
      return "Ver estado";

    case "archived":
      return "Ver archivadas";
  }
}


export default async function MiCociHubPage() {
  const supabase =
    await createClient();


  // =======================================================
  // AUTHENTICATED USER
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
      .select(`
        display_name,
        username,
        role,
        avatar_url,
        dashboard_hero_type,
        dashboard_hero_value
      `)
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


  // =======================================================
  // OWN RECIPES
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
        "id,title,slug,status,image_path,image_alt,updated_at,submitted_at,published_at",
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
    ) as DashboardRecipe[];


  const draftCount =
    recipeList.filter(
      (
        recipe,
      ) =>
        recipe.status ===
        "draft",
    ).length;


  const pendingCount =
    recipeList.filter(
      (
        recipe,
      ) =>
        recipe.status ===
        "pending_review",
    ).length;


  const publishedCount =
    recipeList.filter(
      (
        recipe,
      ) =>
        recipe.status ===
        "published",
    ).length;


  const archivedCount =
    recipeList.filter(
      (
        recipe,
      ) =>
        recipe.status ===
        "archived",
    ).length;


  const displayName =
    profile
      .display_name
      ?.trim() ||
    profile.username;


  const totalRecipes =
    recipeList.length;


  // =======================================================
  // RECIPE IMAGES
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


  const recentRecipes =
    recipeList
      .slice(
        0,
        3,
      )
      .map(
        (
          recipe,
        ) => ({
          ...recipe,

          imageUrl:
            getRecipeImageUrl(
              recipe.image_path,
            ),
        }),
      );


  // =======================================================
  // DASHBOARD HERO
  // =======================================================
  //
  // Fallback behaviour:
  //
  //   null / null
  //      -> first recipe with an image
  //
  // Explicit behaviour:
  //
  //   preset
  //      -> CociHub preset
  //
  //   recipe
  //      -> selected own recipe
  //
  //   custom
  //      -> private signed Storage URL
  //
  // If an explicit selection becomes invalid, the dashboard
  // safely falls back to automatic mode.
  // =======================================================

  const automaticHeroRecipe =
    recipeList.find(
      (
        recipe,
      ) =>
        Boolean(
          recipe.image_path,
        ),
    );


  const automaticHeroImageUrl =
    getRecipeImageUrl(
      automaticHeroRecipe
        ?.image_path ??
        null,
    );


  let heroImageUrl:
    string | null =
      automaticHeroImageUrl;


  let heroPresetBackground:
    string | null =
      null;


  if (
    profile
      .dashboard_hero_type ===
      "preset"
  ) {
    const preset =
      getProfileHeroPreset(
        profile
          .dashboard_hero_value,
      );


    if (
      preset
    ) {
      heroPresetBackground =
        preset
          .placeholderBackground;


      heroImageUrl =
        null;
    }
  }


  if (
    profile
      .dashboard_hero_type ===
      "recipe" &&
    profile
      .dashboard_hero_value
  ) {
    const selectedRecipe =
      recipeList.find(
        (
          recipe,
        ) =>
          recipe.id ===
            profile
              .dashboard_hero_value &&
          Boolean(
            recipe.image_path,
          ),
      );


    if (
      selectedRecipe
    ) {
      heroImageUrl =
        getRecipeImageUrl(
          selectedRecipe
            .image_path,
        );


      heroPresetBackground =
        null;
    }
  }


  if (
    profile
      .dashboard_hero_type ===
      "custom" &&
    profile
      .dashboard_hero_value
  ) {
    const customHeroPath =
      profile
        .dashboard_hero_value;


    if (
      customHeroPath.startsWith(
        `${userId}/hero-`,
      ) &&
      customHeroPath.endsWith(
        ".webp",
      )
    ) {
      const {
        data:
          signedHeroData,

        error:
          signedHeroError,
      } =
        await supabase
          .storage
          .from(
            PROFILE_HERO_IMAGES_BUCKET,
          )
          .createSignedUrl(
            customHeroPath,
            60 *
            60,
          );


      if (
        signedHeroError
      ) {
        console.error(
          "DASHBOARD HERO SIGNED URL ERROR:",
          signedHeroError,
        );

      } else {
        heroImageUrl =
          signedHeroData
            .signedUrl;


        heroPresetBackground =
          null;
      }
    }
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
            BREADCRUMB
        =============================================== */}

        <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
          <Home
            className="size-4 text-brand"
            aria-hidden="true"
          />

          <span>
            Mi CociHub
          </span>
        </div>


        {/* ===============================================
            PROFILE HERO
        =============================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
          <div className="relative grid gap-7 px-6 py-7 sm:px-8 md:grid-cols-[auto_minmax(0,1fr)] lg:px-10 lg:py-8 xl:grid-cols-[auto_minmax(0,1fr)_minmax(250px,0.72fr)_245px] xl:items-center">
            {/* AVATAR */}

            <div className="flex justify-center md:justify-start">
              <div className="flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-page-muted shadow-md sm:size-32">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={
                      avatarUrl
                    }
                    alt={`Avatar de ${displayName}`}
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound
                    className="size-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
              </div>
            </div>


            {/* PROFILE INFORMATION */}

            <div className="relative z-10 min-w-0 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                Mi CociHub
              </p>


              <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                Hola, {
                  displayName
                }
              </h1>


              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className="text-lg font-semibold text-muted-foreground">
                  @
                  {
                    profile.username
                  }
                </span>


                <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                  <ChefHat
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  {profile.role ===
                  "admin"
                    ? "Administrador"
                    : "Cocinero de la comunidad"}
                </span>
              </div>


              <p className="mx-auto mt-4 max-w-2xl font-serif text-base italic leading-7 text-muted-foreground md:mx-0">
                Este es tu espacio
                personal en CociHub.
                Aquí puedes crear,
                gestionar y seguir
                el estado de tus
                recetas.
              </p>
            </div>


            {/* DECORATIVE HERO IMAGE */}

            <div className="relative -my-8 hidden min-h-[calc(100%+4rem)] self-stretch overflow-hidden xl:block">
              {heroPresetBackground ? (
                <>
                  <div
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{
                      background:
                        heroPresetBackground,

                      WebkitMaskImage:
                        "linear-gradient(to right, transparent 0%, black 24%, black 76%, transparent 100%)",

                      maskImage:
                        "linear-gradient(to right, transparent 0%, black 24%, black 76%, transparent 100%)",
                    }}
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/5 via-transparent to-surface/5"
                    aria-hidden="true"
                  />
                </>
              ) : heroImageUrl ? (
                <>
                  <Image
                    src={
                      heroImageUrl
                    }
                    alt=""
                    fill
                    sizes="320px"
                    className="object-cover"
                    aria-hidden="true"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to right, transparent 0%, black 24%, black 76%, transparent 100%)",

                      maskImage:
                        "linear-gradient(to right, transparent 0%, black 24%, black 76%, transparent 100%)",
                    }}
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/5 via-transparent to-surface/5"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div
                  className="absolute inset-0"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent" />

                  <ChefHat className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 text-brand/[0.06]" />
                </div>
              )}
            </div>


            {/* ACTIONS */}

            <div className="relative z-10 flex flex-col gap-3 md:col-span-2 xl:col-span-1">
              <Link
                href="/mi-cocihub/recetas/nueva"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
              >
                <Plus
                  className="size-5"
                  aria-hidden="true"
                />

                Nueva receta
              </Link>


              <Link
                href="/mi-cocihub/perfil"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-page-muted"
              >
                <UserRound
                  className="size-4"
                  aria-hidden="true"
                />

                Editar perfil
              </Link>


              <form
                action={
                  logout
                }
              >
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                >
                  <LogOut
                    className="size-4"
                    aria-hidden="true"
                  />

                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </section>


        {/* ===============================================
            RECIPE STATUS
        =============================================== */}

        <section className="mt-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <h2 className="font-serif text-3xl font-bold">
                Estado de tu recetario
              </h2>
            </div>


            <p className="pb-1 text-sm text-muted-foreground">
              Un resumen de todas
              tus recetas en CociHub.
            </p>
          </div>


          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/mi-cocihub/recetas?status=draft"
              aria-label="Ver recetas en borrador"
              className="group flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand/[0.025] px-5 py-4 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <FilePenLine
                  className="size-5"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <span className="font-serif text-3xl font-bold leading-none">
                  {
                    draftCount
                  }
                </span>

                <p className="mt-1 text-sm font-medium">
                  Borradores
                </p>
              </div>


              <ArrowRight
                className="size-5 text-brand transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>


            <Link
              href="/mi-cocihub/recetas?status=pending_review"
              aria-label="Ver recetas en revisión"
              className="group flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.055] px-5 py-4 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-warning">
                <Clock3
                  className="size-5"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <span className="font-serif text-3xl font-bold leading-none">
                  {
                    pendingCount
                  }
                </span>

                <p className="mt-1 text-sm font-medium">
                  En revisión
                </p>
              </div>


              <ArrowRight
                className="size-5 text-warning transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>


            <Link
              href="/mi-cocihub/recetas?status=published"
              aria-label="Ver recetas publicadas"
              className="group flex items-center gap-4 rounded-2xl border border-secondary/25 bg-secondary/[0.05] px-5 py-4 transition hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-hover">
                <Send
                  className="size-5"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <span className="font-serif text-3xl font-bold leading-none">
                  {
                    publishedCount
                  }
                </span>

                <p className="mt-1 text-sm font-medium">
                  Publicadas
                </p>
              </div>


              <ArrowRight
                className="size-5 text-secondary-hover transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>


            <Link
              href="/mi-cocihub/recetas?status=archived"
              aria-label="Ver recetas archivadas"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-page-muted text-muted-foreground">
                <Archive
                  className="size-5"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <span className="font-serif text-3xl font-bold leading-none">
                  {
                    archivedCount
                  }
                </span>

                <p className="mt-1 text-sm font-medium">
                  Archivadas
                </p>
              </div>


              <ArrowRight
                className="size-5 text-muted-foreground transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>


        {/* ===============================================
            RECENT RECIPES
        =============================================== */}

        <section className="mt-7 border-t border-border pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:gap-7">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ChefHat
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <h2 className="font-serif text-3xl font-bold">
                  Tus recetas más recientes
                </h2>
              </div>


              <p className="pb-1 text-sm text-muted-foreground">
                Las recetas que has
                añadido o actualizado
                más recientemente.
              </p>
            </div>


            <Link
              href="/mi-cocihub/recetas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
            >
              Ver todas mis recetas

              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />
            </Link>
          </div>


          {recentRecipes.length >
          0 ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {recentRecipes.map(
                (
                  recipe,
                ) => {
                  const config =
                    recipeStatusConfig[
                      recipe.status
                    ];


                  const StatusIcon =
                    config.icon;


                  const dateInfo =
                    getRecipeDateLabel(
                      recipe,
                    );


                  const href =
                    getRecipeHref(
                      recipe,
                    );


                  const actionLabel =
                    getRecipeActionLabel(
                      recipe.status,
                    );


                  return (
                    <article
                      key={
                        recipe.id
                      }
                      className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md"
                    >
                      <Link
                        href={
                          href
                        }
                        aria-label={`${actionLabel}: ${recipe.title}`}
                        className="grid min-h-[142px] grid-cols-[135px_minmax(0,1fr)]"
                      >
                        <div className="relative overflow-hidden bg-page-muted">
                          {recipe.imageUrl ? (
                            <Image
                              src={
                                recipe.imageUrl
                              }
                              alt={
                                recipe.image_alt ??
                                recipe.title
                              }
                              fill
                              sizes="135px"
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ChefHat
                                className="size-7 text-muted-foreground"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>


                        <div className="flex min-w-0 flex-col justify-between p-4">
                          <div>
                            <h3 className="line-clamp-2 font-serif text-lg font-bold leading-tight transition group-hover:text-brand">
                              {
                                recipe.title
                              }
                            </h3>


                            <span
                              className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.badgeClassName}`}
                            >
                              <StatusIcon
                                className={`size-3.5 ${config.iconClassName}`}
                                aria-hidden="true"
                              />

                              {
                                config.label
                              }
                            </span>
                          </div>


                          <div className="mt-3 flex items-end justify-between gap-3">
                            <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                              <CalendarDays
                                className="size-3.5 shrink-0"
                                aria-hidden="true"
                              />

                              <span className="truncate">
                                {
                                  dateInfo.label
                                }{" "}
                                {formatDate(
                                  dateInfo.date,
                                )}
                              </span>
                            </span>


                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-page text-brand transition group-hover:border-brand/30 group-hover:bg-brand/5">
                              {recipe.status ===
                              "published" ? (
                                <Eye
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              ) : recipe.status ===
                                "draft" ? (
                                <FilePenLine
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ArrowRight
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-8 text-center">
              <ChefHat
                className="mx-auto size-7 text-brand"
                aria-hidden="true"
              />

              <p className="mt-3 font-serif text-lg font-bold">
                Tu recetario todavía está vacío
              </p>

              <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Empieza creando tu primera
                receta y conviértela en parte
                de la comunidad CociHub.
              </p>


              <Link
                href="/mi-cocihub/recetas/nueva"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
              >
                <Plus
                  className="size-4"
                  aria-hidden="true"
                />

                Crear mi primera receta
              </Link>
            </div>
          )}
        </section>


        {/* ===============================================
            QUICK ACCESS
        =============================================== */}

        <section className="mt-7 border-t border-border pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
            <h2 className="font-serif text-3xl font-bold">
              Accesos rápidos
            </h2>

            <p className="pb-1 text-sm text-muted-foreground">
              Las acciones más habituales,
              a un solo clic.
            </p>
          </div>


          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Link
              href="/mi-cocihub/recetas/nueva"
              className="group flex items-center gap-4 rounded-2xl border border-brand/20 bg-brand/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Plus
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold">
                  Crear nueva receta
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Comparte tus platos
                  con la comunidad.
                </p>
              </div>


              <ArrowRight
                className="size-5 text-brand transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>


            <Link
              href="/mi-cocihub/recetas"
              className="group flex items-center gap-4 rounded-2xl border border-secondary/25 bg-secondary/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-hover">
                <Archive
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold">
                  Ver mis recetas
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Gestiona todas tus
                  recetas y su estado.
                </p>
              </div>


              <ArrowRight
                className="size-5 text-secondary-hover transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>


            <Link
              href="/mi-cocihub/perfil"
              className="group flex items-center gap-4 rounded-2xl border border-accent/30 bg-accent/[0.05] p-5 transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-sm"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-warning">
                <UserRound
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg font-bold">
                  Editar mi perfil
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Actualiza tus datos
                  e imagen personal.
                </p>
              </div>


              <ArrowRight
                className="size-5 text-warning transition group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>


        {totalRecipes >
        0 ? (
          <p className="sr-only">
            Tienes {
              totalRecipes
            }{" "}
            {totalRecipes ===
            1
              ? "receta"
              : "recetas"}{" "}
            en CociHub.
          </p>
        ) : null}
      </div>
    </main>
  );
}