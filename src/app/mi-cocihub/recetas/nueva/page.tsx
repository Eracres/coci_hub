import {
  ArrowLeft,
  ChefHat,
} from "lucide-react";

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


export default async function NewRecipePage() {
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


  if (
    claimsError ||
    !claimsData
      ?.claims
      ?.sub
  ) {
    redirect(
      "/login?error=session-required",
    );
  }


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-2xl">

        <Link
          href="/mi-cocihub/recetas"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a Mis recetas
        </Link>


        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-inverse">
              <ChefHat
                className="size-6"
                aria-hidden="true"
              />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              Mi CociHub
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              Crear una receta
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Dale un nombre para crear
              el borrador. Después podrás
              completar la receta paso a paso.
            </p>

          </div>


          <div className="px-6 py-8 sm:px-8">

            <NewRecipeForm />

          </div>

        </section>

      </div>
    </main>
  );
}