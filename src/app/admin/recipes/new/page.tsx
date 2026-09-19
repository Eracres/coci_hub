import Link from "next/link";

import {
  createDraftAction,
} from "./actions";

type NewRecipePageProps = {
  searchParams: Promise<{
    error?: string;
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
    <main className="mx-auto max-w-4xl p-8">
      <Link
        href="/admin/recipes"
        className="text-sm underline"
      >
        ← Volver a recetas
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          Nueva receta
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Elige cómo quieres comenzar.
          Puedes crear un borrador
          manualmente o importar una
          receta desde una imagen con
          ayuda de inteligencia artificial.
        </p>
      </div>

      {(hasInvalidTitle ||
        hasCreateError) && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {hasInvalidTitle
            ? "Introduce un título válido de al menos 3 caracteres."
            : "No se pudo crear la receta."}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-2xl">
            ✏️
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Crear manualmente
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Crea un borrador vacío a
            partir de un título y completa
            después todos los datos desde
            el editor de CociHub.
          </p>

          <form
            action={createDraftAction}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium"
              >
                Título de la receta
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={120}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-neutral-900"
                placeholder="Ej. Tortilla de patatas"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800"
            >
              Crear borrador manual
            </button>
          </form>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
            🤖
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Importar con IA
          </h2>

          <p className="mt-2 text-sm text-neutral-600">
            Sube una imagen de una
            receta y deja que CociHub
            extraiga automáticamente el
            título, ingredientes, pasos,
            tiempos y otros datos.
          </p>

          <div className="mt-6 rounded-lg border bg-neutral-50 p-4">
            <p className="text-sm font-medium">
              ¿Cómo funciona?
            </p>

            <ol className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                1. Sube una imagen de la
                receta.
              </li>

              <li>
                2. La IA analiza su
                contenido.
              </li>

              <li>
                3. Revisa y corrige los
                datos detectados.
              </li>

              <li>
                4. Crea un borrador en
                CociHub.
              </li>
            </ol>
          </div>

          <Link
            href="/admin/recipes/import"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3 font-medium text-black transition hover:bg-amber-400"
          >
            Importar receta con IA
          </Link>

          <p className="mt-3 text-xs text-neutral-500">
            La receta nunca se publicará
            automáticamente. Siempre
            podrás revisarla antes.
          </p>
        </section>
      </div>
    </main>
  );
}