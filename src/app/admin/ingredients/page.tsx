import {
  CircleAlert,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Tags,
} from "lucide-react";

import Link from "next/link";

import {
  FoodCatalogEditor,
} from "@/components/admin/ingredients/food-catalog-editor";

import {
  getAdminFoodCatalogData,
  type AdminFoodCatalogItem,
} from "@/services/ingredients/admin-food-catalog-service";


type AdminIngredientsPageProps = {
  searchParams:
    Promise<{
      q?:
        string | string[];

      status?:
        string | string[];

      edit?:
        string | string[];
    }>;
};


function firstParam(
  value:
    string |
    string[] |
    undefined,
) {
  return Array.isArray(
    value,
  )
    ? value[0] ??
        ""
    : value ??
        "";
}


function normalizeSearch(
  value:
    string,
) {
  return value
    .trim()
    .toLocaleLowerCase(
      "es",
    );
}


function getStatusHref(
  status:
    string,
  query:
    string,
) {
  const params =
    new URLSearchParams();


  if (
    query
  ) {
    params.set(
      "q",
      query,
    );
  }


  if (
    status !==
    "all"
  ) {
    params.set(
      "status",
      status,
    );
  }


  const search =
    params.toString();


  return search
    ? `/admin/ingredients?${search}`
    : "/admin/ingredients";
}


function getEditHref(
  foodItemId:
    string,
  query:
    string,
  status:
    string,
) {
  const params =
    new URLSearchParams();


  params.set(
    "edit",
    foodItemId,
  );


  if (
    query
  ) {
    params.set(
      "q",
      query,
    );
  }


  if (
    status !==
    "all"
  ) {
    params.set(
      "status",
      status,
    );
  }


  return `/admin/ingredients?${params.toString()}`;
}


