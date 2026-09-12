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
        <h1 className="text-3xl font-bold">
          Categorías
        </h1>

        <p className="mt-2 text-sm">
          Gestiona las categorías disponibles para clasificar las recetas.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <CategoryCreateForm />

        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Categorías existentes
          </h2>

          {categories.length === 0 ? (
            <p className="mt-4 text-sm">
              Todavía no hay categorías.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {categories.map(
                (category) => (
                  <article
                    key={
                      category.id
                    }
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">
                          {
                            category.name
                          }
                        </h3>

                        <p className="mt-1 text-sm">
                          /categories/
                          {
                            category.slug
                          }
                        </p>

                        {category.description && (
                          <p className="mt-2 text-sm">
                            {
                              category.description
                            }
                          </p>
                        )}
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
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
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