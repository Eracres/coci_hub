import {
  Archive,
  ChefHat,
  Clock3,
  FilePenLine,
  LogOut,
  Send,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  logout,
} from "./actions";


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
        "display_name, username, role, avatar_url",
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
        "id, status",
      )
      .eq(
        "author_id",
        userId,
      );


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
    profile.display_name ??
    profile.username;


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-6xl">

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-2 font-serif text-xl font-semibold"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-inverse">
              <ChefHat
                className="size-5"
                aria-hidden="true"
              />
            </span>

            CociHub
          </Link>


          <form
            action={
              logout
            }
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium transition hover:bg-page-muted"
            >
              <LogOut
                className="size-4"
                aria-hidden="true"
              />

              Cerrar sesión
            </button>
          </form>

        </div>


        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface">

                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      profile.avatar_url
                    }
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                )}

              </div>


              <div className="flex-1">

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                  Mi CociHub
                </p>


                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Hola, {displayName}
                </h1>


                <p className="mt-2 text-sm text-muted-foreground">
                  @{profile.username}
                </p>


                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Este es tu espacio personal.
                  Desde aquí podrás gestionar
                  tu perfil, tus recetas y el
                  estado de tus publicaciones.
                </p>

              </div>


              <div>
                <Link
                  href="/mi-cocihub/perfil"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page"
                >
                  <UserRound
                    className="size-4"
                    aria-hidden="true"
                  />

                  Editar perfil
                </Link>
              </div>

            </div>
          </div>


          <div className="px-6 py-8 sm:px-8">

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Mis recetas
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Controla el estado de todo
                  lo que estás cocinando en
                  CociHub.
                </p>
              </div>


              <Link
                href="/mi-cocihub/recetas/nueva"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
              >
                <FilePenLine
                  className="size-5"
                  aria-hidden="true"
                />

                Crear receta
              </Link>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <article className="rounded-2xl border border-border bg-page p-5">

                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-page-muted">
                    <FilePenLine
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="font-serif text-3xl font-semibold">
                    {draftCount}
                  </span>
                </div>

                <h3 className="mt-5 font-semibold">
                  Borradores
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Recetas que todavía puedes
                  seguir editando.
                </p>

              </article>


              <article className="rounded-2xl border border-border bg-page p-5">

                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-page-muted">
                    <Clock3
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="font-serif text-3xl font-semibold">
                    {pendingCount}
                  </span>
                </div>

                <h3 className="mt-5 font-semibold">
                  En revisión
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Pendientes de validación
                  por administración.
                </p>

              </article>


              <article className="rounded-2xl border border-border bg-page p-5">

                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-page-muted">
                    <Send
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="font-serif text-3xl font-semibold">
                    {publishedCount}
                  </span>
                </div>

                <h3 className="mt-5 font-semibold">
                  Publicadas
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Recetas visibles para toda
                  la comunidad.
                </p>

              </article>


              <article className="rounded-2xl border border-border bg-page p-5">

                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-page-muted">
                    <Archive
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <span className="font-serif text-3xl font-semibold">
                    {archivedCount}
                  </span>
                </div>

                <h3 className="mt-5 font-semibold">
                  Archivadas
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Recetas apartadas de la
                  publicación activa.
                </p>

              </article>

            </div>


            <div className="mt-8 rounded-2xl border border-dashed border-border bg-page-muted p-6 text-center">

              <ChefHat
                className="mx-auto size-7 text-brand"
                aria-hidden="true"
              />

              <p className="mt-3 font-semibold">
                Tus próximas recetas empiezan aquí
              </p>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Crea borradores, completa todos
                los apartados y envíalos a
                revisión cuando estén listos.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
