import Link from "next/link";

import {
  getAdminRecipes,
} from "@/services/recipes/recipe-service";

const statusLabels = {
  draft: "Borrador",
  published: "Publicada",
  archived: "Archivada",
};

export default async function AdminRecipesPage() {
  const recipes =
    await getAdminRecipes();

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Recetas
          </h1>

          <p className="mt-2 text-sm">
            Gestiona las recetas de CociHub.
          </p>
        </div>

        <Link
          href="/admin/recipes/new"
          className="rounded-lg bg-black px-5 py-3 text-white"
        >
          Nueva receta
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="mt-10 rounded-xl border p-8">
          <p>
            Todavía no hay recetas.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {recipes.map(
            (recipe) => (
              <article
                key={recipe.id}
                className="flex items-center justify-between gap-6 rounded-xl border p-5"
              >
                <div>
                  <h2 className="font-semibold">
                    {recipe.title}
                  </h2>

                  <p className="mt-1 text-sm">
                    /recipes/{recipe.slug}
                  </p>

                  {recipe.short_description && (
                    <p className="mt-2 max-w-2xl text-sm">
                      {
                        recipe.short_description
                      }
                    </p>
                  )}

                  <p className="mt-2 text-sm">
                    {
                      statusLabels[
                        recipe.status
                      ]
                    }
                  </p>
                </div>

                <Link
                  href={`/admin/recipes/${recipe.id}/edit`}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Editar
                </Link>
              </article>
            ),
          )}
        </div>
      )}
    </main>
  );
}