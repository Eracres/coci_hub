"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  Pencil,
  Plus,
  Trash2,
  Utensils,
} from "lucide-react";

import {
  recipeIngredientSchema,
  recipeIngredientsSchema,
  type RecipeIngredientFormData,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";

import {
  updateMyRecipeIngredientsAction,
} from "./ingredients-actions";


type IngredientsFormProps = {
  recipeId:
    string;

  initialGroups:
    RecipeIngredientsFormData["groups"];

  previousStepHref:
    string;

  nextStepHref:
    string;
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
      groupIndex:
        number,

      name:
        string,
    ) => void;

  onRemoveGroup:
    (
      groupIndex:
        number,
    ) => void;

  onMoveGroup:
    (
      from:
        number,

      to:
        number,
    ) => void;

  onAddIngredient:
    (
      groupIndex:
        number,

      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onUpdateIngredient:
    (
      groupIndex:
        number,

      ingredientIndex:
        number,

      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onRemoveIngredient:
    (
      groupIndex:
        number,

      ingredientIndex:
        number,
    ) => void;

  onMoveIngredient:
    (
      groupIndex:
        number,

      from:
        number,

      to:
        number,
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


/* =========================================================
   CLIENT IDS
========================================================= */

function createClientId(
  prefix:
    string,
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(
      36,
    )
    .slice(
      2,
    )}`;
}


/* =========================================================
   INITIAL EDITABLE DATA
========================================================= */

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


/* =========================================================
   INGREDIENT GROUP
========================================================= */

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
    useState<
      RecipeIngredientFormData
    >({
      ...emptyIngredient,
    });


  const [
    editingIndex,
    setEditingIndex,
  ] =
    useState<
      number | null
    >(
      null,
    );


  const [
    editorError,
    setEditorError,
  ] =
    useState<
      string | null
    >(
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


    /*
     * Cargamos una copia en el editor.
     *
     * El ingrediente no se añade hasta que el usuario
     * confirma mediante "Añadir ingrediente".
     */

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
    <article className="rounded-2xl border border-border bg-page-muted/30 p-4 sm:p-5">

      {/* =================================================
          GROUP HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

        <div className="min-w-0 flex-1">

          <label
            htmlFor={`group-${group.clientId}-name`}
            className="mb-2 block text-sm font-semibold"
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
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="Ej. Ingredientes principales"
          />

        </div>


        <div className="flex shrink-0 flex-wrap gap-2 sm:pt-7">

          <button
            type="button"
            disabled={
              groupIndex ===
              0
            }
            onClick={() =>
              onMoveGroup(
                groupIndex,
                groupIndex -
                  1,
              )
            }
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover grupo hacia arriba"
            title="Mover grupo hacia arriba"
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
              groupCount -
                1
            }
            onClick={() =>
              onMoveGroup(
                groupIndex,
                groupIndex +
                  1,
              )
            }
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Mover grupo hacia abajo"
            title="Mover grupo hacia abajo"
          >
            <ArrowDown
              className="size-4"
              aria-hidden="true"
            />
          </button>


          <button
            type="button"
            onClick={() =>
              onRemoveGroup(
                groupIndex,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2
              className="size-4"
              aria-hidden="true"
            />

            Eliminar
          </button>

        </div>

      </div>


      {/* =================================================
          INGREDIENT LIST
      ================================================= */}

      <div className="mt-6 space-y-3">

        {group.ingredients.length ===
        0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-4">

            <p className="text-sm text-muted-foreground">
              Este grupo todavía no tiene ingredientes.
            </p>

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

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0">

                    <p className="font-medium">

                      {ingredient.quantity && (
                        <>
                          {
                            ingredient.quantity
                          }{" "}
                        </>
                      )}

                      {ingredient.unit && (
                        <>
                          {
                            ingredient.unit
                          }{" "}
                        </>
                      )}

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
                        : "La cantidad se mantiene fija al cambiar las raciones."}
                    </p>

                  </div>


                  <div className="flex shrink-0 flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        ingredientIndex ===
                        0
                      }
                      onClick={() =>
                        onMoveIngredient(
                          groupIndex,
                          ingredientIndex,
                          ingredientIndex -
                            1,
                        )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover ingrediente hacia arriba"
                      title="Mover ingrediente hacia arriba"
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
                      onClick={() =>
                        onMoveIngredient(
                          groupIndex,
                          ingredientIndex,
                          ingredientIndex +
                            1,
                        )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover ingrediente hacia abajo"
                      title="Mover ingrediente hacia abajo"
                    >
                      <ArrowDown
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        editIngredient(
                          ingredientIndex,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-page-muted"
                    >
                      <Pencil
                        className="size-4"
                        aria-hidden="true"
                      />

                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        duplicateIngredient(
                          ingredientIndex,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:bg-page-muted"
                    >
                      <Copy
                        className="size-4"
                        aria-hidden="true"
                      />

                      Duplicar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        onRemoveIngredient(
                          groupIndex,
                          ingredientIndex,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2
                        className="size-4"
                        aria-hidden="true"
                      />

                      Eliminar
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

      <div className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-5">

        <div className="flex items-center gap-2">

          <Plus
            className="size-4 text-brand"
            aria-hidden="true"
          />


          <h4 className="font-semibold">
            {editingIndex ===
            null
              ? "Añadir ingrediente"
              : "Editar ingrediente"}
          </h4>

        </div>


        <div className="mt-4 grid gap-4 md:grid-cols-2">

          {/* QUANTITY */}

          <div>

            <label
              htmlFor={`ingredient-${group.clientId}-quantity`}
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. 250"
            />

          </div>


          {/* UNIT */}

          <div>

            <label
              htmlFor={`ingredient-${group.clientId}-unit`}
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="g, ml, cucharadas..."
            />

          </div>


          {/* NAME */}

          <div className="md:col-span-2">

            <label
              htmlFor={`ingredient-${group.clientId}-name`}
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. Patatas"
            />

          </div>


          {/* NOTES */}

          <div className="md:col-span-2">

            <label
              htmlFor={`ingredient-${group.clientId}-notes`}
              className="mb-2 block text-sm font-medium"
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
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. cortadas finas, al gusto..."
            />

          </div>

        </div>


        {/* SCALABLE */}

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-page-muted/40 p-4">

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
            className="mt-0.5 size-4 shrink-0 accent-brand"
          />


          <span>

            <span className="block text-sm font-medium">
              Adaptar cantidad al número de comensales
            </span>


            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              Desmárcalo para cantidades que no deben
              recalcularse, por ejemplo aceite para freír
              o sal al gusto.
            </span>

          </span>

        </label>


        {editorError && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-700"
          >
            {
              editorError
            }
          </p>
        )}


        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveIngredient
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
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
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
            >
              Cancelar edición
            </button>
          )}

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   INGREDIENTS FORM
========================================================= */

export function IngredientsForm({
  recipeId,
  initialGroups,
  previousStepHref,
  nextStepHref,
}: IngredientsFormProps) {
  const router =
    useRouter();


  const [
    groups,
    setGroups,
  ] =
    useState<
      EditableGroup[]
    >(
      () =>
        createEditableGroups(
          initialGroups,
        ),
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<
      string | null
    >(
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
      to <
        0 ||
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
              to <
                0 ||
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


    const ingredientCount =
      validation.data.groups.reduce(
        (
          total,
          group,
        ) =>
          total +
          group.ingredients.length,
        0,
      );


    if (
      ingredientCount <
      1
    ) {
      setValidationError(
        "Añade al menos un ingrediente para continuar.",
      );

      return;
    }


    /*
     * Si no ha cambiado nada, no necesitamos ejecutar
     * la RPC otra vez. La receta ya contiene datos
     * válidos y podemos avanzar.
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
        await updateMyRecipeIngredientsAction(
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


      setIsDirty(
        false,
      );


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
    <section className="rounded-2xl border border-border bg-surface p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 4 de 8
        </p>


        <div className="mt-2 flex items-center gap-2">

          <Utensils
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h2 className="font-serif text-2xl font-semibold">
            Ingredientes
          </h2>

        </div>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Organiza los ingredientes de tu receta por grupos
          y decide qué cantidades deben adaptarse cuando
          cambie el número de comensales.
        </p>

      </div>


      {/* =================================================
          ADD GROUP
      ================================================= */}

      <div className="mt-6 flex justify-end">

        <button
          type="button"
          onClick={
            addGroup
          }
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
        >
          <Plus
            className="size-4 text-brand"
            aria-hidden="true"
          />

          Añadir grupo
        </button>

      </div>


      {/* =================================================
          GROUPS
      ================================================= */}

      <div className="mt-5 space-y-6">

        {groups.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-page-muted/30 p-6 text-center">

            <Utensils
              className="mx-auto size-6 text-brand"
              aria-hidden="true"
            />


            <p className="mt-3 font-medium">
              Todavía no hay grupos de ingredientes.
            </p>


            <p className="mt-1 text-sm text-muted-foreground">
              Crea el primero para empezar a construir tu receta.
            </p>


            <button
              type="button"
              onClick={
                addGroup
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
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
          FEEDBACK
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
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {
            message
          }
        </p>
      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

        <Link
          href={
            previousStepHref
          }
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
        >
          ← Anterior
        </Link>


        <button
          type="button"
          disabled={
            isSubmitting
          }
          onClick={
            handleContinue
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

    </section>
  );
}
