import {
  ChefHat,
} from "lucide-react";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  CompleteProfileForm,
} from "./complete-profile-form";


export default async function CompleteProfilePage() {
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


  // =======================================================
  // PROFILE ALREADY COMPLETE
  // =======================================================

  if (
    profile.username
  ) {
    redirect(
      "/",
    );
  }


  return (
    <main className="min-h-screen bg-page px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-lg">

        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand text-inverse shadow-sm">
              <ChefHat
                className="size-6"
                aria-hidden="true"
              />
            </div>


            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              CociHub
            </p>


            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Una cosa más
            </h1>


            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Tu cuenta de Google ya
              está conectada.
              Solo falta elegir cómo
              quieres identificarte
              dentro de CociHub.
            </p>
          </div>


          <div className="px-6 py-8 sm:px-8">

            <div className="mb-8 rounded-2xl border border-border bg-page-muted p-4">

              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tu perfil
              </p>


              <div className="mt-3">

                <p className="font-semibold">
                  {
                    profile
                      .display_name ??
                    "Usuario CociHub"
                  }
                </p>


                <p className="mt-1 text-sm text-muted-foreground">
                  Cuenta conectada
                  correctamente con
                  Google.
                </p>

              </div>
            </div>


            <CompleteProfileForm />

          </div>
        </section>


        <p className="mt-6 text-center font-serif text-sm italic text-muted-foreground">
          Comer es un placer,
          cocinar un privilegio,
          enseñar una responsabilidad.
        </p>

      </div>
    </main>
  );
}
