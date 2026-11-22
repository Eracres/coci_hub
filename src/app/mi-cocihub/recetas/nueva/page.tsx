import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Plus,
  Sparkles,
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

import {
  NewRecipeForm,
} from "./new-recipe-form";


type ProfileRow = {
  display_name:
    string | null;

  username:
    string | null;

  avatar_url:
    string | null;
};


function normalizeExternalUrl(
  value:
    unknown,
) {
  if (
    typeof value !==
      "string" ||
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
    Record<
      string,
      unknown
    >,
) {
  const metadata =
    claims.user_metadata;


  if (
    !metadata ||
    typeof metadata !==
      "object"
  ) {
    return null;
  }


  const values =
    metadata as
      Record<
        string,
        unknown
      >;


  return (
    normalizeExternalUrl(
      values.avatar_url,
    ) ??
    normalizeExternalUrl(
      values.picture,
    )
  );
}


export default async function NewRecipePage() {
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
    !userId ||
    !claims
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
        "display_name, username, avatar_url",
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
              href="/mi-cocihub/recetas"
              className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-page-muted sm:inline-flex"
            >
              Mis recetas
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
            BACK
        =============================================== */}

        <Link
          href="/mi-cocihub/recetas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brand"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a Mis recetas
        </Link>


        {/* ===============================================
            PAGE HEADER
        =============================================== */}

        <header className="mt-6">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-brand/15 bg-surface shadow-sm">
              <Image
                src="/brand/cocihub-mark-outline.png"
                alt=""
                width={34}
                height={34}
                className="size-[34px] object-contain"
                aria-hidden="true"
              />
            </span>


            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                Mi CociHub
              </p>

              <h1 className="mt-1 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                Crear una receta
              </h1>
            </div>
          </div>


          <p className="mt-4 max-w-2xl font-serif text-base italic leading-7 text-muted-foreground">
            Empieza por darle un nombre.
            Después construiremos el resto
            de la receta paso a paso.
          </p>
        </header>


        {/* ===============================================
            CREATION OPTIONS
        =============================================== */}

        <div className="mt-7 grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)]">
          {/* =============================================
              MANUAL CREATION
          ============================================= */}

          <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="border-b border-border bg-brand/[0.035] px-6 py-6 sm:px-8">
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse shadow-sm">
                  <Plus
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                    Método disponible
                  </p>

                  <h2 className="mt-1 font-serif text-2xl font-bold">
                    Crear manualmente
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Dale un nombre a tu receta
                    y crearemos un borrador para
                    que puedas completarlo con
                    calma en el editor.
                  </p>
                </div>
              </div>
            </div>


            <div className="px-6 py-7 sm:px-8 sm:py-8">
              <NewRecipeForm />
            </div>
          </section>


          {/* =============================================
              SIDE CONTENT
          ============================================= */}

          <div className="grid gap-5">
            {/* ===========================================
                AI COMING SOON
            =========================================== */}

            <section className="relative overflow-hidden rounded-[2rem] border border-accent/35 bg-surface p-6 shadow-sm sm:p-7">
              <div
                className="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
              />


              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-warning">
                    <Sparkles
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>


                  <span className="rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-warning">
                    Próximamente
                  </span>
                </div>


                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-warning">
                  CociHub IA
                </p>


                <h2 className="mt-1 font-serif text-2xl font-bold">
                  Crear receta con IA
                </h2>


                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Estamos trabajando para que
                  puedas subir una o varias
                  fotografías y CociHub genere
                  automáticamente un primer
                  borrador con nuestro formato.
                </p>


                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/25 bg-accent/[0.045] p-4">
                  <Camera
                    className="mt-0.5 size-5 shrink-0 text-warning"
                    aria-hidden="true"
                  />

                  <p className="text-xs leading-5 text-muted-foreground">
                    La IA propondrá título,
                    ingredientes, cantidades,
                    pasos, tiempos y otros datos.
                    Tú revisarás siempre el
                    resultado antes de guardarlo.
                  </p>
                </div>
              </div>
            </section>


            {/* ===========================================
                NEXT STEPS
            =========================================== */}

            <section className="rounded-[2rem] border border-border bg-surface p-6 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-hover">
                Después
              </p>


              <h2 className="mt-1 font-serif text-2xl font-bold">
                Primero el borrador,
                después cocinamos
              </h2>


              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    1
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      Creamos el borrador
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Solo necesitamos un título
                      y una dirección para empezar.
                    </p>
                  </div>
                </div>


                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary-hover">
                    2
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      Entras al editor
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Allí completarás la receta
                      sección por sección.
                    </p>
                  </div>
                </div>


                <div className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-warning">
                    3
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      Tú decides cuándo enviarla
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Puedes salir y continuar
                      editándola más adelante.
                    </p>
                  </div>
                </div>
              </div>


              <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
                <CheckCircle2
                  className="size-4 text-secondary-hover"
                  aria-hidden="true"
                />

                Nada se publica automáticamente.
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}