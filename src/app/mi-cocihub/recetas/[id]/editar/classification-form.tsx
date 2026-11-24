"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChefHat,
  ChevronDown,
  CircleCheck,
  Gauge,
  Layers3,
  Lightbulb,
  Loader2,
  Search,
  Tags,
  X,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

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


type MessageState = {
  type:
    "success" |
    "error";

  text:
    string;
} | null;


const DIFFICULTY_OPTIONS: {
  value:
    CommunityRecipeDifficulty;

  label:
    string;

  description:
    string;
}[] = [
  {
    value:
      "easy",

    label:
      "Fácil",

    description:
      "Pocos pasos y técnicas sencillas.",
  },

  {
    value:
      "medium",

    label:
      "Media",

    description:
      "Requiere algo de experiencia o atención.",
  },

  {
    value:
      "hard",

    label:
      "Difícil",

    description:
      "Más técnica, precisión o elaboraciones complejas.",
  },
];


const CATEGORY_MARKERS:
  Record<
    string,
    string
  > = {
  [normalizeRecipeCategoryName(
    "Aves",
  )]:
    "🐔",

  [normalizeRecipeCategoryName(
    "Carnes",
  )]:
    "🥩",

  [normalizeRecipeCategoryName(
    "Cerdo",
  )]:
    "🐖",

  [normalizeRecipeCategoryName(
    "Mariscos",
  )]:
    "🦐",

  [normalizeRecipeCategoryName(
    "Pescados",
  )]:
    "🐟",

  [normalizeRecipeCategoryName(
    "Arroces",
  )]:
    "🍚",

  [normalizeRecipeCategoryName(
    "Pasta",
  )]:
    "🍝",

  [normalizeRecipeCategoryName(
    "Legumbres",
  )]:
    "🫘",

  [normalizeRecipeCategoryName(
    "Patatas",
  )]:
    "🥔",

  [normalizeRecipeCategoryName(
    "Setas y hongos",
  )]:
    "🍄",

  [normalizeRecipeCategoryName(
    "Verduras y hortalizas",
  )]:
    "🥕",

  [normalizeRecipeCategoryName(
    "Frutas",
  )]:
    "🍎",

  [normalizeRecipeCategoryName(
    "Frutos secos",
  )]:
    "🥜",

  [normalizeRecipeCategoryName(
    "Huevos",
  )]:
    "🥚",

  [normalizeRecipeCategoryName(
    "Quesos y lácteos",
  )]:
    "🧀",

  [normalizeRecipeCategoryName(
    "Croquetas y frituras",
  )]:
    "🔥",

  [normalizeRecipeCategoryName(
    "Ensaladas",
  )]:
    "🥗",

  [normalizeRecipeCategoryName(
    "Guisos y estofados",
  )]:
    "🍲",

  [normalizeRecipeCategoryName(
    "Platos de cuchara",
  )]:
    "🥣",

  [normalizeRecipeCategoryName(
    "Salsas",
  )]:
    "🫙",

  [normalizeRecipeCategoryName(
    "Sopas y cremas",
  )]:
    "🍜",

  [normalizeRecipeCategoryName(
    "Bocadillos y sándwiches",
  )]:
    "🥪",

  [normalizeRecipeCategoryName(
    "Empanadas",
  )]:
    "🥟",

  [normalizeRecipeCategoryName(
    "Panes y masas",
  )]:
    "🥖",

  [normalizeRecipeCategoryName(
    "Pizzas",
  )]:
    "🍕",

  [normalizeRecipeCategoryName(
    "Galletas y dulces",
  )]:
    "🍪",

  [normalizeRecipeCategoryName(
    "Helados y postres fríos",
  )]:
    "🍨",

  [normalizeRecipeCategoryName(
    "Tartas y pasteles",
  )]:
    "🍰",

  [normalizeRecipeCategoryName(
    "Bebidas",
  )]:
    "🥤",

  [normalizeRecipeCategoryName(
    "Conservas y encurtidos",
  )]:
    "🫙",

  [normalizeRecipeCategoryName(
    "Cocina española",
  )]:
    "🇪🇸",

  [normalizeRecipeCategoryName(
    "Cocina francesa",
  )]:
    "🇫🇷",

  [normalizeRecipeCategoryName(
    "Cocina italiana",
  )]:
    "🇮🇹",

  [normalizeRecipeCategoryName(
    "Cocina mexicana",
  )]:
    "🇲🇽",

  [normalizeRecipeCategoryName(
    "Cocina colombiana",
  )]:
    "🇨🇴",

  [normalizeRecipeCategoryName(
    "Cocina venezolana",
  )]:
    "🇻🇪",

  [normalizeRecipeCategoryName(
    "Cocina ecuatoriana",
  )]:
    "🇪🇨",

  [normalizeRecipeCategoryName(
    "Cocina peruana",
  )]:
    "🇵🇪",

  [normalizeRecipeCategoryName(
    "Cocina china",
  )]:
    "🇨🇳",

  [normalizeRecipeCategoryName(
    "Cocina japonesa",
  )]:
    "🇯🇵",

  [normalizeRecipeCategoryName(
    "Cocina india",
  )]:
    "🇮🇳",

  [normalizeRecipeCategoryName(
    "Cocina tradicional",
  )]:
    "📖",
};


