/* eslint-disable @next/next/no-img-element */

import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  Star,
  Users,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  getRecipeCategoryHeroImage,
} from "@/config/recipe-category-hero-images";

import {
  getRecipeCategoryVisual,
} from "@/config/recipe-category-icons";

import {
  normalizeRecipeCategoryName,
  RECIPE_CATEGORY_SECTIONS,
} from "@/config/recipe-category-sections";

import {
  getPublicCategories,
  getPublicCategoryBySlug,
} from "@/services/categories/public-category-service";

import type {
  PublicCategorySummary,
} from "@/types/public-category";

import type {
  PublicRecipeListItem,
} from "@/types/public-recipe";


type CategoryPageProps = {
  params:
    Promise<{
      slug:
        string;
    }>;
};


type CategoryContext = {
  sectionTitle:
    string;

  subgroupTitle:
    string;

  categoryNames:
    string[];
};


/* =========================================================
   CATEGORY CONTEXT
========================================================= */

function getCategoryContext(
  categoryName:
    string,
): CategoryContext | null {
  const normalizedCategoryName =
    normalizeRecipeCategoryName(
      categoryName,
    );


  for (
    const section
    of RECIPE_CATEGORY_SECTIONS
  ) {
    for (
      const subgroup
      of section.subgroups
    ) {
      const matches =
        subgroup.categoryNames.some(
          (
            configuredName,
          ) =>
            normalizeRecipeCategoryName(
              configuredName,
            ) ===
            normalizedCategoryName,
        );


      if (
        matches
      ) {
        return {
          sectionTitle:
            section.title,

          subgroupTitle:
            subgroup.title,

          categoryNames:
            subgroup.categoryNames,
        };
      }
    }
  }


  return null;
}


/* =========================================================
   COPY
========================================================= */

function getCategoryEyebrow(
  sectionTitle:
    string | undefined,
) {
  if (
    sectionTitle ===
    "Cocina y origen gastronómico"
  ) {
    return "Cocinas del mundo";
  }


  if (
    sectionTitle ===
    "Ingrediente principal"
  ) {
    return "Ingrediente principal";
  }


  if (
    sectionTitle ===
    "Tipo de preparación o formato"
  ) {
    return "Tipo de elaboración";
  }


  if (
    sectionTitle ===
    "Estilo de cocina"
  ) {
    return "Estilo de cocina";
  }


  return "Categoría CociHub";
}


function getCategoryDescription(
  categoryName:
    string,

  sectionTitle:
    string | undefined,
) {
  if (
    sectionTitle ===
    "Cocina y origen gastronómico"
  ) {
    const cuisineName =
      categoryName.replace(
        /^Cocina /,
        "",
      );


    return `Sabores, tradición y recetas para viajar por la cocina ${cuisineName.toLowerCase()} sin salir de tu cocina.`;
  }


  if (
    sectionTitle ===
    "Ingrediente principal"
  ) {
    return `Ideas, sabores y distintas formas de cocinar con ${categoryName.toLowerCase()} como protagonistas.`;
  }


  if (
    sectionTitle ===
    "Tipo de preparación o formato"
  ) {
    return `Recetas de ${categoryName.toLowerCase()} para encontrar inspiración y disfrutar preparando algo diferente.`;
  }


  if (
    sectionTitle ===
    "Estilo de cocina"
  ) {
    return `Recetas con el carácter de ${categoryName.toLowerCase()}, pensadas para cocinar, conservar y compartir.`;
  }


  return `Explora las recetas de ${categoryName} disponibles en CociHub y encuentra tu próxima idea para cocinar.`;
}


function getDifficultyLabel(
  difficulty:
    PublicRecipeListItem["difficulty"],
) {
  switch (
    difficulty
  ) {
    case "easy":
      return "Fácil";

    case "medium":
      return "Media";

    case "hard":
      return "Difícil";

    default:
      return null;
  }
}


function getRelatedCategoryDisplayName(
  categoryName:
    string,
) {
  const strippedName =
    categoryName.replace(
      /^Cocina /,
      "",
    );


  return (
    strippedName
      .charAt(
        0,
      )
      .toLocaleUpperCase(
        "es",
      ) +
    strippedName.slice(
      1,
    )
  );
}


/* =========================================================
   RELATED CATEGORY
========================================================= */

