"use client";

import {
  ArrowLeft,
  ArrowRight,
  Tags,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  updateRecipeClassificationAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeClassificationSchema,
  type RecipeClassificationFormData,
} from "@/schemas/recipe-classification-schema";

import type {
  CategoryOption,
  RecipeTypeOption,
  TagOption,
} from "@/services/recipes/recipe-service";


type RecipeClassificationFormProps = {
  recipeId:
    string;

  recipeTypes:
    RecipeTypeOption[];

  categories:
    CategoryOption[];

  tags:
    TagOption[];

  initialValues: {
    recipeTypeId:
      string | null;

    difficulty:
      | "easy"
      | "medium"
      | "hard"
      | null;

    categoryIds:
      string[];

    tagIds:
      string[];

    featured:
      boolean;
  };

  previousStepHref:
    string;

  nextStepHref:
    string;
};


type CategorySubgroup = {
  title:
    string;

  description?:
    string;

  categoryNames:
    string[];
};


type CategorySection = {
  title:
    string;

  description:
    string;

  subgroups:
    CategorySubgroup[];
};


const CATEGORY_SECTIONS:
  CategorySection[] = [
    {
      title:
        "Ingrediente principal",

      description:
        "Clasifica la receta según los alimentos que tienen mayor protagonismo.",

      subgroups: [
        {
          title:
            "Carnes y aves",

          categoryNames: [
            "Carnes",
            "Aves",
            "Cerdo",
          ],
        },

        {
          title:
            "Pescados y mariscos",

          categoryNames: [
            "Pescados",
            "Mariscos",
          ],
        },

        {
          title:
            "Cereales y derivados",

          categoryNames: [
            "Arroces",
            "Pasta",
          ],
        },

        {
          title:
            "Verduras, hortalizas y tubérculos",

          categoryNames: [
            "Verduras y hortalizas",
            "Legumbres",
            "Setas y hongos",
            "Patatas",
          ],
        },

        {
          title:
            "Frutas y frutos secos",

          categoryNames: [
            "Frutas",
            "Frutos secos",
          ],
        },

        {
          title:
            "Huevos y lácteos",

          categoryNames: [
            "Huevos",
            "Quesos y lácteos",
          ],
        },
      ],
    },

    {
      title:
        "Tipo de preparación o formato",

      description:
        "Agrupa las recetas según su elaboración, presentación o formato final.",

      subgroups: [
        {
          title:
            "Preparaciones saladas",

          categoryNames: [
            "Ensaladas",
            "Sopas y cremas",
            "Guisos y estofados",
            "Platos de cuchara",
            "Salsas",
            "Croquetas y frituras",
          ],
        },

        {
          title:
            "Panes, masas y elaboraciones similares",

          categoryNames: [
            "Panes y masas",
            "Pizzas",
            "Bocadillos y sándwiches",
            "Empanadas",
          ],
        },

        {
          title:
            "Dulces y postres",

          categoryNames: [
            "Tartas y pasteles",
            "Galletas y dulces",
            "Helados y postres fríos",
          ],
        },

        {
          title:
            "Conservas y bebidas",

          categoryNames: [
            "Conservas y encurtidos",
            "Bebidas",
          ],
        },
      ],
    },

    {
      title:
        "Cocina y origen gastronómico",

      description:
        "Relaciona la receta con una tradición culinaria o procedencia gastronómica.",

      subgroups: [
        {
          title:
            "Europa",

          categoryNames: [
            "Cocina española",
            "Cocina francesa",
            "Cocina italiana",
          ],
        },

        {
          title:
            "Latinoamérica",

          categoryNames: [
            "Cocina mexicana",
            "Cocina colombiana",
            "Cocina venezolana",
            "Cocina ecuatoriana",
            "Cocina peruana",
          ],
        },

        {
          title:
            "Asia",

          categoryNames: [
            "Cocina china",
            "Cocina japonesa",
            "Cocina india",
          ],
        },
      ],
    },

    {
      title:
        "Estilo de cocina",

      description:
        "Clasificaciones generales que describen el carácter o enfoque de la receta.",

      subgroups: [
        {
          title:
            "Estilo general",

          categoryNames: [
            "Cocina tradicional",
          ],
        },
      ],
    },
  ];


function normalizeCategoryName(
  value:
    string,
) {
  return value
    .trim()
    .toLocaleLowerCase(
      "es",
    )
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}


function getCategoriesByNames(
  categories:
    CategoryOption[],

  names:
    string[],
) {
  const normalizedNames =
    new Set(
      names.map(
        (
          name,
        ) =>
          normalizeCategoryName(
            name,
          ),
      ),
    );


  return categories.filter(
    (
      category,
    ) =>
      normalizedNames.has(
        normalizeCategoryName(
          category.name,
        ),
      ),
  );
}


