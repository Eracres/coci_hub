"use client";

import {
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  recipeClassificationSchema,
  type RecipeClassificationFormData,
} from "@/schemas/recipe-classification-schema";

import {
  updateRecipeClassificationAction,
} from "@/app/admin/recipes/[id]/edit/actions";

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


const CATEGORY_SECTIONS: CategorySection[] =
  [
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
}: RecipeClassificationFormProps) {
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


    const result =
      await updateRecipeClassificationAction(
        recipeId,
        values,
      );


    setMessage(
      result.message ??
        null,
    );
  }


  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Clasificación
        </h2>

        <p className="mt-1 text-sm">
          Organiza la receta para
          facilitar su búsqueda y
          navegación.
        </p>
      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-6 space-y-8"
      >
        {/* TYPE */}

        <div>
          <label
            htmlFor="recipeTypeId"
            className="mb-2 block font-medium"
          >
            Tipo de receta
          </label>

          <select
            id="recipeTypeId"
            {...register(
              "recipeTypeId",
            )}
            className="w-full rounded-lg border px-4 py-3"
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
            <p className="mt-2 text-sm">
              {
                errors
                  .recipeTypeId
                  .message
              }
            </p>
          )}
        </div>


        {/* DIFFICULTY */}

        <div>
          <label
            htmlFor="difficulty"
            className="mb-2 block font-medium"
          >
            Dificultad
          </label>

          <select
            id="difficulty"
            {...register(
              "difficulty",
            )}
            className="w-full rounded-lg border px-4 py-3"
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
        </div>


        {/* CATEGORIES */}

        <fieldset
          id="publication-category"
          className="rounded-xl"
        >
          <legend className="font-medium">
            Categorías
          </legend>

          <p className="mt-1 text-sm text-muted-foreground">
            Puedes seleccionar varias
            categorías. Los grupos
            sirven únicamente para
            organizarlas visualmente.
          </p>


          {categories.length ===
          0 ? (
            <p className="mt-3 text-sm">
              Todavía no hay
              categorías creadas.
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
                      className="rounded-xl border border-border bg-page-muted/30 p-4 sm:p-5"
                    >
                      <header>
                        <h3 className="font-semibold">
                          {
                            section.title
                          }
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
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
                                className="rounded-lg border border-border bg-surface p-4"
                              >
                                <h4 className="text-sm font-semibold">
                                  {
                                    subgroup.title
                                  }
                                </h4>

                                {subgroup.description ? (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {
                                      subgroup.description
                                    }
                                  </p>
                                ) : null}


                                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {subgroupCategories.map(
                                    (
                                      category,
                                    ) => (
                                      <label
                                        key={
                                          category.id
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm transition hover:border-border hover:bg-page-muted"
                                      >
                                        <input
                                          type="checkbox"
                                          value={
                                            category.id
                                          }
                                          {...register(
                                            "categoryIds",
                                          )}
                                          className="size-4 accent-brand"
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
                <section className="rounded-xl border border-dashed border-border bg-page-muted/20 p-4 sm:p-5">
                  <header>
                    <h3 className="font-semibold">
                      Otras categorías
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Categorías todavía
                      no asignadas a un
                      grupo visual.
                    </p>
                  </header>


                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {uncategorizedCategories.map(
                      (
                        category,
                      ) => (
                        <label
                          key={
                            category.id
                          }
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition hover:bg-page-muted"
                        >
                          <input
                            type="checkbox"
                            value={
                              category.id
                            }
                            {...register(
                              "categoryIds",
                            )}
                            className="size-4 accent-brand"
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
        </fieldset>


        {/* TAGS */}

        <fieldset>
          <legend className="font-medium">
            Etiquetas
          </legend>

          {tags.length ===
          0 ? (
            <p className="mt-3 text-sm">
              Todavía no hay
              etiquetas creadas.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-3">
              {tags.map(
                (
                  tag,
                ) => (
                  <label
                    key={
                      tag.id
                    }
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      value={
                        tag.id
                      }
                      {...register(
                        "tagIds",
                      )}
                    />

                    {
                      tag.name
                    }
                  </label>
                ),
              )}
            </div>
          )}
        </fieldset>


        {/* FEATURED */}

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register(
              "featured",
            )}
          />

          <span>
            Marcar como receta
            destacada
          </span>
        </label>


        {/* ACTION */}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !isDirty
            }
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : "Guardar clasificación"}
          </button>

          {message && (
            <p
              role="status"
              className="text-sm"
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}