function RelatedCategoryCard({
  category,
}: {
  category:
    PublicCategorySummary;
}) {
  const visual =
    getRecipeCategoryVisual(
      category.name,
    );


  const VisualIcon =
    visual.kind ===
    "icon"
      ? visual.icon
      : null;


  const displayName =
    getRelatedCategoryDisplayName(
      category.name,
    );


  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group flex min-h-32 flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        {visual.kind ===
        "flag" ? (
          <span
            className="text-3xl leading-none"
            role="img"
            aria-label={`Bandera asociada a ${category.name}`}
          >
            {
              visual.flag
            }
          </span>
        ) : VisualIcon ? (
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary-hover">
            <VisualIcon
              className="size-5"
              aria-hidden="true"
            />
          </span>
        ) : null}


        <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>


      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {
            category.name.startsWith(
              "Cocina ",
            )
              ? "Cocina"
              : "Categoría"
          }
        </p>


        <h3 className="mt-1 font-serif text-xl font-bold text-foreground">
          {
            displayName
          }
        </h3>


        <p className="mt-1 text-xs text-muted-foreground">
          {category.recipeCount ===
          0
            ? "Aún sin recetas"
            : category.recipeCount ===
                1
              ? "1 receta"
              : `${category.recipeCount} recetas`}
        </p>
      </div>
    </Link>
  );
}


/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const result =
    await getPublicCategoryBySlug(
      slug,
    );


  if (
    !result
  ) {
    return {
      title:
        "Categoría no encontrada",
    };
  }


  const context =
    getCategoryContext(
      result.category.name,
    );


  return {
    title:
      result.category.name,

    description:
      getCategoryDescription(
        result.category.name,
        context?.sectionTitle,
      ),
  };
}


