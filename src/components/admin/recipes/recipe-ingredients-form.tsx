"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Utensils,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeIngredientsAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeIngredientSchema,
  recipeIngredientsSchema,
  type RecipeIngredientFormData,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";


type RecipeIngredientsFormProps = {
  recipeId:
    string;

  initialGroups:
    RecipeIngredientsFormData["groups"];
};


type EditableIngredient =
  RecipeIngredientFormData & {
    clientId:
      string;
  };


type EditableGroup = {
  clientId:
    string;

  name:
    string;

  ingredients:
    EditableIngredient[];
};


type IngredientGroupEditorProps = {
  group:
    EditableGroup;

  groupIndex:
    number;

  groupCount:
    number;

  onChangeName:
    (
      groupIndex: number,
      name: string,
    ) => void;

  onRemoveGroup:
    (
      groupIndex: number,
    ) => void;

  onMoveGroup:
    (
      from: number,
      to: number,
    ) => void;

  onAddIngredient:
    (
      groupIndex: number,
      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onUpdateIngredient:
    (
      groupIndex: number,
      ingredientIndex: number,
      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onRemoveIngredient:
    (
      groupIndex: number,
      ingredientIndex: number,
    ) => void;

  onMoveIngredient:
    (
      groupIndex: number,
      from: number,
      to: number,
    ) => void;
};


const emptyIngredient:
RecipeIngredientFormData = {
  name:
    "",

  quantity:
    "",

  unit:
    "",

  notes:
    "",

  scalable:
    true,
};


function createClientId(
  prefix:
    string,
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function createEditableGroups(
  groups:
    RecipeIngredientsFormData["groups"],
): EditableGroup[] {
  return groups.map(
    (
      group,
    ) => ({
      clientId:
        createClientId(
          "group",
        ),

      name:
        group.name,

      ingredients:
        group.ingredients.map(
          (
            ingredient,
          ) => ({
            clientId:
              createClientId(
                "ingredient",
              ),

            ...ingredient,
          }),
        ),
    }),
  );
}


function IngredientGroupEditor({
  group,
  groupIndex,
  groupCount,
  onChangeName,
  onRemoveGroup,
  onMoveGroup,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
  onMoveIngredient,
}: IngredientGroupEditorProps) {
  const [
    ingredientDraft,
    setIngredientDraft,
  ] =
    useState<RecipeIngredientFormData>({
      ...emptyIngredient,
    });


  const [
    editingIndex,
    setEditingIndex,
  ] =
    useState<number | null>(
      null,
    );


  const [
    editorError,
    setEditorError,
  ] =
    useState<string | null>(
      null,
    );


  function clearIngredientEditor() {
    setIngredientDraft({
      ...emptyIngredient,
    });


    setEditingIndex(
      null,
    );


    setEditorError(
      null,
    );
  }


  function saveIngredient() {
    const validation =
      recipeIngredientSchema.safeParse(
        ingredientDraft,
      );


    if (
      !validation.success
    ) {
      setEditorError(
        validation.error
          .issues[0]
          ?.message ??
          "El ingrediente no es válido.",
      );

      return;
    }


    if (
      editingIndex ===
      null
    ) {
      onAddIngredient(
        groupIndex,
        validation.data,
      );
    } else {
      onUpdateIngredient(
        groupIndex,
        editingIndex,
        validation.data,
      );
    }


    clearIngredientEditor();
  }


  function editIngredient(
    ingredientIndex:
      number,
  ) {
    const ingredient =
      group.ingredients[
        ingredientIndex
      ];


    if (
      !ingredient
    ) {
      return;
    }


    setIngredientDraft({
      name:
        ingredient.name,

      quantity:
        ingredient.quantity,

      unit:
        ingredient.unit,

      notes:
        ingredient.notes,

      scalable:
        ingredient.scalable,
    });


    setEditingIndex(
      ingredientIndex,
    );


    setEditorError(
      null,
    );
  }


  function duplicateIngredient(
    ingredientIndex:
      number,
  ) {
    const ingredient =
      group.ingredients[
        ingredientIndex
      ];


    if (
      !ingredient
    ) {
      return;
    }


    setIngredientDraft({
      name:
        ingredient.name,

      quantity:
        ingredient.quantity,

      unit:
        ingredient.unit,

      notes:
        ingredient.notes,

      scalable:
        ingredient.scalable,
    });


    setEditingIndex(
      null,
    );


    setEditorError(
      null,
    );
  }


  return (
    <article className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

      {/* =================================================
          GROUP HEADER
      ================================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div className="min-w-0 flex-1">

          <label
            htmlFor={`group-${group.clientId}-name`}
            className="text-sm font-semibold text-foreground"
          >
            Nombre del grupo
          </label>


          <input
            id={`group-${group.clientId}-name`}
            type="text"
            maxLength={
              100
            }
            value={
              group.name
            }
            onChange={(
              event,
            ) =>
              onChangeName(
                groupIndex,
                event.target.value,
              )
            }
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="Ej. Ingredientes principales"
          />

        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            disabled={
              groupIndex ===
              0
            }
            onClick={
              () =>
                onMoveGroup(
                  groupIndex,
                  groupIndex - 1,
                )
            }
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover grupo hacia arriba"
          >

            <ArrowUp
              className="size-4"
              aria-hidden="true"
            />

          </button>


          <button
            type="button"
            disabled={
              groupIndex ===
              groupCount - 1
            }
            onClick={
              () =>
                onMoveGroup(
                  groupIndex,
                  groupIndex + 1,
                )
            }
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover grupo hacia abajo"
          >

            <ArrowDown
              className="size-4"
              aria-hidden="true"
            />

          </button>


          <button
            type="button"
            onClick={
              () =>
                onRemoveGroup(
                  groupIndex,
                )
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-surface px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >

            <Trash2
              className="size-4"
              aria-hidden="true"
            />

            Eliminar grupo

          </button>

        </div>

      </div>


      {/* =================================================
          INGREDIENT LIST
      ================================================= */}

      <div className="mt-6 space-y-3">

        {group.ingredients.length ===
        0 ? (

          <div className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
            Este grupo todavía no tiene ingredientes.
          </div>

        ) : (

          group.ingredients.map(
            (
              ingredient,
              ingredientIndex,
            ) => (
              <div
                key={
                  ingredient.clientId
                }
                className="rounded-xl border border-border bg-surface p-4"
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="min-w-0">

                    <p className="font-semibold text-foreground">

                      {ingredient.quantity &&
                        `${ingredient.quantity} `}

                      {ingredient.unit &&
                        `${ingredient.unit} `}

                      {
                        ingredient.name
                      }

                    </p>


                    {ingredient.notes && (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {
                          ingredient.notes
                        }
                      </p>
                    )}


                    <p className="mt-2 text-xs text-muted-foreground">

                      {ingredient.scalable
                        ? "La cantidad se adapta al número de comensales."
                        : "La cantidad no se recalcula."}

                    </p>

                  </div>


                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        ingredientIndex ===
                        0
                      }
                      onClick={
                        () =>
                          onMoveIngredient(
                            groupIndex,
                            ingredientIndex,
                            ingredientIndex -
                              1,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover ingrediente hacia arriba"
                    >

                      <ArrowUp
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      disabled={
                        ingredientIndex ===
                        group.ingredients.length -
                          1
                      }
                      onClick={
                        () =>
                          onMoveIngredient(
                            groupIndex,
                            ingredientIndex,
                            ingredientIndex +
                              1,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover ingrediente hacia abajo"
                    >

                      <ArrowDown
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          editIngredient(
                            ingredientIndex,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted"
                      aria-label="Editar ingrediente"
                    >

                      <Pencil
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          duplicateIngredient(
                            ingredientIndex,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted"
                      aria-label="Duplicar ingrediente"
                    >

                      <Copy
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          onRemoveIngredient(
                            groupIndex,
                            ingredientIndex,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                      aria-label="Eliminar ingrediente"
                    >

                      <Trash2
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>

                  </div>

                </div>

              </div>
            ),
          )
        )}

      </div>


      {/* =================================================
          INGREDIENT EDITOR
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-border bg-surface p-5">

        <div className="flex items-center gap-3">

          <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">

            <Plus
              className="size-4"
              aria-hidden="true"
            />

          </span>


          <div>

            <h4 className="font-semibold text-foreground">

              {editingIndex ===
              null
                ? "Añadir ingrediente"
                : "Editar ingrediente"}

            </h4>


            <p className="mt-0.5 text-xs text-muted-foreground">
              El nombre se utilizará también para analizar posibles alérgenos.
            </p>

          </div>

        </div>


        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {/* QUANTITY */}

          <div>

            <label
              htmlFor={`ingredient-${group.clientId}-quantity`}
              className="text-sm font-semibold text-foreground"
            >
              Cantidad
            </label>


            <input
              id={`ingredient-${group.clientId}-quantity`}
              type="text"
              inputMode="decimal"
              value={
                ingredientDraft.quantity
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    quantity:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. 250"
            />

          </div>


          {/* UNIT */}

          <div>

            <label
              htmlFor={`ingredient-${group.clientId}-unit`}
              className="text-sm font-semibold text-foreground"
            >
              Unidad
            </label>


            <input
              id={`ingredient-${group.clientId}-unit`}
              type="text"
              maxLength={
                40
              }
              value={
                ingredientDraft.unit
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    unit:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="g, ml, cucharadas..."
            />

          </div>


          {/* NAME */}

          <div className="md:col-span-2">

            <label
              htmlFor={`ingredient-${group.clientId}-name`}
              className="text-sm font-semibold text-foreground"
            >
              Ingrediente
            </label>


            <input
              id={`ingredient-${group.clientId}-name`}
              type="text"
              maxLength={
                120
              }
              value={
                ingredientDraft.name
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    name:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. Salsa de soja"
            />


            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Utiliza un nombre claro y reconocible.
              CociHub intentará relacionarlo con su
              catálogo alimentario.
            </p>

          </div>


          {/* NOTES */}

          <div className="md:col-span-2">

            <label
              htmlFor={`ingredient-${group.clientId}-notes`}
              className="text-sm font-semibold text-foreground"
            >
              Notas
            </label>


            <input
              id={`ingredient-${group.clientId}-notes`}
              type="text"
              maxLength={
                250
              }
              value={
                ingredientDraft.notes
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    notes:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. cortado en tiras finas, al gusto..."
            />

          </div>

        </div>


        {/* SCALABLE */}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-page-muted/30 p-4">

          <input
            type="checkbox"
            checked={
              ingredientDraft.scalable
            }
            onChange={(
              event,
            ) =>
              setIngredientDraft(
                (
                  current,
                ) => ({
                  ...current,

                  scalable:
                    event.target.checked,
                }),
              )
            }
            className="mt-0.5 size-4 accent-brand"
          />


          <span>

            <span className="block text-sm font-semibold text-foreground">
              Adaptar cantidad al número de comensales
            </span>


            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Desactívalo para ingredientes cuya
              cantidad deba permanecer fija.
            </span>

          </span>

        </label>


        {/* LOCAL ERROR */}

        {editorError && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              editorError
            }
          </p>
        )}


        {/* EDITOR ACTIONS */}

        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveIngredient
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
          >

            <Plus
              className="size-4"
              aria-hidden="true"
            />


            {editingIndex ===
            null
              ? "Añadir ingrediente"
              : "Guardar cambios"}

          </button>


          {editingIndex !==
            null && (

            <button
              type="button"
              onClick={
                clearIngredientEditor
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold transition hover:bg-page-muted"
            >
              Cancelar edición
            </button>

          )}

        </div>

      </div>

    </article>
  );
}


export function RecipeIngredientsForm({
  recipeId,
  initialGroups,
}: RecipeIngredientsFormProps) {
  const router =
    useRouter();


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=classification`;


  const nextStepHref =
    `/admin/recipes/${recipeId}/edit?step=steps`;


  const [
    groups,
    setGroups,
  ] =
    useState<EditableGroup[]>(
      () =>
        createEditableGroups(
          initialGroups,
        ),
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const [
    isDirty,
    setIsDirty,
  ] =
    useState(
      false,
    );


  function markDirty() {
    setIsDirty(
      true,
    );


    setMessage(
      null,
    );


    setValidationError(
      null,
    );
  }


  function addGroup() {
    setGroups(
      (
        current,
      ) => [
        ...current,

        {
          clientId:
            createClientId(
              "group",
            ),

          name:
            current.length ===
            0
              ? "Ingredientes principales"
              : `Grupo ${current.length + 1}`,

          ingredients:
            [],
        },
      ],
    );


    markDirty();
  }


  function changeGroupName(
    groupIndex:
      number,

    name:
      string,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) =>
            index ===
            groupIndex
              ? {
                  ...group,
                  name,
                }
              : group,
        ),
    );


    markDirty();
  }


  function removeGroup(
    groupIndex:
      number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.filter(
          (
            _group,
            index,
          ) =>
            index !==
            groupIndex,
        ),
    );


    markDirty();
  }


  function moveGroup(
    from:
      number,

    to:
      number,
  ) {
    if (
      to < 0 ||
      to >=
        groups.length
    ) {
      return;
    }


    setGroups(
      (
        current,
      ) => {
        const copy = [
          ...current,
        ];


        const [
          moved,
        ] =
          copy.splice(
            from,
            1,
          );


        if (
          !moved
        ) {
          return current;
        }


        copy.splice(
          to,
          0,
          moved,
        );


        return copy;
      },
    );


    markDirty();
  }


  function addIngredient(
    groupIndex:
      number,

    ingredient:
      RecipeIngredientFormData,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) =>
            index ===
            groupIndex
              ? {
                  ...group,

                  ingredients: [
                    ...group.ingredients,

                    {
                      clientId:
                        createClientId(
                          "ingredient",
                        ),

                      ...ingredient,
                    },
                  ],
                }
              : group,
        ),
    );


    markDirty();
  }


  function updateIngredient(
    groupIndex:
      number,

    ingredientIndex:
      number,

    ingredient:
      RecipeIngredientFormData,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            return {
              ...group,

              ingredients:
                group.ingredients.map(
                  (
                    currentIngredient,
                    currentIndex,
                  ) =>
                    currentIndex ===
                    ingredientIndex
                      ? {
                          clientId:
                            currentIngredient.clientId,

                          ...ingredient,
                        }
                      : currentIngredient,
                ),
            };
          },
        ),
    );


    markDirty();
  }


  function removeIngredient(
    groupIndex:
      number,

    ingredientIndex:
      number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            return {
              ...group,

              ingredients:
                group.ingredients.filter(
                  (
                    _ingredient,
                    currentIndex,
                  ) =>
                    currentIndex !==
                    ingredientIndex,
                ),
            };
          },
        ),
    );


    markDirty();
  }


  function moveIngredient(
    groupIndex:
      number,

    from:
      number,

    to:
      number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            if (
              to < 0 ||
              to >=
                group.ingredients.length
            ) {
              return group;
            }


            const ingredients = [
              ...group.ingredients,
            ];


            const [
              moved,
            ] =
              ingredients.splice(
                from,
                1,
              );


            if (
              !moved
            ) {
              return group;
            }


            ingredients.splice(
              to,
              0,
              moved,
            );


            return {
              ...group,
              ingredients,
            };
          },
        ),
    );


    markDirty();
  }


  function buildPayload():
  RecipeIngredientsFormData {
    return {
      groups:
        groups.map(
          (
            group,
          ) => ({
            name:
              group.name,

            ingredients:
              group.ingredients.map(
                (
                  ingredient,
                ) => ({
                  name:
                    ingredient.name,

                  quantity:
                    ingredient.quantity,

                  unit:
                    ingredient.unit,

                  notes:
                    ingredient.notes,

                  scalable:
                    ingredient.scalable,
                }),
              ),
          }),
        ),
    };
  }


  function getIngredientCount(
    payload:
      RecipeIngredientsFormData,
  ) {
    return payload.groups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.ingredients.length,
      0,
    );
  }


  async function handleContinue() {
    setMessage(
      null,
    );


    setValidationError(
      null,
    );


    const payload =
      buildPayload();


    const validation =
      recipeIngredientsSchema.safeParse(
        payload,
      );


    if (
      !validation.success
    ) {
      setValidationError(
        validation.error
          .issues[0]
          ?.message ??
          "Hay datos de ingredientes que no son válidos.",
      );

      return;
    }


    if (
      getIngredientCount(
        validation.data,
      ) ===
      0
    ) {
      setValidationError(
        "Añade al menos un ingrediente para continuar.",
      );

      return;
    }


    /*
     * Si no existe ningún cambio pendiente,
     * simplemente avanzamos.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeIngredientsAction(
          recipeId,
          validation.data,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
          "No se pudieron guardar los ingredientes.",
        );

        return;
      }


      /*
       * En este punto replace_recipe_ingredients
       * ya ha sincronizado automáticamente los
       * alérgenos conocidos de la receta.
       */
      setIsDirty(
        false,
      );


      router.refresh();


      router.push(
        nextStepHref,
      );

    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-start justify-between gap-5">

        <div className="flex items-start gap-4">

          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

            <Utensils
              className="size-5"
              aria-hidden="true"
            />

          </span>


          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Paso 4 de 10
            </p>


            <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
              Ingredientes
            </h2>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Organiza los ingredientes por
              grupos y define qué cantidades
              deben adaptarse al número de
              comensales.
            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={
            addGroup
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition hover:bg-page-muted"
        >

          <Plus
            className="size-4 text-brand"
            aria-hidden="true"
          />

          Añadir grupo

        </button>

      </div>


      {/* =================================================
          ALLERGEN ENGINE
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-brand/20 bg-brand/5 p-5">

        <div className="flex items-start gap-4">

          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

            <ShieldCheck
              className="size-5"
              aria-hidden="true"
            />

          </span>


          <div>

            <h3 className="font-semibold text-foreground">
              Detección automática de alérgenos
            </h3>


            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Al guardar los ingredientes,
              CociHub intentará reconocer cada
              alimento en su catálogo y
              actualizará automáticamente los
              alérgenos conocidos de la receta.
            </p>


            <p className="mt-2 text-sm font-medium leading-6 text-foreground">
              Un ingrediente que CociHub no
              reconozca no se considerará libre
              de alérgenos.
            </p>


            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Más adelante, en el apartado
              «Alérgenos», podrás revisar la
              detección y añadir información
              manual como posibles trazas.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          GROUPS
      ================================================= */}

      <div className="mt-7 space-y-6">

        {groups.length ===
        0 ? (

          <div className="rounded-2xl border border-dashed border-border bg-page-muted/20 px-6 py-10 text-center">

            <Utensils
              className="mx-auto size-7 text-brand"
              aria-hidden="true"
            />


            <h3 className="mt-4 font-semibold text-foreground">
              Todavía no hay ingredientes
            </h3>


            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Crea un grupo y añade los alimentos
              necesarios para preparar esta receta.
            </p>


            <button
              type="button"
              onClick={
                addGroup
              }
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
            >

              <Plus
                className="size-4"
                aria-hidden="true"
              />

              Crear primer grupo

            </button>

          </div>

        ) : (

          groups.map(
            (
              group,
              groupIndex,
            ) => (
              <IngredientGroupEditor
                key={
                  group.clientId
                }

                group={
                  group
                }

                groupIndex={
                  groupIndex
                }

                groupCount={
                  groups.length
                }

                onChangeName={
                  changeGroupName
                }

                onRemoveGroup={
                  removeGroup
                }

                onMoveGroup={
                  moveGroup
                }

                onAddIngredient={
                  addIngredient
                }

                onUpdateIngredient={
                  updateIngredient
                }

                onRemoveIngredient={
                  removeIngredient
                }

                onMoveIngredient={
                  moveIngredient
                }
              />
            ),
          )
        )}

      </div>


      {/* =================================================
          VALIDATION
      ================================================= */}

      {validationError && (

        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {
            validationError
          }
        </p>

      )}


      {message && (

        <p
          role="status"
          className="mt-6 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          {
            message
          }
        </p>

      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

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
          type="button"
          disabled={
            isSubmitting
          }
          onClick={
            handleContinue
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

    </section>
  );
}