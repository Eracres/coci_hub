"use client";

import {
  useState,
} from "react";

import Link from "next/link";

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
  getConfiguredRecipeCategoryNames,
  getRecipeCategoriesByNames,
  normalizeRecipeCategoryName,
  RECIPE_CATEGORY_SECTIONS,
} from "@/config/recipe-category-sections";

import {
  communityRecipeClassificationSchema,
  type CommunityRecipeClassificationFormData,
  type CommunityRecipeDifficulty,
} from "@/schemas/community-recipe-classification-schema";

import type {
  CategoryOption,
  RecipeTypeOption,
  TagOption,
} from "@/services/recipes/recipe-service";

import {
  updateMyRecipeClassificationAction,
} from "./classification-actions";


type ClassificationFormProps = {
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
      CommunityRecipeDifficulty | null;

    categoryIds:
      string[];

    tagIds:
      string[];
  };

  previousStepHref:
    string;

  nextStepHref:
    string;
};


export function ClassificationForm({
  recipeId,
  recipeTypes,
  categories,
  tags,
  initialValues,
  previousStepHref,
  nextStepHref,
}: ClassificationFormProps) {
  const router =
    useRouter();


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<
      CommunityRecipeClassificationFormData
    >({
      resolver:
        zodResolver(
          communityRecipeClassificationSchema,
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
      },
    });


  const selectedTagIds =
    watch(
      "tagIds",
    ) ??
    [];


  const configuredCategoryNames =
    getConfiguredRecipeCategoryNames();


  const uncategorizedCategories =
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


  async function onSubmit(
    values:
      CommunityRecipeClassificationFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    const result =
      await updateMyRecipeClassificationAction(
        recipeId,
        values,
      );


    if (
      !result.success
    ) {
      if (
        result.fieldErrors
      ) {
        Object.entries(
          result.fieldErrors,
        ).forEach(
          ([
            field,
            messages,
          ]) => {
            const fieldMessage =
              messages?.[0];


            if (
              !fieldMessage
            ) {
              return;
            }


            setError(
              field as
                keyof CommunityRecipeClassificationFormData,
              {
                type:
                  "server",

                message:
                  fieldMessage,
              },
            );
          },
        );
      }


      if (
        result.message
      ) {
        setMessage(
          result.message,
        );
      }


      return;
    }


    reset(
      values,
    );


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 3 de 8
        </p>


        <h2 className="mt-2 font-serif text-2xl font-semibold">
          Clasificación
        </h2>


        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Ayuda a organizar tu receta para
          que sea más fácil encontrarla
          dentro de CociHub.
        </p>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-8 space-y-8"
      >

        {/* ===============================================
            TYPE + DIFFICULTY
        =============================================== */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>

            <label
              htmlFor="recipeTypeId"
              className="mb-2 block text-sm font-medium"
            >
              Tipo de receta
            </label>


            <select
              id="recipeTypeId"
              {...register(
                "recipeTypeId",
              )}
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            >
              <option value="">
                Selecciona un tipo
              </option>


              {recipeTypes.map(
                (
                  recipeType,
                ) => (
                  <option
                    key={
                      recipeType.id
                    }
                    value={
                      recipeType.id
                    }
                  >
                    {
                      recipeType.name
                    }
                  </option>
                ),
              )}

            </select>


            {errors.recipeTypeId && (
              <p
                role="alert"
                className="mt-2 text-sm text-red-700"
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
              className="mb-2 block text-sm font-medium"
            >
              Dificultad
            </label>


            <select
              id="difficulty"
              {...register(
                "difficulty",
              )}
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            >
              <option value="">
                Selecciona una dificultad
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
                className="mt-2 text-sm text-red-700"
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


        {/* ===============================================
            CATEGORIES
        =============================================== */}

        <fieldset>

          <legend className="text-base font-semibold">
            Categorías
          </legend>


          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Puedes elegir varias. Están
            agrupadas para que resulte más
            sencillo localizar las que
            describen tu receta.
          </p>


          {errors.categoryIds && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors
                  .categoryIds
                  .message
              }
            </p>
          )}


          {categories.length ===
          0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Todavía no hay categorías
              disponibles.
            </p>
          ) : (
            <div className="mt-5 space-y-6">

              {RECIPE_CATEGORY_SECTIONS.map(
                (
                  section,
                ) => {
                  const sectionCategories =
                    section.subgroups.flatMap(
                      (
                        subgroup,
                      ) =>
                        getRecipeCategoriesByNames(
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

                        <h3 className="font-semibold">
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
                              getRecipeCategoriesByNames(
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

                                <h4 className="text-sm font-semibold">
                                  {
                                    subgroup.title
                                  }
                                </h4>


                                {subgroup.description && (
                                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {
                                      subgroup.description
                                    }
                                  </p>
                                )}


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
              0 && (
                <section className="rounded-2xl border border-dashed border-border bg-page-muted/20 p-4 sm:p-5">

                  <header>

                    <h3 className="font-semibold">
                      Otras categorías
                    </h3>


                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Categorías todavía no
                      asignadas a uno de los
                      grupos visuales.
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
              )}

            </div>
          )}

        </fieldset>


        {/* ===============================================
            TAGS
        =============================================== */}

        <fieldset>

          <div className="flex flex-wrap items-end justify-between gap-2">

            <div>

              <legend className="text-base font-semibold">
                Etiquetas
              </legend>


              <p className="mt-1 text-sm text-muted-foreground">
                Son opcionales y ayudan a
                describir mejor la receta.
              </p>

            </div>


            {tags.length >
            0 && (
              <span className="text-xs text-muted-foreground">
                {
                  selectedTagIds.length
                } / 10
              </span>
            )}

          </div>


          {errors.tagIds && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors
                  .tagIds
                  .message
              }
            </p>
          )}


          {tags.length ===
          0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border bg-page-muted px-4 py-3 text-sm text-muted-foreground">
              Todavía no hay etiquetas
              creadas en CociHub.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">

              {tags.map(
                (
                  tag,
                ) => {
                  const selected =
                    selectedTagIds.includes(
                      tag.id,
                    );


                  const limitReached =
                    selectedTagIds.length >=
                      10 &&
                    !selected;


                  return (
                    <label
                      key={
                        tag.id
                      }
                      className="flex items-center gap-2 rounded-xl border border-border bg-page px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={
                          tag.id
                        }
                        disabled={
                          limitReached
                        }
                        {...register(
                          "tagIds",
                        )}
                        className="size-4 accent-brand disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      {
                        tag.name
                      }
                    </label>
                  );
                },
              )}

            </div>
          )}

        </fieldset>


        {/* ===============================================
            GENERAL ERROR
        =============================================== */}

        {message && (
          <p
            role="alert"
            className="text-sm text-red-700"
          >
            {
              message
            }
          </p>
        )}


        {/* ===============================================
            NAVIGATION
        =============================================== */}

        <div className="flex flex-wrap items-center justify-between gap-4">

          <Link
            href={
              previousStepHref
            }
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
          >
            ← Anterior
          </Link>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar →"
                : "Continuar →"}
          </button>

        </div>

      </form>

    </section>
  );
}