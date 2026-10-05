import {
  ArrowLeft,
  ChefHat,
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
  ProfileForm,
} from "./profile-form";


export default async function MiPerfilPage() {
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
  // AUTH USER
  // =======================================================

  const {
    data:
      userData,

    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();


  if (
    userError ||
    !userData.user
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
        "display_name, username, avatar_url",
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


  const email =
    userData
      .user
      .email ??
    "";


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-8 flex items-center justify-between gap-4">

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
            href="/"
            className="inline-flex items-center gap-2 font-serif font-semibold"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-inverse">
              <ChefHat
                className="size-4"
                aria-hidden="true"
              />
            </span>

            CociHub
          </Link>

        </div>


        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

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


              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                  Mi perfil
                </p>

                <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Editar perfil
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Decide cómo quieres aparecer
                  dentro de CociHub.
                  Tu nombre visible puede ser
                  diferente de tu nombre de usuario.
                </p>
              </div>

            </div>

          </div>


          <div className="px-6 py-8 sm:px-8">

            <ProfileForm
              initialDisplayName={
                profile
                  .display_name ??
                ""
              }
              initialUsername={
                profile.username
              }
              email={
                email
              }
            />


            <div className="mt-8 rounded-2xl border border-dashed border-border bg-page-muted p-5">

              <p className="text-sm font-semibold">
                Foto de perfil
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Si accediste con Google,
                utilizamos temporalmente
                la imagen asociada a tu cuenta.
                Más adelante podrás subir,
                sustituir o eliminar tu propia
                foto desde CociHub.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
