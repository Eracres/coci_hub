import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Sparkles,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";

import {
  getRecipeCategoryVisual,
} from "@/config/recipe-category-icons";

import {
  getConfiguredRecipeCategoryNames,
  normalizeRecipeCategoryName,
  RECIPE_CATEGORY_SECTIONS,
} from "@/config/recipe-category-sections";

import {
  getPublicCategories,
} from "@/services/categories/public-category-service";

import type {
  PublicCategorySummary,
} from "@/types/public-category";


export const metadata: Metadata = {
  title:
    "Categorías",

  description:
    "Explora las recetas de CociHub por origen, ingrediente y tipo de preparación.",
};


function getCategoriesByNames(
  categories:
    PublicCategorySummary[],

  names:
    string[],
) {
  const categoryByName =
    new Map(
      categories.map(
        (
          category,
        ) => [
          normalizeRecipeCategoryName(
            category.name,
          ),

          category,
        ],
      ),
    );


  return names
    .map(
      (
        name,
      ) =>
        categoryByName.get(
          normalizeRecipeCategoryName(
            name,
          ),
        ),
    )
    .filter(
      (
        category,
      ): category is PublicCategorySummary =>
        Boolean(
          category,
        ),
    );
}


function getRecipeCountLabel(
  count:
    number,
) {
  if (
    count ===
    0
  ) {
    return "Aún sin recetas";
  }


  if (
    count ===
    1
  ) {
    return "1 receta";
  }


  return `${count} recetas`;
}


type VisualCategoryCardProps = {
  category:
    PublicCategorySummary;

  compact?:
    boolean;
};


function VisualCategoryCard({
  category,
  compact =
    false,
}: VisualCategoryCardProps) {
  const visual =
    getRecipeCategoryVisual(
      category.name,
    );


  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-md md:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={
            compact
              ? "flex size-11 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-hover transition duration-300 group-hover:bg-secondary group-hover:text-inverse"
              : "flex size-14 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-hover transition duration-300 group-hover:bg-secondary group-hover:text-inverse"
          }
        >
          {visual.kind ===
          "icon" ? (
            <visual.icon
              className={
                compact
                  ? "size-5"
                  : "size-6"
              }
              aria-hidden="true"
            />
          ) : (
            <span
              className={
                compact
                  ? "text-2xl leading-none"
                  : "text-3xl leading-none"
              }
              aria-hidden="true"
            >
              {
                visual.flag
              }
            </span>
          )}
        </span>


        <ArrowRight
          className="size-4 text-muted-foreground transition duration-300 group-hover:translate-x-1 group-hover:text-secondary-hover"
          aria-hidden="true"
        />
      </div>


      <h3
        className={
          compact
            ? "mt-5 font-serif text-lg font-bold leading-tight text-foreground"
            : "mt-6 font-serif text-xl font-bold leading-tight text-foreground md:text-2xl"
        }
      >
        {
          category.name
        }
      </h3>


      <p
        className={
          category.recipeCount >
          0
            ? "mt-2 text-xs font-medium text-secondary-hover"
            : "mt-2 text-xs text-muted-foreground"
        }
      >
        {
          getRecipeCountLabel(
            category.recipeCount,
          )
        }
      </p>
    </Link>
  );
}


type CuisineCardProps = {
  category:
    PublicCategorySummary;
};


function CuisineCard({
  category,
}: CuisineCardProps) {
  const visual =
    getRecipeCategoryVisual(
      category.name,
    );


  const cuisineName =
    category.name.replace(
      /^Cocina\s+/,
      "",
    );


  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex min-h-48 flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand/5 transition duration-500 group-hover:scale-125 group-hover:bg-brand/10"
        aria-hidden="true"
      />


      <div className="relative flex items-start justify-between gap-4">
        {visual.kind ===
        "flag" ? (
          <span
            className="text-5xl leading-none"
            aria-hidden="true"
          >
            {
              visual.flag
            }
          </span>
        ) : (
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <visual.icon
              className="size-6"
              aria-hidden="true"
            />
          </span>
        )}


        <span className="flex size-9 items-center justify-center rounded-full border border-border bg-page text-muted-foreground transition duration-300 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>


      <div className="relative mt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Cocina
        </p>


        <h3 className="mt-1 font-serif text-2xl font-bold capitalize text-foreground">
          {
            cuisineName
          }
        </h3>


        <p
          className={
            category.recipeCount >
            0
              ? "mt-2 text-xs font-medium text-brand"
              : "mt-2 text-xs text-muted-foreground"
          }
        >
          {
            getRecipeCountLabel(
              category.recipeCount,
            )
          }
        </p>
      </div>
    </Link>
  );
}


