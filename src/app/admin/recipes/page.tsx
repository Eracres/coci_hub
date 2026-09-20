import Link from "next/link";

import {
  Bot,
  ChefHat,
  FilePlus2,
  Pencil,
} from "lucide-react";

import {
  getAdminRecipes,
} from "@/services/recipes/recipe-service";


const statusLabels = {
  draft:
    "Borrador",

  published:
    "Publicada",

  archived:
    "Archivada",
};


export default async function AdminRecipesPage() {
  const recipes =
    await getAdminRecipes();


  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Administración
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
            Recetas
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona las recetas
            almacenadas en CociHub.
          </p>
        </div>


        <Link
          href="/admin/recipes/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
        >
          <FilePlus2
            className="size-4"
            aria-hidden="true"
          />

          Nueva receta
        </Link>
      </div>


      {recipes.length ===
      0 ? (
        <section className="mt-10 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center shadow-sm md:px-10 md:py-16">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ChefHat
              className="size-8"
              aria-hidden="true"
            />
          </span>


          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Tu recetario está vacío
          </p>


          <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
            Crea tu primera receta
          </h2>


          <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
            Puedes empezar una receta
            manualmente o utilizar una
            imagen para que CociHub
            prepare un borrador con
            ayuda de la IA.
          </p>


          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/admin/recipes/new"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
            >
              <FilePlus2
                className="size-4"
                aria-hidden="true"
              />

              Crear receta
            </Link>


            <Link
              href="/admin/recipes/import"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground transition hover:bg-page-muted"
            >
              <Bot
                className="size-4 text-secondary-hover"
                aria-hidden="true"
              />

              Importar con IA
            </Link>
          </div>
        </section>
      ) : (
        <div className="mt-10 space-y-3">
          {recipes.map(
            (
              recipe,
            ) => (
              <article
                key={
                  recipe.id
                }
                className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-xl font-bold text-foreground">
                      {
                        recipe.title
                      }
                    </h2>


                    <span className="rounded-full bg-page-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {
                        statusLabels[
                          recipe.status
                        ]
                      }
                    </span>
                  </div>


                  <p className="mt-2 break-all text-xs text-muted-foreground">
                    /recipes/
                    {
                      recipe.slug
                    }
                  </p>


                  {recipe.short_description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {
                        recipe.short_description
                      }
                    </p>
                  ) : null}
                </div>


                <Link
                  href={`/admin/recipes/${recipe.id}/edit`}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-page-muted"
                >
                  <Pencil
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

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