import {
  BookOpen,
  ChefHat,
  ChevronDown,
  CircleUserRound,
  LogIn,
  LogOut,
  Menu,
  NotebookTabs,
  Settings,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import {
  publicLogout,
} from "@/components/auth/public-auth-actions";

import {
  Container,
} from "@/components/layout/container";

import {
  createClient,
} from "@/lib/supabase/server";


const navigationItems = [
  {
    href:
      "/",

    label:
      "Inicio",
  },

  {
    href:
      "/recipes",

    label:
      "Recetas",
  },

  {
    href:
      "/categories",

    label:
      "Categorías",
  },

  {
    href:
      "/about",

    label:
      "Sobre CociHub",
  },
] as const;


type HeaderProfile = {
  display_name:
    string | null;

  username:
    string | null;

  avatar_url:
    string | null;

  role:
    "admin" |
    "editor" |
    "user";
};


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


function getInitials(
  value:
    string,
) {
  const parts =
    value
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );


  if (
    parts.length ===
    0
  ) {
    return "U";
  }


  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }


  return (
    (
      parts[0]?.[0] ??
      ""
    ) +
    (
      parts[
        parts.length -
        1
      ]?.[0] ??
      ""
    )
  ).toUpperCase();
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


  return (
    normalizeExternalUrl(
      typeof metadataRecord
        .avatar_url ===
        "string"
        ? metadataRecord
            .avatar_url
        : null,
    ) ??
    normalizeExternalUrl(
      typeof metadataRecord
        .picture ===
        "string"
        ? metadataRecord
            .picture
        : null,
    )
  );
}


type AvatarProps = {
  avatarUrl:
    string | null;

  name:
    string;

  size?:
    "small" |
    "medium";
};


function Avatar({
  avatarUrl,
  name,
  size =
    "medium",
}: AvatarProps) {
  const sizeClass =
    size ===
      "small"
      ? "size-8"
      : "size-9";


  if (
    avatarUrl
  ) {
    return (
      <span
        className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-border bg-page-muted`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            avatarUrl
          }
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    );
  }


  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-xs font-semibold text-brand`}
      aria-hidden="true"
    >
      {
        getInitials(
          name,
        )
      }
    </span>
  );
}


