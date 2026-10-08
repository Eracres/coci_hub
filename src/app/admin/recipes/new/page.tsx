import {
  ArrowLeft,
  Bot,
  FilePenLine,
  ImagePlus,
  Sparkles,
} from "lucide-react";

import Link from "next/link";

import {
  createDraftAction,
} from "./actions";


type NewRecipePageProps = {
  searchParams:
    Promise<{
      error?:
        string;
    }>;
};


export default async function NewRecipePage({
  searchParams,
}: NewRecipePageProps) {
  const params =
    await searchParams;


  const hasInvalidTitle =
    params.error ===
    "invalid-title";


  const hasCreateError =
    params.error ===
    "create-failed";


  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-5xl">

        <Link
          href="/admin/recipes"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a recetas

        </Link>


        <section className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div className="flex items-start gap-4">

            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse">

              <FilePenLine
                className="size-6"
                aria-hidden="true"
              />

            </span>


            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Administración
              </p>


              <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                Nueva receta
              </h1>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Elige cómo quieres empezar.
                Puedes crear un borrador manual
                y completarlo en el editor o
                importar una receta desde una
                imagen con ayuda de la IA.
              </p>

            </div>

          </div>

        </section>


        {(hasInvalidTitle ||
          hasCreateError) && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          >

            {hasInvalidTitle
              ? "Introduce un título válido de entre 3 y 120 caracteres."
              : "No se pudo crear la receta."}

          </div>
        )}


        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* =================================================
              MANUAL
          ================================================= */}

          <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">

            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">

              <FilePenLine
                className="size-6"
                aria-hidden="true"
              />

            </span>


            <h2 className="mt-5 font-serif text-2xl font-semibold">
              Crear manualmente
            </h2>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Ponle un título a la receta.
              CociHub creará un borrador y
              te llevará directamente al
              nuevo editor administrativo.
            </p>


            <form
              action={
                createDraftAction
              }
              className="mt-6"
            >

              <label
                htmlFor="title"
                className="text-sm font-semibold"
              >
                Título de la receta
              </label>


              <input
                id="title"
                name="title"
                type="text"
                required
                minLength={
                  3
                }
                maxLength={
                  120
                }
                placeholder="Ej. Tortilla de patatas"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              />


              <button
                type="submit"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
              >

                <FilePenLine
                  className="size-4"
                  aria-hidden="true"
                />

                Crear borrador y editar

              </button>

            </form>

          </section>


          {/* =================================================
              AI IMPORT
          ================================================= */}

          <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm">

            <span className="flex size-12 items-center justify-center rounded-2xl bg-page-muted text-brand">

              <Bot
                className="size-6"
                aria-hidden="true"
              />

            </span>


            <div className="mt-5 flex items-center gap-2">

              <h2 className="font-serif text-2xl font-semibold">
                Importar con IA
              </h2>


              <span className="inline-flex items-center gap-1 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand">

                <Sparkles
                  className="size-3"
                  aria-hidden="true"
                />

                IA

              </span>

            </div>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sube una fotografía o captura
              de una receta y deja que
              CociHub prepare un borrador
              editable automáticamente.
            </p>


            <div className="mt-6 rounded-2xl border border-border bg-page-muted/40 p-4">

              <p className="text-sm font-semibold">
                Flujo de importación
              </p>


              <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">

                <li>
                  1. Sube una imagen.
                </li>

                <li>
                  2. La IA analiza el contenido.
                </li>

                <li>
                  3. Revisa los datos detectados.
                </li>

                <li>
                  4. Crea el borrador.
                </li>

              </ol>

            </div>


            <Link
              href="/admin/recipes/import"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 font-semibold transition hover:bg-page-muted"
            >

              <ImagePlus
                className="size-4 text-brand"
                aria-hidden="true"
              />

              Importar receta con IA

            </Link>


            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              La importación nunca publicará
              automáticamente una receta.
              Siempre podrás revisarla antes.
            </p>

          </section>

        </div>

      </div>

    </main>
  );
}