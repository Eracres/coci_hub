import {
  ArrowLeft,
  ChefHat,
  Circle,
  CircleCheck,
  FilePenLine,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getMyRecipeForEditor,
} from "@/services/recipes/community-recipe-service";

import {
  BasicInfoForm,
} from "./basic-info-form";


type EditMyRecipePageProps = {
  params:
    Promise<{
      id:
        string;
    }>;
};


export default async function EditMyRecipePage({
  params,
}: EditMyRecipePageProps) {
  const {
    id,
  } =
    await params;


  const supabase =
    await createClient();


  /* =======================================================
     AUTHENTICATION
  ======================================================= */

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


  /* =======================================================
     RECIPE
  ======================================================= */

  const recipe =
    await getMyRecipeForEditor(
      id,
      userId,
    );


  if (
    !recipe
  ) {
    /*
     * No diferenciamos públicamente entre:
     *
     * - receta inexistente
     * - receta perteneciente a otro usuario
     *
     * Esto evita revelar información innecesaria.
     */
    notFound();
  }


  /* =======================================================
     EDIT LOCK
  ======================================================= */

  if (
    recipe.status !==
    "draft"
  ) {
    redirect(
      "/mi-cocihub/recetas",
    );
  }


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-6xl">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/mi-cocihub/recetas"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a Mis recetas
          </Link>


          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium">

            <FilePenLine
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Borrador

          </span>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse">

              <ChefHat
                className="size-6"
                aria-hidden="true"
              />

            </div>


            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Editor de recetas
              </p>

              <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                {
                  recipe.title
                }
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Completa tu receta poco a poco.
                Puedes guardar el borrador tantas
                veces como necesites antes de
                enviarlo a revisión.
              </p>
            </div>

          </div>

        </section>


        {/* =================================================
            EDITOR LAYOUT
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* ===============================================
              PROGRESS / NAVIGATION
          =============================================== */}

          <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">

            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Progreso
            </p>


            <div className="mt-5 space-y-4">

              <div className="flex items-center gap-3 text-sm font-semibold text-brand">

                <CircleCheck
                  className="size-5"
                  aria-hidden="true"
                />

                Información básica

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Raciones

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Tiempos

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Clasificación

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Ingredientes

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Elaboración

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Imagen

              </div>


              <div className="flex items-center gap-3 text-sm text-muted-foreground">

                <Circle
                  className="size-5"
                  aria-hidden="true"
                />

                Revisión final

              </div>

            </div>

          </aside>


          {/* ===============================================
              CURRENT EDITOR
          =============================================== */}

          <div>

            <BasicInfoForm
              recipeId={
                recipe.id
              }
              initialValues={{
                title:
                  recipe.title,

                slug:
                  recipe.slug,

                shortDescription:
                  recipe.short_description,

                introduction:
                  recipe.introduction,
              }}
            />


            {/* =============================================
                UPCOMING SECTIONS
            ============================================= */}

            <section className="mt-6 rounded-2xl border border-dashed border-border bg-page-muted p-6">

              <p className="text-sm font-semibold">
                Próximos bloques
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Después de validar la información
                básica añadiremos raciones,
                tiempos, clasificación,
                ingredientes, elaboración,
                imagen y el envío final a revisión.
              </p>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}
