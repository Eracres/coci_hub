import {
  ArrowLeft,
  ChefHat,
  Plus,
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
  AvatarForm,
} from "./avatar-form";

import {
  ProfileForm,
} from "./profile-form";


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


function getGoogleAvatar(
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


export default async function MyProfilePage() {
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
    data,
    error,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(`
        display_name,
        username,
        role,
        avatar_url
      `)
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    error ||
    !data
  ) {
    throw new Error(
      "No se pudo cargar el perfil.",
    );
  }


  const profile =
    data as
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

  const googleAvatarUrl =
    getGoogleAvatar(
      claims,
    );


  const storedAvatar =
    profile
      .avatar_url
      ?.trim() ||
    null;


  let customAvatarUrl:
    string | null =
      null;


  if (
    storedAvatar
  ) {
    const externalUrl =
      normalizeExternalUrl(
        storedAvatar,
      );


    if (
      externalUrl
    ) {
      customAvatarUrl =
        externalUrl;

    } else {
      customAvatarUrl =
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


  const displayedAvatarUrl =
    customAvatarUrl ??
    googleAvatarUrl;


  // =======================================================
  // DISPLAY DATA
  // =======================================================

  const displayName =
    profile
      .display_name
      ?.trim() ||
    profile
      .username
      ?.trim() ||
    "Usuario";


  const email =
    typeof claims.email ===
      "string"
      ? claims.email
      : null;


  const roleLabel =
    profile.role ===
    "admin"
      ? "Administrador"
      : "Cocinero de la comunidad";


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
              href="/mi-cocihub"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm transition hover:bg-page-muted"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-page-muted">
                {displayedAvatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={
                      displayedAvatarUrl
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
            BACK LINK
        =============================================== */}

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


        {/* ===============================================
            PAGE TITLE
        =============================================== */}

        <header className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <UserRound
                className="size-6"
                aria-hidden="true"
              />
            </span>


            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Mi perfil
            </h1>
          </div>


          <div className="hidden h-10 w-px bg-brand/35 lg:block" />


          <p className="max-w-xl font-serif text-base italic leading-7 text-muted-foreground">
            Personaliza tu identidad
            dentro de CociHub y gestiona
            los datos públicos de tu cuenta.
          </p>
        </header>


        {/* ===============================================
            IDENTITY PREVIEW
        =============================================== */}

        <section className="relative mt-7 overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -right-20 -top-24 size-64 rounded-full bg-accent/[0.08] blur-3xl" />

            <div className="absolute bottom-[-100px] left-[35%] size-56 rounded-full bg-secondary/[0.08] blur-3xl" />

            <ChefHat className="absolute right-12 top-1/2 hidden size-44 -translate-y-1/2 text-brand/[0.025] lg:block" />
          </div>


          <div className="relative flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-8 md:flex-row md:text-left lg:px-10 lg:py-9">
            <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-page-muted shadow-md sm:size-36">
              {displayedAvatarUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    displayedAvatarUrl
                  }
                  alt={`Avatar de ${displayName}`}
                  className="size-full object-cover"
                />
              ) : (
                <UserRound
                  className="size-14 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>


            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                Tu identidad en CociHub
              </p>


              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Hola, {
                  displayName
                }
              </h2>


              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <span className="text-base font-semibold text-muted-foreground">
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

                  {
                    roleLabel
                  }
                </span>
              </div>


              <p className="mt-4 max-w-xl font-serif text-base italic leading-7 text-muted-foreground">
                Así te verá la comunidad
                dentro de CociHub.
              </p>
            </div>


            <div className="hidden shrink-0 rounded-2xl border border-border bg-page/70 px-5 py-4 text-right backdrop-blur-sm xl:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Perfil público
              </p>

              <p className="mt-1 text-sm font-semibold">
                Tu identidad está lista
              </p>

              <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
                Edita tu fotografía,
                nombre o usuario desde
                los apartados inferiores.
              </p>
            </div>
          </div>
        </section>


        {/* ===============================================
            PROFILE EDITING
        =============================================== */}

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-6">
            <h2 className="font-serif text-3xl font-bold">
              Tu perfil
            </h2>

            <p className="pb-1 text-sm text-muted-foreground">
              Gestiona tu fotografía
              y tus datos públicos.
            </p>
          </div>


          <div className="mt-4 grid items-start gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <AvatarForm
              displayName={
                displayName
              }
              initialAvatarUrl={
                displayedAvatarUrl
              }
              fallbackAvatarUrl={
                googleAvatarUrl
              }
              initialHasCustomAvatar={
                Boolean(
                  storedAvatar,
                )
              }
            />


            <ProfileForm
              initialDisplayName={
                profile
                  .display_name ??
                ""
              }
              initialUsername={
                profile
                  .username ??
                ""
              }
              email={
                email
              }
            />
          </div>
        </section>


        {/* ===============================================
            NEXT PERSONALIZATION BLOCK
        =============================================== */}

        <section className="mt-8 border-t border-border pt-7">
          <div className="rounded-[2rem] border border-dashed border-brand/25 bg-brand/[0.025] px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                  Personaliza tu espacio
                </p>


                <h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
                  Imagen de Mi CociHub
                </h2>


                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  En el siguiente paso
                  podrás elegir la imagen
                  que aparecerá en la
                  cabecera de tu espacio
                  personal: una pieza de
                  la colección CociHub al
                  óleo, una fotografía de
                  tus recetas o una imagen
                  propia.
                </p>
              </div>


              <div
                className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm"
                aria-hidden="true"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ChefHat className="size-5" />
                </span>


                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Siguiente paso
                  </p>

                  <p className="mt-0.5 font-serif font-bold">
                    Tu hero personal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}