function getCategoryMarker(
  categoryName:
    string,
) {
  return (
    CATEGORY_MARKERS[
      normalizeRecipeCategoryName(
        categoryName,
      )
    ] ??
    "🏷️"
  );
}


function getInitialCategorySection(
  categories:
    CategoryOption[],

  selectedCategoryIds:
    string[],
) {
  for (
    const section
    of RECIPE_CATEGORY_SECTIONS
  ) {
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
      sectionCategories.some(
        (
          category,
        ) =>
          selectedCategoryIds.includes(
            category.id,
          ),
      )
    ) {
      return section.title;
    }
  }


  return (
    RECIPE_CATEGORY_SECTIONS[0]
      ?.title ??
    null
  );
}


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
      MessageState
    >(
      null,
    );


  const [
    openCategorySection,
    setOpenCategorySection,
  ] =
    useState<
      string | null
    >(
      () =>
        getInitialCategorySection(
          categories,
          initialValues.categoryIds,
        ),
    );


  const [
    otherCategoriesOpen,
    setOtherCategoriesOpen,
  ] =
    useState(
      false,
    );


  const [
    tagSearch,
    setTagSearch,
  ] =
    useState(
      "",
    );


  const {
    register,
    handleSubmit,
    setValue,
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


  const selectedRecipeTypeId =
    watch(
      "recipeTypeId",
    ) ??
    "";


  const selectedDifficulty =
    watch(
      "difficulty",
    ) ??
    "";


  const selectedCategoryIds =
    watch(
      "categoryIds",
    ) ??
    [];


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


  const selectedCategories =
    categories.filter(
      (
        category,
      ) =>
        selectedCategoryIds.includes(
          category.id,
        ),
    );


  const filteredTags =
    useMemo(
      () => {
        const normalizedSearch =
          tagSearch
            .trim()
            .toLocaleLowerCase(
              "es",
            );


        if (
          !normalizedSearch
        ) {
          return tags;
        }


        return tags.filter(
          (
            tag,
          ) =>
            tag.name
              .toLocaleLowerCase(
                "es",
              )
              .includes(
                normalizedSearch,
              ),
        );
      },
      [
        tagSearch,
        tags,
      ],
    );


  // =======================================================
  // CATEGORY HELPERS
  // =======================================================

  function removeCategory(
    categoryId:
      string,
  ) {
    setValue(
      "categoryIds",
      selectedCategoryIds.filter(
        (
          selectedId,
        ) =>
          selectedId !==
          categoryId,
      ),
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );


    setMessage(
      null,
    );
  }


  function getSectionSelectedCount(
    categoryNames:
      string[],
  ) {
    const sectionCategories =
      getRecipeCategoriesByNames(
        categories,
        categoryNames,
      );


    return sectionCategories.filter(
      (
        category,
      ) =>
        selectedCategoryIds.includes(
          category.id,
        ),
    ).length;
  }


  // =======================================================
  // SAVE
  // =======================================================

  async function saveValues(
    values:
      CommunityRecipeClassificationFormData,

    continueAfterSave:
      boolean,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    let hasRequiredError =
      false;


    if (
      !values.recipeTypeId
    ) {
      setError(
        "recipeTypeId",
        {
          type:
            "manual",

          message:
            "Selecciona un tipo de receta.",
        },
      );


      hasRequiredError =
        true;
    }


    if (
      !values.difficulty
    ) {
      setError(
        "difficulty",
        {
          type:
            "manual",

          message:
            "Selecciona la dificultad de la receta.",
        },
      );


      hasRequiredError =
        true;
    }


    if (
      values.categoryIds.length ===
      0
    ) {
      setError(
        "categoryIds",
        {
          type:
            "manual",

          message:
            "Selecciona al menos una categoría.",
        },
      );


      hasRequiredError =
        true;
    }


    if (
      hasRequiredError
    ) {
      setMessage({
        type:
          "error",

        text:
          "Completa los campos obligatorios de clasificación.",
      });


      return;
    }


    if (
      !isDirty &&
      continueAfterSave
    ) {
      router.push(
        nextStepHref,
      );


      return;
    }


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


      setMessage({
        type:
          "error",

        text:
          result.message ??
          "No se pudo guardar la clasificación.",
      });


      return;
    }


    reset(
      values,
    );


    if (
      continueAfterSave
    ) {
      router.push(
        nextStepHref,
      );


      return;
    }


    setMessage({
      type:
        "success",

      text:
        result.message ??
        "Clasificación guardada correctamente.",
    });


    router.refresh();
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">
        <header className="border-b border-border px-5 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Tags
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                03 · Clasificación
              </p>


              <h2 className="mt-1 font-serif text-3xl font-bold">
                Ayuda a que la comunidad
                encuentre tu receta
              </h2>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Indica qué tipo de receta es,
                su dificultad y las categorías
                que mejor la describen.
              </p>
            </div>
          </div>
        </header>


        <form
          onSubmit={
            handleSubmit(
              (
                values,
              ) =>
                saveValues(
                  values,
                  true,
                ),
            )
          }
          className="divide-y divide-border"
        >
          {/* ===================================================
              RECIPE TYPE
          =================================================== */}

          <section className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-inverse">
                <ChefHat
                  className="size-4"
                  aria-hidden="true"
                />
              </span>


              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-hover">
                  Tipo de receta
                </h3>


                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Elige la opción principal
                  que mejor encaje con tu receta.
                </p>
              </div>
            </div>


            {recipeTypes.length ===
            0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-border bg-page-muted p-4 text-sm text-muted-foreground">
                Todavía no hay tipos de receta
                disponibles.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recipeTypes.map(
                  (
                    recipeType,
                  ) => {
                    const selected =
                      selectedRecipeTypeId ===
                      recipeType.id;


                    return (
                      <label
                        key={
                          recipeType.id
                        }
                        className={`relative flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition ${
                          selected
                            ? "border-secondary bg-secondary/[0.08] shadow-sm"
                            : "border-border bg-surface hover:border-secondary/40 hover:bg-page-muted/40"
                        }`}
                      >
                        <input
                          type="radio"
                          value={
                            recipeType.id
                          }
                          {...register(
                            "recipeTypeId",
                            {
                              onChange:
                                () => {
                                  setMessage(
                                    null,
                                  );
                                },
                            },
                          )}
                          className="sr-only"
                        />


                        <ChefHat
                          className={`size-6 ${
                            selected
                              ? "text-secondary-hover"
                              : "text-brand"
                          }`}
                          aria-hidden="true"
                        />


                        <span className="text-sm font-bold">
                          {
                            recipeType.name
                          }
                        </span>


                        <span
                          className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-secondary bg-secondary text-inverse"
                              : "border-border bg-surface"
                          }`}
                          aria-hidden="true"
                        >
                          {selected ? (
                            <CircleCheck className="size-4" />
                          ) : null}
                        </span>
                      </label>
                    );
                  },
                )}
              </div>
            )}


            {errors.recipeTypeId ? (
              <p
                role="alert"
                className="mt-3 text-sm text-red-700"
              >
                {
                  errors
                    .recipeTypeId
                    .message
                }
              </p>
            ) : null}
          </section>


          {/* ===================================================
              DIFFICULTY
          =================================================== */}

          <section className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Gauge
                  className="size-4"
                  aria-hidden="true"
                />
              </span>


              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-hover">
                  Dificultad
                </h3>


                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Valora la receta pensando
                  en alguien que vaya a
                  prepararla por primera vez.
                </p>
              </div>
            </div>


            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {DIFFICULTY_OPTIONS.map(
                (
                  option,
                ) => {
                  const selected =
                    selectedDifficulty ===
                    option.value;


                  return (
                    <label
                      key={
                        option.value
                      }
                      className={`relative cursor-pointer rounded-2xl border p-5 transition ${
                        selected
                          ? "border-secondary bg-secondary/[0.08] shadow-sm"
                          : "border-border bg-surface hover:border-secondary/40 hover:bg-page-muted/40"
                      }`}
                    >
                      <input
                        type="radio"
                        value={
                          option.value
                        }
                        {...register(
                          "difficulty",
                          {
                            onChange:
                              () => {
                                setMessage(
                                  null,
                                );
                              },
                          },
                        )}
                        className="sr-only"
                      />


                      <div className="flex items-start gap-3">
                        <Gauge
                          className={`mt-0.5 size-6 shrink-0 ${
                            option.value ===
                            "easy"
                              ? "text-secondary-hover"
                              : option.value ===
                                  "medium"
                                ? "text-warning"
                                : "text-brand"
                          }`}
                          aria-hidden="true"
                        />


                        <div>
                          <p className="font-serif text-xl font-bold">
                            {
                              option.label
                            }
                          </p>


                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {
                              option.description
                            }
                          </p>
                        </div>
                      </div>


                      <span
                        className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border ${
                          selected
                            ? "border-secondary bg-secondary text-inverse"
                            : "border-border bg-surface"
                        }`}
                        aria-hidden="true"
                      >
                        {selected ? (
                          <CircleCheck className="size-4" />
                        ) : null}
                      </span>
                    </label>
                  );
                },
              )}
            </div>


            {errors.difficulty ? (
              <p
                role="alert"
                className="mt-3 text-sm text-red-700"
              >
                {
                  errors
                    .difficulty
                    .message
                }
              </p>
            ) : null}
          </section>


          {/* ===================================================
              CATEGORIES
          =================================================== */}

          <section className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Layers3
                    className="size-4"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-hover">
                    Categorías
                  </h3>


                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Selecciona una o varias
                    categorías que realmente
                    describan tu receta.
                  </p>
                </div>
              </div>


              <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary-hover">
                {
                  selectedCategoryIds.length
                }{" "}
                {
                  selectedCategoryIds.length ===
                  1
                    ? "seleccionada"
                    : "seleccionadas"
                }
              </span>
            </div>


            {/* =================================================
                SELECTED CATEGORIES
            ================================================= */}

            {selectedCategories.length >
            0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedCategories.map(
                  (
                    category,
                  ) => (
                    <span
                      key={
                        category.id
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.07] px-3 py-1.5 text-xs font-semibold text-foreground"
                    >
                      <span
                        className="text-base leading-none"
                        aria-hidden="true"
                      >
                        {
                          getCategoryMarker(
                            category.name,
                          )
                        }
                      </span>


                      {
                        category.name
                      }


                      <button
                        type="button"
                        onClick={
                          () =>
                            removeCategory(
                              category.id,
                            )
                        }
                        aria-label={`Quitar ${category.name}`}
                        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-brand/10 hover:text-brand"
                      >
                        <X
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </button>
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-border bg-page-muted/40 px-4 py-3 text-xs leading-5 text-muted-foreground">
                Todavía no has seleccionado
                ninguna categoría.
              </p>
            )}


            {errors.categoryIds ? (
              <p
                role="alert"
                className="mt-3 text-sm text-red-700"
              >
                {
                  errors
                    .categoryIds
                    .message
                }
              </p>
            ) : null}


            {/* =================================================
                CATEGORY ACCORDIONS
            ================================================= */}

            {categories.length ===
            0 ? (
              <p className="mt-5 text-sm text-muted-foreground">
                Todavía no hay categorías
                disponibles.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
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


                    const isOpen =
                      openCategorySection ===
                      section.title;


                    const sectionSelectedCount =
                      getSectionSelectedCount(
                        section.subgroups.flatMap(
                          (
                            subgroup,
                          ) =>
                            subgroup.categoryNames,
                        ),
                      );


                    return (
                      <section
                        key={
                          section.title
                        }
                        className={`overflow-hidden rounded-2xl border transition ${
                          isOpen
                            ? "border-secondary/35 bg-page-muted/20"
                            : "border-border bg-surface"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={
                            () =>
                              setOpenCategorySection(
                                isOpen
                                  ? null
                                  : section.title,
                              )
                          }
                          className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-page-muted/50 sm:px-5"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary-hover">
                            <Layers3
                              className="size-4"
                              aria-hidden="true"
                            />
                          </span>


                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold">
                              {
                                section.title
                              }
                            </span>


                            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                              {
                                section.description
                              }
                            </span>
                          </span>


                          {sectionSelectedCount >
                          0 ? (
                            <span className="hidden rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-bold text-secondary-hover sm:inline-flex">
                              {
                                sectionSelectedCount
                              }{" "}
                              seleccionadas
                            </span>
                          ) : null}


                          <ChevronDown
                            className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                              isOpen
                                ? "rotate-180"
                                : ""
                            }`}
                            aria-hidden="true"
                          />
                        </button>


                        {isOpen ? (
                          <div className="border-t border-border px-4 py-5 sm:px-5">
                            <div className="space-y-5">
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
                                    >
                                      <h4 className="text-sm font-bold">
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


                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {subgroupCategories.map(
                                          (
                                            category,
                                          ) => {
                                            const selected =
                                              selectedCategoryIds.includes(
                                                category.id,
                                              );


                                            return (
                                              <label
                                                key={
                                                  category.id
                                                }
                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                                  selected
                                                    ? "border-secondary bg-secondary/[0.09] font-semibold text-secondary-hover"
                                                    : "border-border bg-surface hover:border-secondary/35 hover:bg-page-muted"
                                                }`}
                                              >
                                                <input
                                                  type="checkbox"
                                                  value={
                                                    category.id
                                                  }
                                                  {...register(
                                                    "categoryIds",
                                                    {
                                                      onChange:
                                                        () => {
                                                          setMessage(
                                                            null,
                                                          );
                                                        },
                                                    },
                                                  )}
                                                  className="sr-only"
                                                />


                                                <span
                                                  className="text-base leading-none"
                                                  aria-hidden="true"
                                                >
                                                  {
                                                    getCategoryMarker(
                                                      category.name,
                                                    )
                                                  }
                                                </span>


                                                {
                                                  category.name
                                                }


                                                {selected ? (
                                                  <CircleCheck
                                                    className="size-4"
                                                    aria-hidden="true"
                                                  />
                                                ) : null}
                                              </label>
                                            );
                                          },
                                        )}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    );
                  },
                )}


                {/* =============================================
                    OTHER CATEGORIES
                ============================================= */}

                {uncategorizedCategories.length >
                0 ? (
                  <section className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface">
                    <button
                      type="button"
                      onClick={
                        () =>
                          setOtherCategoriesOpen(
                            (
                              current,
                            ) =>
                              !current,
                          )
                      }
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-page-muted/50 sm:px-5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-page-muted text-muted-foreground">
                        <Tags
                          className="size-4"
                          aria-hidden="true"
                        />
                      </span>


                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold">
                          Otras categorías
                        </span>


                        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                          Categorías todavía no
                          integradas en los grupos
                          principales.
                        </span>
                      </span>


                      <ChevronDown
                        className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                          otherCategoriesOpen
                            ? "rotate-180"
                            : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>


                    {otherCategoriesOpen ? (
                      <div className="border-t border-border px-4 py-5 sm:px-5">
                        <div className="flex flex-wrap gap-2">
                          {uncategorizedCategories.map(
                            (
                              category,
                            ) => {
                              const selected =
                                selectedCategoryIds.includes(
                                  category.id,
                                );


                              return (
                                <label
                                  key={
                                    category.id
                                  }
                                  className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                                    selected
                                      ? "border-secondary bg-secondary/[0.09] font-semibold text-secondary-hover"
                                      : "border-border bg-surface hover:border-secondary/35 hover:bg-page-muted"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    value={
                                      category.id
                                    }
                                    {...register(
                                      "categoryIds",
                                      {
                                        onChange:
                                          () => {
                                            setMessage(
                                              null,
                                            );
                                          },
                                      },
                                    )}
                                    className="sr-only"
                                  />


                                  <span
                                    className="text-base leading-none"
                                    aria-hidden="true"
                                  >
                                    {
                                      getCategoryMarker(
                                        category.name,
                                      )
                                    }
                                  </span>


                                  {
                                    category.name
                                  }


                                  {selected ? (
                                    <CircleCheck
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  ) : null}
                                </label>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </div>
            )}
          </section>


          {/* ===================================================
              TAGS
          =================================================== */}

          <section className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Tags
                    className="size-4"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-secondary-hover">
                    Etiquetas
                  </h3>


                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Añaden características
                    secundarias que ayudan a
                    describir mejor la receta.
                  </p>
                </div>
              </div>


              <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary-hover">
                Opcional ·{" "}
                {
                  selectedTagIds.length
                }
                /10
              </span>
            </div>


            {errors.tagIds ? (
              <p
                role="alert"
                className="mt-3 text-sm text-red-700"
              >
                {
                  errors
                    .tagIds
                    .message
                }
              </p>
            ) : null}


            {tags.length ===
            0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-border bg-page-muted px-4 py-3 text-sm text-muted-foreground">
                Todavía no hay etiquetas
                disponibles en CociHub.
              </p>
            ) : (
              <>
                <div className="relative mt-5">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />


                  <input
                    type="search"
                    value={
                      tagSearch
                    }
                    onChange={
                      (
                        event,
                      ) =>
                        setTagSearch(
                          event
                            .target
                            .value,
                        )
                    }
                    placeholder="Buscar una etiqueta..."
                    className="w-full rounded-xl border border-border bg-page py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  />
                </div>


                <div className="mt-4 flex max-h-44 flex-wrap content-start gap-2 overflow-y-auto rounded-2xl border border-border bg-page-muted/20 p-4">
                  {filteredTags.length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground">
                      No encontramos etiquetas
                      con ese nombre.
                    </p>
                  ) : (
                    filteredTags.map(
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
                            className={`inline-flex h-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                              limitReached
                                ? "cursor-not-allowed border-border bg-page-muted text-muted-foreground opacity-50"
                                : selected
                                  ? "cursor-pointer border-secondary bg-secondary/[0.09] font-semibold text-secondary-hover"
                                  : "cursor-pointer border-border bg-surface hover:border-secondary/35 hover:bg-page-muted"
                            }`}
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
                                {
                                  onChange:
                                    () => {
                                      setMessage(
                                        null,
                                      );
                                    },
                                },
                              )}
                              className="sr-only"
                            />


                            {
                              tag.name
                            }


                            {selected ? (
                              <CircleCheck
                                className="size-4"
                                aria-hidden="true"
                              />
                            ) : null}
                          </label>
                        );
                      },
                    )
                  )}
                </div>
              </>
            )}
          </section>


          {/* ===================================================
              MESSAGE
          =================================================== */}

          {message ? (
            <div className="px-5 py-4 sm:px-7">
              <div
                role={
                  message.type ===
                  "error"
                    ? "alert"
                    : "status"
                }
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.type ===
                  "success"
                    ? "border-secondary/30 bg-secondary/[0.07] text-secondary-hover"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {
                  message.text
                }
              </div>
            </div>
          ) : null}


          {/* ===================================================
              FOOTER
          =================================================== */}

          <footer className="flex flex-col gap-3 bg-page-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <Link
              href={
                previousStepHref
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:bg-page-muted"
            >
              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Raciones
            </Link>


            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !isDirty
                }
                onClick={
                  handleSubmit(
                    (
                      values,
                    ) =>
                      saveValues(
                        values,
                        false,
                      ),
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}

                Guardar borrador
              </button>


              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />

                    Guardando...
                  </>
                ) : (
                  <>
                    {isDirty
                      ? "Guardar y continuar"
                      : "Continuar"}

                    <ArrowRight
                      className="size-4"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>


      {/* ===================================================
          HELP
      =================================================== */}

      <aside className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm xl:sticky xl:top-6">
        <div className="border-b border-border px-6 py-6 text-center">
          <Image
            src="/brand/cocihub-mark-outline.png"
            alt=""
            width={72}
            height={72}
            className="mx-auto size-[72px] object-contain"
            aria-hidden="true"
          />


          <h3 className="mt-4 font-serif text-2xl font-bold">
            Ayuda para este paso
          </h3>


          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Consejos para clasificar tu
            receta de forma clara y útil.
          </p>
        </div>


        <div className="space-y-6 p-6">
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              1
            </span>


            <div>
              <p className="text-sm font-bold">
                Elige un tipo principal
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Selecciona la opción que
                mejor defina qué clase de
                receta estás preparando.
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary-hover">
              2
            </span>


            <div>
              <p className="text-sm font-bold">
                Valora la dificultad
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Piensa en alguien que nunca
                haya preparado esta receta:
                ¿le resultaría fácil, media
                o difícil?
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-warning">
              3
            </span>


            <div>
              <p className="text-sm font-bold">
                Selecciona bien las categorías
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Marca solo las que realmente
                describan tu receta. No hace
                falta coleccionarlas todas
                como si fueran Pokémon.
              </p>
            </div>
          </div>


          <div className="border-t border-border pt-5">
            <div className="flex gap-3 rounded-2xl bg-page-muted/60 p-4">
              <Lightbulb
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />


              <p className="text-xs leading-5 text-muted-foreground">
                <span className="font-bold text-foreground">
                  Categorías
                </span>{" "}
                organizan y ayudan a encontrar
                la receta.{" "}
                <span className="font-bold text-foreground">
                  Etiquetas
                </span>{" "}
                añaden características
                secundarias como “picante”,
                “rápida” o “para niños”.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}