export async function PublicHeader() {
  const supabase =
    await createClient();


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


  let profile:
    HeaderProfile | null =
      null;


  if (
    !claimsError &&
    userId
  ) {
    const {
      data,
    } =
      await supabase
        .from(
          "profiles",
        )
        .select(`
          display_name,
          username,
          avatar_url,
          role
        `)
        .eq(
          "id",
          userId,
        )
        .maybeSingle();


    profile =
      data as
        HeaderProfile | null;
  }


  const authenticated =
    Boolean(
      !claimsError &&
      userId,
    );


  const displayName =
    profile
      ?.display_name
      ?.trim() ||
    profile
      ?.username
      ?.trim() ||
    "Mi cuenta";


  const username =
    profile
      ?.username
      ?.trim() ||
    null;


  const storedAvatar =
    profile
      ?.avatar_url
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


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-page/95 backdrop-blur-md">

      <Container className="flex min-h-16 items-center justify-between gap-4 py-3">

        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-3 rounded-lg"
          aria-label="Ir al inicio de CociHub"
        >

          <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-inverse shadow-sm transition group-hover:bg-brand-hover">

            <ChefHat
              className="size-5"
              aria-hidden="true"
            />

          </span>


          <span className="font-serif text-xl font-semibold tracking-tight">

            <span className="text-foreground">
              Coci
            </span>

            <span className="text-brand">
              Hub
            </span>

          </span>

        </Link>


        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">

          <nav
            className="flex items-center gap-1"
            aria-label="Navegación principal"
          >

            {navigationItems.map(
              (
                item,
              ) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                >
                  {
                    item.label
                  }
                </Link>
              ),
            )}

          </nav>


          <div className="ml-2 h-7 w-px bg-border" />


          {!authenticated ? (

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
            >

              <LogIn
                className="size-4"
                aria-hidden="true"
              />

              Iniciar sesión

            </Link>

          ) : (

            <details className="group relative">

              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pl-1.5 pr-3 transition hover:bg-page-muted [&::-webkit-details-marker]:hidden">

                <Avatar
                  avatarUrl={
                    avatarUrl
                  }
                  name={
                    displayName
                  }
                />


                <span className="max-w-36 truncate text-sm font-semibold">
                  {
                    displayName
                  }
                </span>


                <ChevronDown
                  className="size-4 text-muted-foreground transition group-open:rotate-180"
                  aria-hidden="true"
                />

              </summary>


              <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">

                <div className="flex items-center gap-3 border-b border-border p-4">

                  <Avatar
                    avatarUrl={
                      avatarUrl
                    }
                    name={
                      displayName
                    }
                  />


                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold">
                      {
                        displayName
                      }
                    </p>


                    {username && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        @
                        {
                          username
                        }
                      </p>
                    )}

                  </div>

                </div>


                <div className="p-2">

                  <Link
                    href="/mi-cocihub"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-page-muted"
                  >

                    <CircleUserRound
                      className="size-4 text-brand"
                      aria-hidden="true"
                    />

                    Mi CociHub

                  </Link>


                  <Link
                    href="/mi-cocihub/recetas"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-page-muted"
                  >

                    <NotebookTabs
                      className="size-4 text-brand"
                      aria-hidden="true"
                    />

                    Mis recetas

                  </Link>


                  <Link
                    href="/mi-cocihub/perfil"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-page-muted"
                  >

                    <UserRound
                      className="size-4 text-brand"
                      aria-hidden="true"
                    />

                    Mi perfil

                  </Link>


                  {profile
                    ?.role ===
                    "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-page-muted"
                      >

                        <Settings
                          className="size-4 text-brand"
                          aria-hidden="true"
                        />

                        Administración

                      </Link>
                    )}

                </div>


                <div className="border-t border-border p-2">

                  <form
                    action={
                      publicLogout
                    }
                  >

                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
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

            </details>
          )}

        </div>


        <details className="group relative md:hidden">

          <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-foreground shadow-xs transition hover:bg-page-muted [&::-webkit-details-marker]:hidden">

            <span className="sr-only">
              Abrir menú de navegación
            </span>


            <Menu
              className="size-5"
              aria-hidden="true"
            />

          </summary>


          <div className="absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl">

            {authenticated && (

              <div className="mb-2 flex items-center gap-3 rounded-xl bg-page-muted/40 p-3">

                <Avatar
                  avatarUrl={
                    avatarUrl
                  }
                  name={
                    displayName
                  }
                />


                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold">
                    {
                      displayName
                    }
                  </p>


                  {username && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      @
                      {
                        username
                      }
                    </p>
                  )}

                </div>

              </div>
            )}


            <nav
              className="flex flex-col"
              aria-label="Navegación móvil"
            >

              {navigationItems.map(
                (
                  item,
                ) => (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                  >
                    {
                      item.label
                  }
                </Link>
              ),
            )}

            </nav>


            <div className="my-2 border-t border-border" />


            {!authenticated ? (

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
              >

                <LogIn
                  className="size-4"
                  aria-hidden="true"
                />

                Iniciar sesión

              </Link>

            ) : (

              <div className="space-y-1">

                <Link
                  href="/mi-cocihub"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-page-muted"
                >

                  <CircleUserRound
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Mi CociHub

                </Link>


                <Link
                  href="/mi-cocihub/recetas"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-page-muted"
                >

                  <BookOpen
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Mis recetas

                </Link>


                <Link
                  href="/mi-cocihub/perfil"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-page-muted"
                >

                  <UserRound
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Mi perfil

                </Link>


                {profile
                  ?.role ===
                    "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-page-muted"
                    >

                      <Settings
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                      Administración

                    </Link>
                  )}


                <div className="my-2 border-t border-border" />


                <form
                  action={
                    publicLogout
                  }
                >

                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                  >

                    <LogOut
                      className="size-4"
                      aria-hidden="true"
                    />

                    Cerrar sesión

                  </button>

                </form>

              </div>
            )}

          </div>

        </details>

      </Container>

    </header>
  );
}