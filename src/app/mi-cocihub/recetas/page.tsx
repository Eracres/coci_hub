import {
  ArrowLeft,
  Archive,
  ChefHat,
  Clock3,
  Eye,
  FilePenLine,
  Plus,
  Send,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


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


const statusConfig = {
  draft: {
    label:
      "Borrador",

    icon:
      FilePenLine,
  },

  pending_review: {
    label:
      "En revisión",

    icon:
      Clock3,
  },

  published: {
    label:
      "Publicada",

    icon:
      Send,
  },

  archived: {
    label:
      "Archivada",

    icon:
      Archive,
  },
} satisfies Record<
  RecipeStatus,
  {
    label:
      string;

    icon:
      typeof FilePenLine;
  }
>;


function isRecipeStatus(
  value:
    string | undefined,
): value is RecipeStatus {
  return (
    value === "draft" ||
    value === "pending_review" ||
    value === "published" ||
    value === "archived"
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
        "2-digit",

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


  const userId =
    claimsData
      ?.claims
      ?.sub;


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
      profile,

    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(
        "username",
      )
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    profileError ||
    !profile
  ) {
    redirect(
      "/login?error=profile-missing",
    );
  }


  if (
    !profile.username
  ) {
    redirect(
      "/complete-profile",
    );
  }


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

  let recipesQuery =
    supabase
      .from(
        "recipes",
      )
      .select(
        "id,title,slug,status,short_description,created_at,updated_at,submitted_at,published_at,review_notes",
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
    activeStatus
  ) {
    recipesQuery =
      recipesQuery.eq(
        "status",
        activeStatus,
      );
  }


  const {
    data:
      recipes,

    error:
      recipesError,
  } =
    await recipesQuery;


  if (
    recipesError
  ) {
    throw new Error(
      "No se pudieron cargar tus recetas.",
    );
  }


  const recipeList =
    recipes ??
    [];


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-6xl">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/mi-cocihub"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a Mi CociHub
          </Link>


          <Link
            href="/mi-cocihub/recetas/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
          >
            <Plus
              className="size-5"
              aria-hidden="true"
            />

            Crear receta
          </Link>

        </div>


        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Mi CociHub
            </p>


            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              Mis recetas
            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Consulta tus borradores,
              recetas pendientes de revisión,
              publicaciones y recetas archivadas.
            </p>

          </div>


          <nav className="mt-8 flex flex-wrap gap-2">

            <Link
              href="/mi-cocihub/recetas"
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeStatus ===
                null
                  ? "border-brand bg-brand text-inverse"
                  : "border-border bg-page hover:bg-page-muted"
              }`}
            >
              Todas
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
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeStatus ===
                    status
                      ? "border-brand bg-brand text-inverse"
                      : "border-border bg-page hover:bg-page-muted"
                  }`}
                >
                  {
                    config.label
                  }
                </Link>
              ),
            )}

          </nav>


          {recipeList.length ===
          0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-page-muted px-6 py-12 text-center">

              <ChefHat
                className="mx-auto size-8 text-brand"
                aria-hidden="true"
              />


              <h2 className="mt-4 font-serif text-xl font-semibold">
                No hay recetas aquí todavía
              </h2>


              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Cuando empieces a crear
                recetas aparecerán aquí
                clasificadas según su estado.
              </p>


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

            </div>
          ) : (
            <div className="mt-8 grid gap-4">

              {recipeList.map(
                (
                  recipe,
                ) => {
                  const status =
                    recipe.status as
                      RecipeStatus;


                  const config =
                    statusConfig[
                      status
                    ];


                  const StatusIcon =
                    config.icon;


                  const hasReviewNotes =
                    status ===
                      "draft" &&
                    Boolean(
                      recipe.review_notes,
                    );


                  return (
                    <article
                      key={
                        recipe.id
                      }
                      className="rounded-2xl border border-border bg-page p-5"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold">

                              <StatusIcon
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              {
                                config.label
                              }

                            </span>


                            {hasReviewNotes && (
                              <span className="rounded-full bg-page-muted px-3 py-1 text-xs font-semibold text-brand">
                                Cambios solicitados
                              </span>
                            )}

                          </div>


                          <h2 className="mt-3 font-serif text-xl font-semibold">
                            {
                              recipe.title
                            }
                          </h2>


                          {recipe.short_description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                              {
                                recipe.short_description
                              }
                            </p>
                          )}


                          <p className="mt-3 text-xs text-muted-foreground">
                            Última actualización:{" "}
                            {
                              formatDate(
                                recipe.updated_at,
                              )
                            }
                          </p>


                          {hasReviewNotes && (
                            <div className="mt-4 rounded-xl border border-border bg-surface p-4">

                              <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                                Comentario de revisión
                              </p>


                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {
                                  recipe.review_notes
                                }
                              </p>

                            </div>
                          )}

                        </div>


                        <div className="flex shrink-0 flex-wrap gap-2">

                          {status ===
                            "draft" && (
                              <Link
                                href={`/mi-cocihub/recetas/${recipe.id}/editar`}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
                              >
                                <FilePenLine
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                Editar
                              </Link>
                            )}


                          {status ===
                            "pending_review" && (
                              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-page-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">

                                <Clock3
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                En revisión

                              </span>
                            )}


                          {status ===
                            "published" && (
                              <Link
                                href={`/recipes/${recipe.slug}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
                              >
                                <Eye
                                  className="size-4"
                                  aria-hidden="true"
                                />

                                Ver publicada
                              </Link>
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