function getConfiguredCategoryNames() {
  return new Set(
    CATEGORY_SECTIONS.flatMap(
      (
        section,
      ) =>
        section.subgroups.flatMap(
          (
            subgroup,
          ) =>
            subgroup.categoryNames.map(
              (
                categoryName,
              ) =>
                normalizeCategoryName(
                  categoryName,
                ),
            ),
        ),
    ),
  );
}


export function RecipeClassificationForm({
  recipeId,
  recipeTypes,
  categories,
  tags,
  initialValues,
  previousStepHref,
  nextStepHref,
}: RecipeClassificationFormProps) {
  const router =
    useRouter();


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const {
    register,
    handleSubmit,
    reset,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeClassificationFormData>({
      resolver:
        zodResolver(
          recipeClassificationSchema,
        ),

      defaultValues: {
        recipeTypeId:
          initialValues
            .recipeTypeId ??
          "",

        difficulty:
          initialValues
            .difficulty ??
          "",

        categoryIds:
          initialValues
            .categoryIds,

        tagIds:
          initialValues
            .tagIds,

        featured:
          initialValues
            .featured,
      },
    });


  const configuredCategoryNames =
    getConfiguredCategoryNames();


  const uncategorizedCategories =
    categories.filter(
      (
        category,
      ) =>
        !configuredCategoryNames.has(
          normalizeCategoryName(
            category.name,
          ),
        ),
    );


  async function onSubmit(
    values:
      RecipeClassificationFormData,
  ) {
    setMessage(
      null,
    );


    /*
     * Si ya estaba guardado y no se
     * ha cambiado nada, avanzamos.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    const result =
      await updateRecipeClassificationAction(
        recipeId,
        values,
      );


    if (
      !result.success
    ) {
      setMessage(
        result.message ??
        "No se pudo guardar la clasificación.",
      );

      return;
    }


    /*
     * Marcamos los valores actuales
     * como guardados.
     */
    reset(
      values,
    );


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start gap-4">

        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

          <Tags
            className="size-5"
            aria-hidden="true"
          />

        </span>


        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 3 de 10
          </p>


          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
            Clasificación
          </h2>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Organiza la receta para
            facilitar su búsqueda,
            navegación y descubrimiento
            dentro de CociHub.
          </p>

        </div>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-7 space-y-8"
      >

        {/* =================================================
            TYPE + DIFFICULTY
        ================================================= */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>

            <label
              htmlFor="recipeTypeId"
              className="text-sm font-semibold text-foreground"
            >
              Tipo de receta
            </label>


            <select
              id="recipeTypeId"
              {...register(
                "recipeTypeId",
              )}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            >

              <option value="">
                Sin seleccionar
              </option>


              {recipeTypes.map(
                (
                  type,
                ) => (
                  <option
                    key={
                      type.id
                    }
                    value={
                      type.id
                    }
                  >
                    {
                      type.name
                    }
                  </option>
                ),
              )}

            </select>


            {errors.recipeTypeId && (
              <p
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {
                  errors
                    .recipeTypeId
                    .message
                }
              </p>
            )}

          </div>


          <div>

            <label
              htmlFor="difficulty"
              className="text-sm font-semibold text-foreground"
            >
              Dificultad
            </label>


            <select
              id="difficulty"
              {...register(
                "difficulty",
              )}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            >

              <option value="">
                Sin seleccionar
              </option>

              <option value="easy">
                Fácil
              </option>

              <option value="medium">
                Media
              </option>

              <option value="hard">
                Difícil
              </option>

            </select>


            {errors.difficulty && (
              <p
                role="alert"
                className="mt-2 text-sm text-red-600"
              >
                {
                  errors
                    .difficulty
                    .message
                }
              </p>
            )}

          </div>

        </div>


        {/* =================================================
            CATEGORIES
        ================================================= */}

        <fieldset
          id="publication-category"
          className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6"
        >

          <legend className="px-2 font-serif text-xl font-semibold text-foreground">
            Categorías
          </legend>


          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Puedes seleccionar varias
            categorías. Los grupos sirven
            únicamente para organizarlas
            visualmente.
          </p>


          {categories.length ===
          0 ? (

            <p className="mt-4 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              Todavía no hay categorías
              creadas.
            </p>

          ) : (

            <div className="mt-5 space-y-6">

              {CATEGORY_SECTIONS.map(
                (
                  section,
                ) => {
                  const sectionCategories =
                    section.subgroups.flatMap(
                      (
                        subgroup,
                      ) =>
                        getCategoriesByNames(
                          categories,
                          subgroup.categoryNames,
                        ),
                    );


                  if (
                    sectionCategories.length ===
                    0
                  ) {
                    return null;
                  }


                  return (
                    <section
                      key={
                        section.title
                      }
                      className="rounded-2xl border border-border bg-page-muted/30 p-4 sm:p-5"
                    >

                      <header>

                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          {
                            section.title
                          }
                        </h3>


                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {
                            section.description
                          }
                        </p>

                      </header>


                      <div className="mt-4 space-y-4">

                        {section.subgroups.map(
                          (
                            subgroup,
                          ) => {
                            const subgroupCategories =
                              getCategoriesByNames(
                                categories,
                                subgroup.categoryNames,
                              );


                            if (
                              subgroupCategories.length ===
                              0
                            ) {
                              return null;
                            }


                            return (
                              <div
                                key={
                                  subgroup.title
                                }
                                className="rounded-xl border border-border bg-surface p-4"
                              >

                                <h4 className="text-sm font-semibold text-foreground">
                                  {
                                    subgroup.title
                                  }
                                </h4>


                                {subgroup.description ? (
                                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {
                                      subgroup.description
                                    }
                                  </p>
                                ) : null}


                                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">

                                  {subgroupCategories.map(
                                    (
                                      category,
                                    ) => (
                                      <label
                                        key={
                                          category.id
                                        }
                                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-foreground transition hover:border-border hover:bg-page-muted"
                                      >

                                        <input
                                          type="checkbox"
                                          value={
                                            category.id
                                          }
                                          {...register(
                                            "categoryIds",
                                          )}
                                          className="size-4 shrink-0 accent-brand"
                                        />


                                        <span>
                                          {
                                            category.name
                                          }
                                        </span>

                                      </label>
                                    ),
                                  )}

                                </div>

                              </div>
                            );
                          },
                        )}

                      </div>

                    </section>
                  );
                },
              )}


              {uncategorizedCategories.length >
              0 ? (

                <section className="rounded-2xl border border-dashed border-border bg-page-muted/20 p-4 sm:p-5">

                  <header>

                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      Otras categorías
                    </h3>


                    <p className="mt-1 text-sm text-muted-foreground">
                      Categorías todavía
                      no asignadas a un
                      grupo visual.
                    </p>

                  </header>


                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">

                    {uncategorizedCategories.map(
                      (
                        category,
                      ) => (
                        <label
                          key={
                            category.id
                          }
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground transition hover:bg-page-muted"
                        >

                          <input
                            type="checkbox"
                            value={
                              category.id
                            }
                            {...register(
                              "categoryIds",
                            )}
                            className="size-4 shrink-0 accent-brand"
                          />


                          <span>
                            {
                              category.name
                            }
                          </span>

                        </label>
                      ),
                    )}

                  </div>

                </section>

              ) : null}

            </div>
          )}


          {errors.categoryIds && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600"
            >
              {
                errors
                  .categoryIds
                  .message
              }
            </p>
          )}

        </fieldset>


        {/* =================================================
            TAGS
        ================================================= */}

        <fieldset className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

          <legend className="px-2 font-serif text-xl font-semibold text-foreground">
            Etiquetas
          </legend>


          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Añade etiquetas para describir
            características adicionales de
            la receta.
          </p>


          {tags.length ===
          0 ? (

            <p className="mt-4 text-sm text-muted-foreground">
              Todavía no hay etiquetas
              creadas.
            </p>

          ) : (

            <div className="mt-4 flex flex-wrap gap-3">

              {tags.map(
                (
                  tag,
                ) => (
                  <label
                    key={
                      tag.id
                    }
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm transition hover:bg-page-muted"
                  >

                    <input
                      type="checkbox"
                      value={
                        tag.id
                      }
                      {...register(
                        "tagIds",
                      )}
                      className="size-4 accent-brand"
                    />


                    <span>
                      {
                        tag.name
                      }
                    </span>

                  </label>
                ),
              )}

            </div>
          )}

        </fieldset>


        {/* =================================================
            FEATURED
        ================================================= */}

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-5">

          <input
            type="checkbox"
            {...register(
              "featured",
            )}
            className="mt-1 size-4 shrink-0 accent-brand"
          />


          <span>

            <span className="block font-semibold text-foreground">
              Marcar como receta destacada
            </span>


            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              Las recetas destacadas pueden
              recibir mayor visibilidad en
              las zonas principales de
              CociHub.
            </span>

          </span>

        </label>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <p
            role="status"
            className="rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href={
              previousStepHref
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Anterior

          </Link>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar"
                : "Continuar"}


            {!isSubmitting && (
              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />
            )}

          </button>

        </div>

      </form>

    </section>
  );
}