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
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/admin/recipes"
        className="text-sm underline"
      >
        ← Volver a recetas
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Nueva receta
      </h1>

      <p className="mt-2 text-sm">
        Empezaremos creando un borrador.
        Después podremos completar todos
        los datos de la receta.
      </p>

      {(hasInvalidTitle ||
        hasCreateError) && (
        <div
          role="alert"
          className="mt-6 rounded-lg border p-4"
        >
          {hasInvalidTitle
            ? "Introduce un título válido de al menos 3 caracteres."
            : "No se pudo crear la receta."}
        </div>
      )}

      <form
        action={createDraftAction}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="mb-2 block font-medium"
          >
            Título
          </label>

          <input
            id="title"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={120}
            className="w-full rounded-lg border px-4 py-3"
            placeholder="Ej. Tortilla de patatas"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Crear borrador
        </button>
      </form>
    </main>
  );
}