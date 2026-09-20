import {
  BookOpen,
  Trash2,
} from "lucide-react";

import {
  CategoryCreateForm,
} from "@/components/admin/categories/category-create-form";

import {
  deleteCategoryAction,
} from "@/app/admin/categories/actions";

import {
  getAdminCategories,
} from "@/services/categories/category-service";


export default async function AdminCategoriesPage() {
  const categories =
    await getAdminCategories();


  return (
    <main className="mx-auto max-w-5xl p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary-hover">
          Clasificación
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
          Categorías
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Gestiona las categorías
          disponibles para clasificar
          las recetas.
        </p>
      </header>


      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CategoryCreateForm />


        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
              <BookOpen
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Categorías existentes
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  categories.length
                }{" "}
                {categories.length ===
                1
                  ? "categoría creada"
                  : "categorías creadas"}
              </p>
            </div>
          </div>


          {categories.length ===
          0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-page-muted/40 px-5 py-10 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <BookOpen
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                Todavía no hay categorías
              </h3>


              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                Utiliza el formulario
                de esta página para
                crear la primera
                categoría de CociHub.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {categories.map(
                (
                  category,
                ) => (
                  <article
                    key={
                      category.id
                    }
                    className="rounded-xl border border-border bg-page/40 p-4"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {
                            category.name
                          }
                        </h3>


                        <p className="mt-1 break-all text-xs text-muted-foreground">
                          /categories/
                          {
                            category.slug
                          }
                        </p>


                        {category.description ? (
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {
                              category.description
                            }
                          </p>
                        ) : null}
                      </div>


                      <form
                        action={async () => {
                          "use server";

                          await deleteCategoryAction(
                            category.id,
                          );
                        }}
                      >
                        <button
                          type="submit"
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-muted-foreground transition hover:border-error/30 hover:bg-error/5 hover:text-error"
                        >
                          <Trash2
                            className="size-4"
                            aria-hidden="true"
                          />

                          Eliminar
                        </button>
                      </form>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}