export default async function CategoriesPage() {
  const categories =
    await getPublicCategories();


  const categoriesWithRecipes =
    categories.filter(
      (
        category,
      ) =>
        category.recipeCount >
        0,
    ).length;


  const configuredCategoryNames =
    getConfiguredRecipeCategoryNames();


  const unconfiguredCategories =
    categories.filter(
      (
        category,
      ) =>
        !configuredCategoryNames.has(
          normalizeRecipeCategoryName(
            category.name,
          ),
        ),
    );


  const ingredientSection =
    RECIPE_CATEGORY_SECTIONS.find(
      (
        section,
      ) =>
        section.title ===
        "Ingrediente principal",
    );


  const preparationSection =
    RECIPE_CATEGORY_SECTIONS.find(
      (
        section,
      ) =>
        section.title ===
        "Tipo de preparación o formato",
    );


  const originSection =
    RECIPE_CATEGORY_SECTIONS.find(
      (
        section,
      ) =>
        section.title ===
        "Cocina y origen gastronómico",
    );


  const styleSection =
    RECIPE_CATEGORY_SECTIONS.find(
      (
        section,
      ) =>
        section.title ===
        "Estilo de cocina",
    );


  return (
    <main>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-page-muted/40">
        <div
          className="pointer-events-none absolute -left-28 -top-28 size-80 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -right-20 size-96 rounded-full bg-secondary/15 blur-3xl"
          aria-hidden="true"
        />


        <Container className="relative py-14 md:py-18 lg:py-20">
          <header className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-4 py-2 text-sm font-semibold text-secondary-hover">
              <Sparkles
                className="size-4"
                aria-hidden="true"
              />

              Explora CociHub
            </div>


            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Encuentra tu próxima receta a tu manera
            </h1>


            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Viaja por cocinas del mundo, elige un ingrediente
              protagonista o empieza pensando directamente
              en lo que te apetece preparar.
            </p>


            {categories.length >
            0 ? (
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span>
                  <strong className="font-semibold text-foreground">
                    {
                      categories.length
                    }
                  </strong>{" "}
                  categorías para explorar
                </span>


                <span className="hidden size-1 rounded-full bg-border sm:block" />


                <span>
                  <strong className="font-semibold text-foreground">
                    {
                      categoriesWithRecipes
                    }
                  </strong>{" "}
                  con recetas publicadas
                </span>
              </div>
            ) : null}
          </header>
        </Container>
      </section>


      {/* ===================================================
          CUISINES
      =================================================== */}

      {originSection ? (
        <section className="py-16 md:py-20">
          <Container>
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Cocinas del mundo
              </p>


              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                ¿Dónde te apetece cocinar?
              </h2>


              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Elige un destino y descubre recetas inspiradas
                en diferentes tradiciones gastronómicas.
              </p>
            </header>


            <div className="mt-10 space-y-12">
              {originSection.subgroups.map(
                (
                  subgroup,
                ) => {
                  const groupCategories =
                    getCategoriesByNames(
                      categories,
                      subgroup.categoryNames,
                    );


                  if (
                    groupCategories.length ===
                    0
                  ) {
                    return null;
                  }


                  return (
                    <div
                      key={
                        subgroup.title
                      }
                    >
                      <div className="mb-5 flex items-center gap-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {
                            subgroup.title
                          }
                        </h3>


                        <div className="h-px flex-1 bg-border" />
                      </div>


                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {groupCategories.map(
                          (
                            category,
                          ) => (
                            <CuisineCard
                              key={
                                category.id
                              }
                              category={
                                category
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          MAIN INGREDIENT
      =================================================== */}

      {ingredientSection ? (
        <section className="border-y border-border bg-page-muted/50 py-16 md:py-20">
          <Container>
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                Por ingrediente principal
              </p>


              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                ¿Qué te apetece cocinar?
              </h2>


              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Empieza por el ingrediente que quieres convertir
                en protagonista del plato.
              </p>
            </header>


            <div className="mt-10 space-y-10">
              {ingredientSection.subgroups.map(
                (
                  subgroup,
                ) => {
                  const groupCategories =
                    getCategoriesByNames(
                      categories,
                      subgroup.categoryNames,
                    );


                  if (
                    groupCategories.length ===
                    0
                  ) {
                    return null;
                  }


                  return (
                    <div
                      key={
                        subgroup.title
                      }
                    >
                      <h3 className="mb-4 font-serif text-xl font-bold text-foreground">
                        {
                          subgroup.title
                        }
                      </h3>


                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {groupCategories.map(
                          (
                            category,
                          ) => (
                            <VisualCategoryCard
                              key={
                                category.id
                              }
                              category={
                                category
                              }
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          PREPARATION
      =================================================== */}

      {preparationSection ? (
        <section className="py-16 md:py-20">
          <Container>
            <header className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Por tipo de elaboración
              </p>


              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                ¿Qué te apetece preparar?
              </h2>


              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                A veces no sabes qué ingrediente quieres,
                pero sí sabes si te apetece una sopa,
                una pizza o algo dulce.
              </p>
            </header>


            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              {preparationSection.subgroups.map(
                (
                  subgroup,
                ) => {
                  const groupCategories =
                    getCategoriesByNames(
                      categories,
                      subgroup.categoryNames,
                    );


                  if (
                    groupCategories.length ===
                    0
                  ) {
                    return null;
                  }


                  return (
                    <div
                      key={
                        subgroup.title
                      }
                      className="rounded-3xl border border-border bg-surface p-5 shadow-sm md:p-6"
                    >
                      <h3 className="font-serif text-xl font-bold text-foreground">
                        {
                          subgroup.title
                        }
                      </h3>


                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {groupCategories.map(
                          (
                            category,
                          ) => (
                            <VisualCategoryCard
                              key={
                                category.id
                              }
                              category={
                                category
                              }
                              compact
                            />
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          STYLE
      =================================================== */}

      {styleSection ? (
        <section className="border-t border-border bg-page-muted/50 py-14 md:py-16">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                  Otra forma de empezar
                </p>


                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                  ¿Y algo de toda la vida?
                </h2>


                <p className="mt-3 leading-7 text-muted-foreground">
                  También puedes explorar recetas por su estilo
                  o tradición culinaria.
                </p>
              </div>


              <div className="grid gap-4 sm:grid-cols-2">
                {styleSection.subgroups
                  .flatMap(
                    (
                      subgroup,
                    ) =>
                      getCategoriesByNames(
                        categories,
                        subgroup.categoryNames,
                      ),
                  )
                  .map(
                    (
                      category,
                    ) => (
                      <VisualCategoryCard
                        key={
                          category.id
                        }
                        category={
                          category
                        }
                        compact
                      />
                    ),
                  )}
              </div>
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          UNCATEGORIZED
      =================================================== */}

      {unconfiguredCategories.length >
      0 ? (
        <section className="border-t border-border py-14 md:py-16">
          <Container>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <BookOpen
                  className="size-5"
                  aria-hidden="true"
                />
              </span>


              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                  Más categorías
                </p>


                <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                  Otras formas de explorar
                </h2>
              </div>
            </div>


            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {unconfiguredCategories.map(
                (
                  category,
                ) => (
                  <VisualCategoryCard
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                    compact
                  />
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          EMPTY
      =================================================== */}

      {categories.length ===
      0 ? (
        <section className="py-16">
          <Container>
            <div className="rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <ChefHat
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-5 font-serif text-3xl font-bold text-foreground">
                Todavía no hay categorías
              </h2>


              <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
                Cuando empiece a crecer el recetario,
                aparecerán aquí todas las formas de explorarlo.
              </p>
            </div>
          </Container>
        </section>
      ) : null}

    </main>
  );
}