function formatReviewDate(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "es-ES",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


function matchesStatus(
  item:
    AdminFoodCatalogItem,
  status:
    string,
) {
  if (
    status ===
    "pending"
  ) {
    return item.allergenReviewedAt ===
      null;
  }


  if (
    status ===
    "reviewed"
  ) {
    return item.allergenReviewedAt !==
      null;
  }


  if (
    status ===
    "inactive"
  ) {
    return item.isActive ===
      false;
  }


  return true;
}


export default async function AdminIngredientsPage({
  searchParams,
}: AdminIngredientsPageProps) {
  const params =
    await searchParams;


  const query =
    firstParam(
      params.q,
    );


  const requestedStatus =
    firstParam(
      params.status,
    );


  const status =
    [
      "all",
      "pending",
      "reviewed",
      "inactive",
    ].includes(
      requestedStatus,
    )
      ? requestedStatus ||
        "all"
      : "all";


  const editId =
    firstParam(
      params.edit,
    );


  const {
    items,
    allergens,
  } =
    await getAdminFoodCatalogData();


  const normalizedQuery =
    normalizeSearch(
      query,
    );


  const filteredItems =
    items.filter(
      (
        item,
      ) => {
        if (
          !matchesStatus(
            item,
            status,
          )
        ) {
          return false;
        }


        if (
          !normalizedQuery
        ) {
          return true;
        }


        const searchable =
          [
            item.name,
            item.slug,
            ...item.aliases,
          ]
            .join(
              " ",
            )
            .toLocaleLowerCase(
              "es",
            );


        return searchable.includes(
          normalizedQuery,
        );
      },
    );


  const selectedItem =
    items.find(
      (
        item,
      ) =>
        item.id ===
        editId,
    ) ??
    null;


  const pendingCount =
    items.filter(
      (
        item,
      ) =>
        item.allergenReviewedAt ===
        null,
    ).length;


  const inactiveCount =
    items.filter(
      (
        item,
      ) =>
        !item.isActive,
    ).length;


  const allergenNamesById =
    new Map(
      allergens.map(
        (
          allergen,
        ) => [
          allergen.id,
          allergen.name,
        ],
      ),
    );


  return (
    <main className="mx-auto max-w-7xl p-8">
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary-hover">
            Conocimiento alimentario
          </p>

          <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
            Ingredientes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Administra los alimentos canónicos que reconoce CociHub, sus alias exactos y las relaciones deterministas con alérgenos.
          </p>
        </div>


        <Link
          href="/admin/ingredients"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
        >
          <Plus
            className="size-4"
            aria-hidden="true"
          />

          Nuevo ingrediente
        </Link>
      </header>


      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Catálogo
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-foreground">
            {
              items.length
            }
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            alimentos canónicos
          </p>
        </article>


        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Pendientes
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-secondary-hover">
            {
              pendingCount
            }
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            sin revisión explícita
          </p>
        </article>


        <article className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Inactivos
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-muted-foreground">
            {
              inactiveCount
            }
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            fuera del resolver
          </p>
        </article>
      </section>


      <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <form
          method="get"
          className="flex flex-col gap-3 md:flex-row"
        >
          <label className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <span className="sr-only">
              Buscar ingrediente
            </span>

            <input
              type="search"
              name="q"
              defaultValue={
                query
              }
              placeholder="Buscar por nombre, slug o alias..."
              className="min-h-11 w-full rounded-xl border border-border bg-page pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-brand"
            />
          </label>


          {status !==
          "all" ? (
            <input
              type="hidden"
              name="status"
              value={
                status
              }
            />
          ) : null}


          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-page px-4 text-sm font-semibold text-foreground transition hover:border-brand/40 hover:text-brand"
          >
            Buscar
          </button>
        </form>


        <nav className="mt-4 flex flex-wrap gap-2">
          {[
            [
              "all",
              "Todos",
            ],
            [
              "pending",
              "Pendientes",
            ],
            [
              "reviewed",
              "Revisados",
            ],
            [
              "inactive",
              "Inactivos",
            ],
          ].map(
            (
              [
                value,
                label,
              ],
            ) => (
              <Link
                key={
                  value
                }
                href={
                  getStatusHref(
                    value,
                    query,
                  )
                }
                className={
                  status ===
                  value
                    ? "rounded-full bg-brand px-3 py-2 text-xs font-semibold text-inverse"
                    : "rounded-full border border-border bg-page px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-brand/40 hover:text-brand"
                }
              >
                {
                  label
                }
              </Link>
            ),
          )}
        </nav>
      </section>


      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
              <Tags
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">
                Catálogo actual
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {
                  filteredItems.length
                }{" "}
                {
                  filteredItems.length ===
                  1
                    ? "resultado"
                    : "resultados"
                }
              </p>
            </div>
          </div>


          {filteredItems.length ===
          0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border-strong bg-page-muted/40 px-5 py-10 text-center">
              <CircleAlert
                className="mx-auto size-7 text-muted-foreground"
                aria-hidden="true"
              />

              <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                No hay coincidencias
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                Prueba con otro término o cambia el filtro del catálogo.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredItems.map(
                (
                  item,
                ) => {
                  const allergenNames =
                    item.allergenIds
                      .map(
                        (
                          id,
                        ) =>
                          allergenNamesById.get(
                            id,
                          ),
                      )
                      .filter(
                        (
                          name,
                        ): name is string =>
                          Boolean(
                            name,
                          ),
                      );


                  return (
                    <article
                      key={
                        item.id
                      }
                      className={
                        selectedItem?.id ===
                        item.id
                          ? "rounded-xl border border-brand/40 bg-brand/5 p-4"
                          : "rounded-xl border border-border bg-page/40 p-4"
                      }
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {
                                item.name
                              }
                            </h3>

                            {!item.isActive ? (
                              <span className="rounded-full border border-border bg-page px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                                Inactivo
                              </span>
                            ) : null}

                            {item.allergenReviewedAt ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand">
                                <ShieldCheck
                                  className="size-3"
                                  aria-hidden="true"
                                />

                                Revisado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-1 text-[11px] font-semibold text-secondary-hover">
                                <CircleAlert
                                  className="size-3"
                                  aria-hidden="true"
                                />

                                Pendiente
                              </span>
                            )}
                          </div>


                          <p className="mt-1 break-all text-xs text-muted-foreground">
                            {
                              item.slug
                            }
                          </p>


                          <div className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                            <p>
                              <span className="font-semibold text-foreground">
                                Alias:
                              </span>{" "}
                              {
                                item.aliases.length >
                                0
                                  ? item.aliases.join(
                                      " · ",
                                    )
                                  : "—"
                              }
                            </p>

                            <p>
                              <span className="font-semibold text-foreground">
                                Alérgenos:
                              </span>{" "}
                              {
                                allergenNames.length >
                                0
                                  ? allergenNames.join(
                                      " · ",
                                    )
                                  : item.allergenReviewedAt
                                    ? "Ninguno confirmado"
                                    : "Sin revisar"
                              }
                            </p>

                            {item.allergenReviewedAt ? (
                              <p>
                                Revisión:{" "}
                                {
                                  formatReviewDate(
                                    item.allergenReviewedAt,
                                  )
                                }
                              </p>
                            ) : null}
                          </div>
                        </div>


                        <Link
                          href={
                            getEditHref(
                              item.id,
                              query,
                              status,
                            )
                          }
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-muted-foreground transition hover:border-brand/40 hover:text-brand"
                        >
                          <Pencil
                            className="size-4"
                            aria-hidden="true"
                          />

                          Editar
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </section>


        <FoodCatalogEditor
          key={
            selectedItem?.id ??
            "new"
          }
          foodItem={
            selectedItem
          }
          allergens={
            allergens
          }
        />
      </div>
    </main>
  );
}
