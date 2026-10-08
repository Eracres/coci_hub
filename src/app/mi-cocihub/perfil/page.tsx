import {
  ArrowLeft,
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


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-4xl">

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


        <section className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div className="flex items-start gap-4">

            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse">

              <UserRound
                className="size-6"
                aria-hidden="true"
              />

            </div>


            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Mi CociHub
              </p>


              <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                Mi perfil
              </h1>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Personaliza cómo apareces dentro de CociHub
                y gestiona los datos públicos de tu cuenta.
              </p>

            </div>

          </div>

        </section>


        <div className="mt-6 space-y-6">

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

      </div>

    </main>
  );
}