/* =========================================================
   PAGE
========================================================= */

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const {
    slug,
  } =
    await params;


  const [
    result,
    publicCategories,
  ] =
    await Promise.all([
      getPublicCategoryBySlug(
        slug,
      ),

      getPublicCategories(),
    ]);


  if (
    !result
  ) {
    notFound();
  }


  const context =
    getCategoryContext(
      result.category.name,
    );


  const eyebrow =
    getCategoryEyebrow(
      context?.sectionTitle,
    );


  const description =
    getCategoryDescription(
      result.category.name,
      context?.sectionTitle,
    );


  const categoryVisual =
    getRecipeCategoryVisual(
      result.category.name,
    );


  const CategoryIcon =
    categoryVisual.kind ===
    "icon"
      ? categoryVisual.icon
      : null;


  const featuredRecipe =
    result.recipes.find(
      (
        recipe,
      ) =>
        recipe.featured,
    ) ??
    result.recipes[0] ??
    null;


  const remainingRecipes =
    featuredRecipe
      ? result.recipes.filter(
          (
            recipe,
          ) =>
            recipe.id !==
            featuredRecipe.id,
        )
      : [];


  const configuredHeroImage =
    getRecipeCategoryHeroImage(
      result.category.slug,
      context?.sectionTitle,
    );


  const heroImage =
    configuredHeroImage ??
    (
      featuredRecipe?.imageUrl
        ? {
            src:
              featuredRecipe.imageUrl,

            alt:
              featuredRecipe.title,
          }
        : null
    );


  const difficultyLabel =
    featuredRecipe
      ? getDifficultyLabel(
          featuredRecipe.difficulty,
        )
      : null;


  const currentNormalizedName =
    normalizeRecipeCategoryName(
      result.category.name,
    );


  const relatedCategories =
    (
      context?.categoryNames ??
      []
    )
      .flatMap(
        (
          categoryName,
        ) => {
          const normalizedName =
            normalizeRecipeCategoryName(
              categoryName,
            );


          if (
            normalizedName ===
            currentNormalizedName
          ) {
            return [];
          }


          const match =
            publicCategories.find(
              (
                category,
              ) =>
                normalizeRecipeCategoryName(
                  category.name,
                ) ===
                normalizedName,
            );


          return match
            ? [
                match,
              ]
            : [];
        },
      )
      .slice(
        0,
        4,
      );


  return (
    <main>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-page-muted/40">
        <div
          className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />


        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="relative grid lg:min-h-[500px] lg:grid-cols-[minmax(0,0.82fr)_minmax(560px,1.18fr)] xl:min-h-[540px] xl:grid-cols-[minmax(0,0.78fr)_minmax(640px,1.22fr)]">
            {/* =============================================
                HERO COPY
            ============================================= */}

            <div className="relative z-10 flex flex-col justify-center py-10 md:py-14 lg:py-16 lg:pr-8 xl:pr-10">
              <Link
                href="/categories"
                className="inline-flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-foreground transition hover:bg-surface/70 hover:text-brand"
              >
                <ArrowLeft
                  className="size-4"
                  aria-hidden="true"
                />

                Volver a categorías
              </Link>


              <div className="mt-9 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                  {
                    eyebrow
                  }
                </span>


                {context?.subgroupTitle ? (
                  <>
                    <span
                      className="size-1 rounded-full bg-border-strong"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {
                        context.subgroupTitle
                      }
                    </span>
                  </>
                ) : null}
              </div>


              <div className="mt-6 flex items-center gap-5">
                {categoryVisual.kind ===
                "flag" ? (
                  <span
                    className="shrink-0 text-6xl leading-none sm:text-7xl"
                    role="img"
                    aria-label={`Bandera asociada a ${result.category.name}`}
                  >
                    {
                      categoryVisual.flag
                    }
                  </span>
                ) : CategoryIcon ? (
                  <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-secondary/15 text-secondary-hover">
                    <CategoryIcon
                      className="size-10"
                      strokeWidth={
                        1.6
                      }
                      aria-hidden="true"
                    />
                  </span>
                ) : null}


                <h1 className="font-serif text-5xl font-bold leading-[0.98] tracking-tight text-foreground sm:text-6xl xl:text-7xl">
                  {
                    result.category
                      .name
                  }
                </h1>
              </div>


              <p className="mt-7 max-w-lg font-serif text-xl italic leading-8 text-muted-foreground sm:text-2xl">
                {
                  description
                }
              </p>


              <div className="mt-8">
                <span className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground shadow-sm">
                  <ChefHat
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  {
                    result.total
                  }{" "}
                  {result.total ===
                  1
                    ? "receta publicada"
                    : "recetas publicadas"}
                </span>
              </div>


              {/* ===========================================
                  MOBILE HERO ARTWORK
              =========================================== */}

              <div className="mt-9 lg:hidden">
                {heroImage ? (
                  <div className="aspect-[16/10] overflow-hidden rounded-[2rem] border border-border bg-page-muted shadow-sm">
                    <img
                      src={
                        heroImage.src
                      }
                      alt={
                        heroImage.alt
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-[2rem] border border-border bg-secondary/10">
                    {categoryVisual.kind ===
                    "flag" ? (
                      <span
                        className="text-7xl"
                        role="img"
                        aria-hidden="true"
                      >
                        {
                          categoryVisual.flag
                        }
                      </span>
                    ) : CategoryIcon ? (
                      <CategoryIcon
                        className="size-20 text-secondary-hover"
                        strokeWidth={
                          1.4
                        }
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                )}
              </div>
            </div>


            {/* =============================================
                DESKTOP HERO ARTWORK
            ============================================= */}

            <div className="relative hidden min-h-[500px] lg:-mr-8 lg:block xl:-mr-10 xl:min-h-[540px]">
              <div
                className="absolute inset-0"
                style={{
                  WebkitMaskImage:
                    'url("/masks/category-hero-curve.svg")',

                  maskImage:
                    'url("/masks/category-hero-curve.svg")',

                  WebkitMaskRepeat:
                    "no-repeat",

                  maskRepeat:
                    "no-repeat",

                  WebkitMaskSize:
                    "100% 100%",

                  maskSize:
                    "100% 100%",

                  WebkitMaskPosition:
                    "center",

                  maskPosition:
                    "center",
                }}
              >
                {heroImage ? (
                  <img
                    src={
                      heroImage.src
                    }
                    alt={
                      heroImage.alt
                    }
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/10 via-secondary/10 to-accent/10">
                    {categoryVisual.kind ===
                    "flag" ? (
                      <span
                        className="text-9xl opacity-90"
                        role="img"
                        aria-hidden="true"
                      >
                        {
                          categoryVisual.flag
                        }
                      </span>
                    ) : CategoryIcon ? (
                      <CategoryIcon
                        className="size-28 text-secondary-hover"
                        strokeWidth={
                          1.3
                        }
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          FEATURED RECIPE
      =================================================== */}

      {featuredRecipe ? (
        <section className="py-12 md:py-16">
          <Container>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Star
                  className="size-5 fill-accent text-accent"
                  aria-hidden="true"
                />

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-hover">
                  {featuredRecipe.featured
                    ? "Receta destacada"
                    : "Para empezar"}
                </p>
              </div>


              <div
                className="h-px flex-1 bg-border"
                aria-hidden="true"
              />
            </div>


            <article className="group mt-7 overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
              <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <Link
                  href={`/recipes/${featuredRecipe.slug}`}
                  className="relative block min-h-72 overflow-hidden bg-page-muted md:min-h-96"
                >
                  {featuredRecipe.imageUrl ? (
                    <img
                      src={
                        featuredRecipe.imageUrl
                      }
                      alt={
                        featuredRecipe.title
                      }
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full min-h-72 items-center justify-center text-muted-foreground">
                      Imagen no disponible
                    </div>
                  )}


                  {featuredRecipe.featured ? (
                    <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-surface/95 px-4 py-2 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
                      <Star
                        className="size-3.5 fill-accent text-accent"
                        aria-hidden="true"
                      />

                      Destacada
                    </span>
                  ) : null}
                </Link>


                <div className="flex flex-col justify-center p-7 md:p-9 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    {
                      eyebrow
                    }
                  </p>


                  <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
                    {
                      featuredRecipe.title
                    }
                  </h2>


                  {featuredRecipe.shortDescription ? (
                    <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                      {
                        featuredRecipe.shortDescription
                      }
                    </p>
                  ) : null}


                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    {difficultyLabel ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-page-muted px-3.5 py-2 font-medium text-foreground">
                        <ChefHat
                          className="size-4 text-brand"
                          aria-hidden="true"
                        />

                        {
                          difficultyLabel
                        }
                      </span>
                    ) : null}


                    {featuredRecipe.totalMinutes >
                    0 ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-page-muted px-3.5 py-2 font-medium text-foreground">
                        <Clock3
                          className="size-4 text-brand"
                          aria-hidden="true"
                        />

                        {
                          featuredRecipe.totalMinutes
                        }{" "}
                        min
                      </span>
                    ) : null}


                    {featuredRecipe.baseServings ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-page-muted px-3.5 py-2 font-medium text-foreground">
                        <Users
                          className="size-4 text-brand"
                          aria-hidden="true"
                        />

                        {
                          featuredRecipe.baseServings
                        }{" "}
                        raciones
                      </span>
                    ) : null}
                  </div>


                  <div className="mt-8">
                    <Link
                      href={`/recipes/${featuredRecipe.slug}`}
                      className="inline-flex items-center gap-3 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
                    >
                      Ver receta

                      <ArrowRight
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          MORE RECIPES
      =================================================== */}

      {remainingRecipes.length >
      0 ? (
        <section className="border-t border-border py-12 md:py-16">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-hover">
                  Sigue cocinando
                </p>


                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Más recetas de{" "}
                  {
                    result.category
                      .name
                  }
                </h2>
              </div>


              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
              >
                Explorar todo CociHub

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <section
              aria-label={`Más recetas de ${result.category.name}`}
              className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {remainingRecipes.map(
                (
                  recipe,
                ) => (
                  <RecipeCard
                    key={
                      recipe.id
                    }
                    recipe={
                      recipe
                    }
                  />
                ),
              )}
            </section>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          EMPTY CATEGORY
      =================================================== */}

      {!featuredRecipe ? (
        <section className="py-12 md:py-16">
          <Container>
            <div className="rounded-[2rem] border border-dashed border-border-strong bg-surface px-6 py-14 text-center shadow-sm md:py-16">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <BookOpen
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-5 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Esta categoría todavía
                espera su primera receta
              </h2>


              <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
                Todavía no hay recetas
                publicadas en{" "}
                <strong className="font-semibold text-foreground">
                  {
                    result.category
                      .name
                  }
                </strong>
                , pero puedes seguir
                explorando otras ideas
                de CociHub.
              </p>


              <div className="mt-7">
                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
                >
                  Explorar recetas

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          RELATED CATEGORIES
      =================================================== */}

      {relatedCategories.length >
      0 ? (
        <section className="border-t border-border bg-secondary/5 py-12 md:py-16">
          <Container>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-hover">
                También puedes explorar
              </p>


              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                {context?.sectionTitle ===
                "Cocina y origen gastronómico"
                  ? `Otras cocinas de ${context.subgroupTitle}`
                  : `Más de ${context?.subgroupTitle ?? "CociHub"}`}
              </h2>


              <p className="mt-3 leading-7 text-muted-foreground">
                Sigue descubriendo
                categorías relacionadas
                y encuentra nuevas ideas
                para cocinar.
              </p>
            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedCategories.map(
                (
                  category,
                ) => (
                  <RelatedCategoryCard
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
          </Container>
        </section>
      ) : null}
    </main>
  );
}